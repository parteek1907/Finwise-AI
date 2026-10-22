import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message = "" } = body;

    let res;
    let retries = 0;
    while (retries < 3) {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        messages: [
          { role: "system", content: "You are a helpful assistant. Create a concise, 3-5 word title for a chat based on the user's first message. Do NOT use quotes or punctuation in the output. Just the raw text." },
          { role: "user", content: `Generate a title for this message: ${message}` }
        ],
        temperature: 0.3,
        max_tokens: 2048
      })
    });
                        if (res.status === 429) {
        let errData;
        try { errData = await res.json(); } catch(e) { errData = {}; }
        let waitTime = 5000;
        if (errData?.error?.message) {
            const match = errData.error.message.match(/try again in (\d+\.?\d*)s/);
            if (match) {
                waitTime = (parseFloat(match[1]) * 1000) + 1000;
            }
        }
        console.warn(`Groq rate limit hit (429), waiting ${waitTime}ms and retrying...`);
        await new Promise(r => setTimeout(r, waitTime));
        retries++;
        continue;
      }
      break;
    }

    if (!res) throw new Error("No response from Groq");
    if (!res.ok) {
      throw new Error("Title generation failed");
    }

    const data = await res.json();
    let title = data.choices?.[0]?.message?.content?.trim() || "New Chat";
    if (title && typeof title === "string") { title = title.replace(/<think>[\s\S]*?<\/think>\n?/gi, "").trim(); }
    if (title.startsWith('"') && title.endsWith('"')) {
      title = title.slice(1, -1);
    }

    return NextResponse.json({ title });
  } catch (error) {
    return NextResponse.json({ title: "New Chat" });
  }
}
