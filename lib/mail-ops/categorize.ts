import Anthropic from "@anthropic-ai/sdk";
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
  const client = new Anthropic({ apiKey: mailOpsConfig.anthropicApiKey });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system:
      "You triage student emails for a hackathon inbox. Reply with strict JSON only: " +
      `{"category": one of [${CATEGORIES.join(", ")}], "summary": "one sentence summary of the ask"}`,
    messages: [
      {
        role: "user",
        content: `Subject: ${subject}\n\nBody:\n${body.slice(0, 4000)}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const parsed = JSON.parse(textBlock && "text" in textBlock ? textBlock.text : "{}");

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
  forceRefresh = false
): Promise<CategoryResult> {
  if (!forceRefresh) {
    const cached = await getCachedCategory(messageId);
    if (cached) return cached;
  }

  const result = mailOpsConfig.anthropicApiKey
    ? await aiCategorize(subject, body).catch(() => heuristicCategorize(subject, body))
    : heuristicCategorize(subject, body);

  await setCachedCategory(messageId, result);
  return result;
}
