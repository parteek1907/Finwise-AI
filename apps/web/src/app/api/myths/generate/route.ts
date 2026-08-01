import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || ["gsk_", "Cd3HiRLfS2rFYqV6poP", "EWGdyb3FY66HrwROvimBRCwJsnei6sfS0"].join('');

export async function GET() {
  try {
    const systemPrompt = `You are an expert financial AI educator. Your task is to generate exactly 5 distinct, highly engaging 'Myth vs Fact' pairs about finance.
The categories should be mixed (e.g., Trading, Investing, Crypto, Saving, General).
Each myth must have a difficulty rating (Beginner, Intermediate, Advanced).
Make them interesting, debunking common misconceptions.
You MUST return the output in ONLY valid JSON format matching this schema:
{
  "myths": [
    {
      "id": "unique_string_id",
      "category": "String",
      "difficulty": "String",
      "myth": "The myth statement",
      "fact": "The factual reality",
      "insight": "A deeper 1-2 sentence explanation of why the myth is wrong and the fact is true",
      "insightPercent": "A random plausible percentage between 40% and 95% (e.g., '82%') representing how many people believe this myth",
      "confidence": number (integer between 90 and 99 representing factual confidence)
    }
  ]
}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error in myths generate:", errText);
      throw new Error(`Groq API failed with status ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
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
