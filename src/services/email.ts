export interface ParsedEmailDraft {
  to: string;
  subject: string;
  body: string;
}

/**
 * Parses an AI-generated raw text draft into structured email components.
 * Safely extracts TO, SUBJECT, and BODY fields using unbreakable regex lookaheads.
 */
export function parseEmailDraft(draft: string): ParsedEmailDraft {
  if (!draft) return { to: "operator@internal.system", subject: "Automated Dispatch", body: "" };

  // THE FIX: Unbreakable regex that stops at a newline OR the next keyword!
  const toMatch = draft.match(/TO:\s*(.*?)(?=\n|SUBJECT:|$)/i);
  const subMatch = draft.match(/SUBJECT:\s*(.*?)(?=\n|BODY:|$)/i);
  const bodyMatch = draft.match(/BODY:\s*([\s\S]*)/i);

  return {
    to: toMatch ? toMatch[1].trim() : "operator@internal.system",
    subject: subMatch ? subMatch[1].trim() : "Automated System Dispatch",
    body: bodyMatch ? bodyMatch[1].trim() : draft
  };
}

/**
 * Encodes email content into a base64url string strictly compliant with the Gmail API.
 * Safely handles UTF-8 character encoding to prevent malformed text in transit.
 */
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