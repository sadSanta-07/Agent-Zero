export interface GmailMessage {
  id: string;
  threadId: string;
}

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
    throw new Error("Failed to fetch emails");
  }

  return response.json();
}

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
    throw new Error("Failed to fetch message");
  }

  return response.json();
}

