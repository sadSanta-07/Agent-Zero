export interface GmailMessage {
  id: string;
  threadId: string;
}

/**
 * @param token 
 */
export async function getUnreadEmails(token: string) {
  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread newer_than:7d",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Gmail API Error: Failed to fetch inbox data (Status: ${response.status})`);
  }

  return response.json();
}

/**
 * @param token 
 * @param messageId 
 */
export async function getEmailDetails(
  token: string,
  messageId: string
) {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Gmail API Error: Failed to fetch message details (Status: ${response.status})`);
  }

  return response.json();
}