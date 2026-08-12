// Recipient validation for batch sends. This is a structural + curated-typo
// heuristic, NOT real deliverability verification (no MX lookup) — it exists
// to catch the obviously-broken entries that show up in hand-pasted
// participant lists (missing "@", stray spaces, doubled TLDs) before they're
// silently Bcc'd or silently block an entire batch.

export interface InvalidRecipient {
  email: string;
  reason: string;
}

export interface ValidationResult {
  valid: string[];
  invalid: InvalidRecipient[];
}

const STRUCTURAL_RE = /^[^\s@,;]+@[^\s@,;]+\.[a-zA-Z]{2,}$/;

const SUSPICIOUS_PATTERNS: Array<{ re: RegExp; reason: string }> = [
  { re: /\.(coom|con|cmo|comm|og|orgg|inn)$/i, reason: "unrecognized / likely-typo TLD" },
  { re: /@(gmial|gnail|gmal|gmai|gamil)\./i, reason: "likely typo of gmail.com" },
  { re: /@(yahooo|outlok|hotmial)\./i, reason: "likely typo of a common provider" },
];

export function validateRecipients(raw: string[]): ValidationResult {
  const valid: string[] = [];
  const invalid: InvalidRecipient[] = [];
  const seen = new Set<string>();

  for (const entry of raw) {
    const email = entry.trim();
    if (!email) continue;

    if (!STRUCTURAL_RE.test(email)) {
      invalid.push({ email, reason: "malformed (missing @ / domain / stray characters)" });
      continue;
    }

    const suspicious = SUSPICIOUS_PATTERNS.find((p) => p.re.test(email));
    if (suspicious) {
      invalid.push({ email, reason: suspicious.reason });
      continue;
    }

    const key = email.toLowerCase();
    if (seen.has(key)) continue; // duplicate, silently drop — not an error
    seen.add(key);
    valid.push(email);
  }

  return { valid, invalid };
}
