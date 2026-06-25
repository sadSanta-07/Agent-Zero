export interface ParsedEmailDraft {
  to: string;
  subject: string;
  body: string;
}

/**
 * Parses an AI-generated raw text draft into structured email components.
 * Safely extracts TO, SUBJECT, and BODY fields using regex pattern matching.
 */
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
    to: toMatch?.[1].trim() ?? "operator@internal.system",
    subject: subjectMatch?.[1].trim() ?? "Automated System Dispatch",
    body,
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