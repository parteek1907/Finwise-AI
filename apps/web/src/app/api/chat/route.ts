import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [] } = body;

    let responseContent = "";
    
    let groqRes;
    let retries = 0;
    while (retries < 3) {
      groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        messages,
        temperature: 0.7,
        max_tokens: 2048
      })
    });
                        if (groqRes.status === 429) {
        let errData;
        try { errData = await groqRes.json(); } catch(e) { errData = {}; }
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

    if (!groqRes) throw new Error("No response from Groq");
    if (!groqRes.ok) throw new Error(`Groq error: ${await groqRes.text()}`);

    const data = await groqRes.json();
    responseContent = data.choices?.[0]?.message?.content || "I am here to help!";
    if (responseContent && typeof responseContent === "string") { 
      responseContent = responseContent.replace(/<think>[\s\S]*?<\/think>\n?/gi, "").trim(); 
    }
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
