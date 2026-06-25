import { getUnreadEmails, getEmailDetails } from "../services/gmailService";

// Define a minimal interface for the Gmail API message stub to remove 'any'
interface GmailMessageStub {
  id: string;
  threadId?: string;
}

/**
 * Scans the user's inbox for unread emails and retrieves their full details.
 * * @param token - The active Google OAuth access token.
 * @param maxResults - The maximum number of emails to process (defaults to 10).
 * @returns A promise resolving to an array of detailed email objects.
 */
export async function scanInbox(token: string, maxResults: number = 10) {
  try {
    const unread = await getUnreadEmails(token);

    const messages: GmailMessageStub[] = unread?.messages || [];

    if (messages.length === 0) {
      return [];
    }

    const emailData = await Promise.all(
      messages.slice(0, maxResults).map((msg) =>
        getEmailDetails(token, msg.id)
      )
    );

    return emailData;
  } catch (error) {
    console.error("Inbox Scan Error: Failed to retrieve or parse email data.", error);
    throw error;
  }
}