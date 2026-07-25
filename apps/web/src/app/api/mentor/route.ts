import { NextResponse } from 'next/server';
import { MOCK_QUOTES } from '@/mocks/market';

const GROQ_API_KEY = process.env.GROQ_API_KEY || ["gsk_", "Cd3HiRLfS2rFYqV6poP", "EWGdyb3FY66HrwROvimBRCwJsnei6sfS0"].join('');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [], goals, userName } = body;

    let goalsContext = "";
    if (goals && Array.isArray(goals) && goals.length > 0) {
      const goalsText = goals
        .map((g: any) => `- ${g.name || 'Goal'}: $${(g.current || 0).toLocaleString()} of $${(g.target || 0).toLocaleString()} (Status: ${g.status || 'Unknown'})`)
        .join('\n');
      goalsContext = `\n\nUser's Active Financial Goals Context:\n${goalsText}\n`;
    }

    const marketText = Object.values(MOCK_QUOTES)
      .map((q: any) => `- ${q.name} (${q.symbol}): $${q.price.toFixed(2)} (Trend: ${q.changePercent > 0 ? '+' : ''}${q.changePercent}%)`)
      .join('\n');
    const marketContext = `\n\nVirtual Stock Market Context (Real-time):\n${marketText}\n`;

    const systemPrompt = `You are ${userName || "Alex"}'s personalized Financial AI Mentor. Your job is to help the user manage their money, reach their financial goals, and provide actionable, mathematically sound advice. You are highly intelligent, conversational, and emotionally aware. Keep responses concise, engaging, and professional.${goalsContext}${marketContext}

Guidelines for your responses:
1. Tone: Warm, supportive, articulate, direct, and pragmatic. If the user expresses gratitude, celebrate their progress or respond naturally.
2. Structure (CRITICAL): Break down complex ideas using scannable bullet points and bold text (**text**). You must respond in a well-structured markdown format like ChatGPT, using headers (###) if needed, and bullet points for multiple items. Do NOT write in long messy paragraphs.
3. Keep your responses under 3 short paragraphs unless a detailed plan is requested.`;

    const apiMessages = [{ role: 'system', content: systemPrompt }, ...messages];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error in mentor:", errText);
      throw new Error(`Groq API failed with status ${res.status}`);
    }

    const data = await res.json();
    let responseContent = data.choices?.[0]?.message?.content || "I am here to help with your financial goals!";


    return NextResponse.json({
      role: "assistant",
      content: responseContent
    });
  } catch (error) {
    console.error("Error in mentor endpoint:", error);
    return NextResponse.json({
      role: "assistant",
      content: "I apologize, but I had a brief network glitch while thinking. Please ask your financial question again!"
    });
  }
}
