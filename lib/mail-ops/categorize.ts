import { CATEGORIES, mailOpsConfig, type MailCategory } from "./config";
import { getCachedCategory, setCachedCategory, type CategoryResult } from "./cache";

const KEYWORD_RULES: Array<{ category: MailCategory; keywords: string[] }> = [
  { category: "registration", keywords: ["register", "registration", "sign up", "signup", "deadline extend"] },
  { category: "sponsorship", keywords: ["sponsor", "partnership", "collaborate", "brand"] },
  { category: "team-formation", keywords: ["team", "teammate", "solo participant", "group of"] },
  { category: "technical-dataset", keywords: ["dataset", "api", "error", "bug", "submission link", "notebook", "github"] },
  { category: "logistics-travel", keywords: ["travel", "accommodation", "venue", "visa", "reimbursement"] },
];

function heuristicCategorize(subject: string, body: string): CategoryResult {
  const text = `${subject} ${body}`.toLowerCase();
  const match = KEYWORD_RULES.find((rule) => rule.keywords.some((kw) => text.includes(kw)));
  return {
    category: match?.category ?? "general-query",
    summary: body.slice(0, 140).replace(/\s+/g, " ").trim() || subject,
    cachedAt: Date.now(),
  };
}

async function aiCategorize(subject: string, body: string): Promise<CategoryResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${mailOpsConfig.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "You triage student emails for a hackathon inbox. Reply with strict JSON only: " +
                  `{"category": one of [${CATEGORIES.join(", ")}], "summary": "one sentence summary of the ask"}\n\n` +
                  `Subject: ${subject}\n\nBody:\n${body.slice(0, 4000)}`,
              },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini request failed: ${res.status}`);

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = JSON.parse(text);

  const category: MailCategory = CATEGORIES.includes(parsed.category) ? parsed.category : "general-query";

  return {
    category,
    summary: typeof parsed.summary === "string" ? parsed.summary : body.slice(0, 140),
    cachedAt: Date.now(),
  };
}

export async function categorizeMessage(
  messageId: string,
  subject: string,
  body: string,
  forceRefresh = false,
  extra?: Partial<Pick<CategoryResult, "threadId" | "from" | "fromName" | "subject" | "date" | "unread" | "awaitingReply">>
): Promise<CategoryResult> {
  if (!forceRefresh) {
    const cached = await getCachedCategory(messageId);
    if (cached) return cached;
  }

  const base = mailOpsConfig.geminiApiKey
    ? await aiCategorize(subject, body).catch(() => heuristicCategorize(subject, body))
    : heuristicCategorize(subject, body);

  const result: CategoryResult = { ...base, ...extra };

  await setCachedCategory(messageId, result);
  return result;
}
