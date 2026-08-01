import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();
    if (!goal) {
      return NextResponse.json({ error: "Goal required" }, { status: 400 });
    }

    const currencySymbol = goal.currency === 'INR' ? '₹' : goal.currency === 'EUR' ? '€' : goal.currency === 'GBP' ? '£' : '$';

    const prompt = `You are a financial AI. The user has a financial goal:
Name: ${goal.name}
Category: ${goal.category}
Target: ${currencySymbol}${goal.target?.toLocaleString()}
Current Saved: ${currencySymbol}${goal.current?.toLocaleString()}
Deadline: ${goal.deadline}
Currency: ${goal.currency || 'USD'}
Contributions: ${goal.contributions?.length || 0}

Based on this exact progress and deadline, provide exactly 2 highly relevant, specific, and actionable suggestions to help the user achieve this goal faster. Use ${currencySymbol} for any monetary amounts. Return the response in ONLY valid JSON format matching this schema:
{
  "suggestions": [
    {"title": "Short Title", "description": "Detailed 1-2 sentence suggestion."}
  ]
}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) {
      throw new Error(`Groq API failed with status ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{"suggestions":[]}');

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating goal suggestions:", error);
    return NextResponse.json({
      suggestions: [
        {"title": "Automate Contributions", "description": "Set up a recurring transfer on payday to ensure consistent progress."},
        {"title": "Review Budget", "description": "Look for unused subscriptions to cancel and reallocate to this goal."}
      ]
    });
  }
}
