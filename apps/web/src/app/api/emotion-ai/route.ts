import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY!;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const systemPrompt = `You are a deeply analytical, psychological market sentiment analyzer. 
Your objective is to read a user's statement about finance/investing and extract their exact emotional state, their confidence level in that state, and the hidden cognitive biases they are exhibiting.

SCORING RUBRIC FOR CONFIDENCE & BIASES:
- Confidence (0-100%): This must reflect how strongly the user is exhibiting the emotion or bias, NOT just how obvious the situation is. 
If the user explicitly expresses doubt, uncertainty, or skepticism (e.g., 'I am not sure', 'Should I do it?'), the confidence score MUST be lower (30-60%) because their bias is not fully cemented. 
If they are completely resolute and acting blindly (e.g., 'I am going all in!'), confidence should be high (80-100%).
- Biases: MUST specifically identify well-known behavioral finance/cognitive biases (e.g., Gullibility, Greed, FOMO, Confirmation Bias, Trust Bias, Loss Aversion). 
Do not just say 'Uncertainty'. Dig deeper into their psychological vulnerability.

CRITICAL INSTRUCTION: If the user asks an irrelevant, non-financial question, you MUST NOT analyze them financially. You MUST set 'emotion' to 'Irrelevant', 'confidence' to 0, 'risk' to 'None', 'biases' to [], and 'summary' to 'This query is not related to finance, investing, or market psychology.', and provide an empty array for recommendations.

CRITICAL: You MUST return ONLY valid JSON matching this schema. Do NOT output any reasoning, comments (NO // or /*), or <think> tags. Only output the JSON object:
{
  "emotion": "<string: e.g. Greed, Panic, FOMO, Uncertainty>",
  "confidence": <number: integer 0-100>,
  "risk": "<string: Low, Medium, High, Very High, or None>",
  "biases": ["<string: e.g. Authority Bias, Gullibility>"],
  "summary": "<string: A grounded, logical summary explaining exactly why they feel this way and the true reality of the situation.>",
  "recommendations": ["<string: actionable step 1>", "<string: actionable step 2>", "<string: actionable step 3>"]
}
`;

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
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.1,
          max_tokens: 2048
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
    if (!groqRes.ok) {
      throw new Error(`Groq error: ${await groqRes.text()}`);
    }

    const data = await groqRes.json();
    let responseContent = data.choices?.[0]?.message?.content || "";
    if (responseContent && typeof responseContent === "string") { 
      responseContent = responseContent.replace(/<think>[\s\S]*?<\/think>\n?/gi, "").trim(); 
    }
    
    if (!responseContent) {
        throw new Error("No content returned from APIs");
    }

    // Robust JSON extraction
    const firstBrace = responseContent.indexOf('{');
    const lastBrace = responseContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      responseContent = responseContent.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error("No valid JSON object found in response");
    }

    return NextResponse.json(JSON.parse(responseContent));
  } catch (error) {
    console.error("Error in emotion-ai endpoint:", error);
    return NextResponse.json({ error: "Failed to analyze emotion." }, { status: 500 });
  }
}
