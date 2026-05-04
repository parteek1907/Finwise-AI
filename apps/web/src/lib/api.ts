const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function sendChatMessage(messages: Message[]): Promise<Message> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as Message;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    // Fallback response if backend is unreachable during dev
    return {
      role: "assistant",
      content: "I'm having trouble connecting to my neural net right now. Please make sure the FastAPI backend is running on port 8000."
    };
  }
}
