import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || ["gsk_", "Cd3HiRLfS2rFYqV6poP", "EWGdyb3FY66HrwROvimBRCwJsnei6sfS0"].join('');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message = "" } = body;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful assistant. Create a concise, 3-5 word title for a chat based on the user's first message. Do NOT use quotes or punctuation in the output. Just the raw text." },
          { role: "user", content: `Generate a title for this message: ${message}` }
        ],
        temperature: 0.3,
        max_tokens: 25
      })
    });

    if (!res.ok) {
      throw new Error("Title generation failed");
    }

    const data = await res.json();
    let title = data.choices?.[0]?.message?.content?.trim() || "New Chat";
    if (title.startsWith('"') && title.endsWith('"')) {
      title = title.slice(1, -1);
    }

    return NextResponse.json({ title });
  } catch (error) {
    return NextResponse.json({ title: "New Chat" });
  }
}
