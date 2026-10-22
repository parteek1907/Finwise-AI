import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY!;

export async function GET() {
  try {
    const systemPrompt = `You are an expert financial AI educator. Your task is to generate exactly 5 distinct, highly engaging 'Myth vs Fact' pairs about finance.
The categories should be mixed (e.g., Trading, Investing, Crypto, Saving, General).
Each myth must have a difficulty rating (Beginner, Intermediate, Advanced).
Make them interesting, debunking common misconceptions.

CRITICAL: You MUST return the output in ONLY valid JSON format matching the EXACT structure below. Do NOT output any reasoning, comments (NO // or /*), or extra text.
CRITICAL: You MUST generate EXACTLY 5 myths inside the array. Do NOT generate just 1.
Your entire response must consist ONLY of the JSON object. Do not add any conversational text before or after the JSON.

EXAMPLE JSON OUTPUT FORMAT (Make sure your array has 5 objects like this):
{
  "myths": [
    {
      "id": "myth_trading_1",
      "category": "Trading",
      "difficulty": "Advanced",
      "myth": "Day trading guarantees easy money if you follow a set strategy.",
      "fact": "Over 90% of day traders lose money. The market is highly unpredictable and requires years of disciplined risk management.",
      "insight": "Algorithms and institutional traders have huge advantages. Success requires strict emotional control, not just a simple strategy.",
      "insightPercent": "88%",
      "confidence": 99
    }
  ]
}`;

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
          model: "openai/gpt-oss-20b",
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Generate the 5 myths now.' }],
          temperature: 0.8,
          max_tokens: 4000
        })
      });

      if (groqRes.status === 429) {
        let errData;
        try { errData = await groqRes.clone().json(); } catch(e) { errData = {}; }
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

    if (!groqRes) throw new Error("Failed to fetch from Groq");
    if (!groqRes.ok) throw new Error(`Groq API error: ${await groqRes.text()}`);

    const data = await groqRes.json();
    let content = data.choices?.[0]?.message?.content || "";
    if (content && typeof content === "string") { 
      content = content.replace(/<think>[\s\S]*?<\/think>\n?/gi, "").trim(); 
    }

    if (!content) throw new Error("No content returned from APIs");

    // Robust JSON extraction
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error("No valid JSON object found in response");
    }

    console.log("JSON CONTENT TO PARSE:", content);
    const jsonContent = JSON.parse(content);
    
    // Check if the response contains exactly 5 myths
    if (jsonContent.myths && Array.isArray(jsonContent.myths)) {
        return NextResponse.json(jsonContent);
    } else {
        throw new Error("Invalid format from AI");
    }
  } catch (error) {
    console.error("Error in myths generate endpoint:", error);
    return NextResponse.json({ error: "Failed to generate myths." }, { status: 500 });
  }
}
