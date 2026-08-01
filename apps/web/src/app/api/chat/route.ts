import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [] } = body;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!res.ok) {
      throw new Error(`Groq API failed with status ${res.status}`);
    }

    const data = await res.json();
    let responseContent = data.choices?.[0]?.message?.content || "I am here to help!";
    responseContent = responseContent.replace(/\*\*/g, "").replace(/\*/g, "");

    return NextResponse.json({
      role: "assistant",
      content: responseContent
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json({
      role: "assistant",
      content: "I'm having trouble thinking right now. Please try again in a moment."
    });
  }
}
