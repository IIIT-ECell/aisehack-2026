import { google, gmail_v1 } from "googleapis";

export interface MailSummary {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
}

export interface MailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  bodyText: string;
  messageIdHeader: string;
  references: string;
}

export interface MailThread {
  id: string;
  subject: string;
  messages: MailMessage[];
}

function gmailClient(accessToken: string): gmail_v1.Gmail {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

function headerValue(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function parseNameEmail(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.*?)\s*<(.+)>$/);
  if (match) {
    return { name: match[1].replace(/"/g, "").trim() || match[2], email: match[2].trim() };
  }
  return { name: raw, email: raw };
}

function decodeBody(part: gmail_v1.Schema$MessagePart | undefined): string {
  if (!part) return "";

  if (part.mimeType === "text/plain" && part.body?.data) {
    return Buffer.from(part.body.data, "base64").toString("utf-8");
  }

  if (part.parts) {
    const plain = part.parts.find((p) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decodeBody(plain);

    const html = part.parts.find((p) => p.mimeType === "text/html");
    if (html?.body?.data) {
      const raw = Buffer.from(html.body.data, "base64").toString("utf-8");
      return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    for (const nested of part.parts) {
      const text = decodeBody(nested);
      if (text) return text;
    }
  }

  if (part.body?.data) {
    return Buffer.from(part.body.data, "base64").toString("utf-8");
  }

  return "";
}

export async function listMail(
  accessToken: string,
  query: string,
  pageToken?: string
): Promise<{ items: MailSummary[]; nextPageToken?: string }> {
  const gmail = gmailClient(accessToken);

  const list = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 25,
    pageToken,
  });

  const ids = list.data.messages ?? [];
  const items = await Promise.all(
    ids.map(async (m) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });
      const headers = msg.data.payload?.headers;
      const { name, email } = parseNameEmail(headerValue(headers, "From"));
      return {
        id: msg.data.id!,
        threadId: msg.data.threadId!,
        from: email,
        fromName: name,
        subject: headerValue(headers, "Subject") || "(no subject)",
        snippet: msg.data.snippet ?? "",
        date: headerValue(headers, "Date"),
        unread: (msg.data.labelIds ?? []).includes("UNREAD"),
      } satisfies MailSummary;
    })
  );

  return { items, nextPageToken: list.data.nextPageToken ?? undefined };
}

export async function getThread(accessToken: string, threadId: string): Promise<MailThread> {
  const gmail = gmailClient(accessToken);
  const thread = await gmail.users.threads.get({ userId: "me", id: threadId, format: "full" });

  const messages: MailMessage[] = (thread.data.messages ?? []).map((m) => {
    const headers = m.payload?.headers;
    return {
      id: m.id!,
      from: headerValue(headers, "From"),
      to: headerValue(headers, "To"),
      subject: headerValue(headers, "Subject"),
      date: headerValue(headers, "Date"),
      bodyText: decodeBody(m.payload) || m.snippet || "",
      messageIdHeader: headerValue(headers, "Message-Id"),
      references: headerValue(headers, "References"),
    };
  });

  return {
    id: thread.data.id!,
    subject: messages[0]?.subject || "(no subject)",
    messages,
  };
}

// RFC 2047 encoded-word: message headers must be 7-bit ASCII, so any
// non-ASCII subject (em dashes, curly quotes, etc.) has to be wrapped like
// this or clients fall back to decoding the raw UTF-8 bytes as Latin-1,
// producing mojibake (e.g. "—" showing up as "Ã¢Â€Â”").
function encodeHeaderValue(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}

export async function sendReply(
  accessToken: string,
  params: { threadId: string; to: string; subject: string; body: string; inReplyTo: string; references: string }
): Promise<void> {
  const gmail = gmailClient(accessToken);

  const subject = params.subject.startsWith("Re:") ? params.subject : `Re: ${params.subject}`;
  const headerLines = [
    `To: ${params.to}`,
    `Subject: ${encodeHeaderValue(subject)}`,
    params.inReplyTo ? `In-Reply-To: ${params.inReplyTo}` : "",
    `References: ${[params.references, params.inReplyTo].filter(Boolean).join(" ")}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    params.body,
  ].filter((line) => line !== "");

  const raw = Buffer.from(headerLines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw, threadId: params.threadId },
  });
}

// RFC 5322 header folding: continuation lines start with a space. Needed
// because a 100-address Bcc line can otherwise be a single very long line.
function foldAddressHeader(name: string, addresses: string[]): string {
  return `${name}: ${addresses.join(",\r\n ")}`;
}

export async function sendBulkBcc(
  accessToken: string,
  params: { to: string; cc: string[]; bcc: string[]; subject: string; body: string }
): Promise<void> {
  const gmail = gmailClient(accessToken);

  const headerLines = [
    foldAddressHeader("To", [params.to]),
    params.cc.length ? foldAddressHeader("Cc", params.cc) : "",
    foldAddressHeader("Bcc", params.bcc),
    `Subject: ${encodeHeaderValue(params.subject)}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    params.body,
  ].filter((line) => line !== "");

  const raw = Buffer.from(headerLines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // No threadId — this is a fresh compose, not a threaded reply.
  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}
