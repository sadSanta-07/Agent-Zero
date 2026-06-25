export interface ParsedEmailDraft {
  to: string;
  subject: string;
  body: string;
}

export function parseEmailDraft(draft: string): ParsedEmailDraft {
  if (!draft) return { to: "", subject: "", body: "" };

  const toMatch = draft.match(/^TO:\s*([^\n]+)/mi);
  const subjectMatch = draft.match(/^SUBJECT:\s*([^\n]+)/mi);
  const bodyIndex = draft.toUpperCase().indexOf("BODY:");
  const body = bodyIndex !== -1
    ? draft.substring(bodyIndex + 5).trim()
    : draft
        .replace(/^TO:\s*[^\n]*\n?/mi, "")
        .replace(/^SUBJECT:\s*[^\n]*\n?/mi, "")
        .trim();

  return {
    to: toMatch?.[1].trim() ?? "sahilsingh107433@gmail.com",
    subject: subjectMatch?.[1].trim() ?? "Agent Zero Proxy Dispatch",
    body,
  };
}

export function createRawEmail(
  to: string,
  from: string,
  subject: string,
  message: string,
): string {
  const content = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "MIME-Version: 1.0",
    "Content-Transfer-Encoding: 7bit",
    "",
    message,
  ].join("\r\n");

  const bytes = new TextEncoder().encode(content);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
