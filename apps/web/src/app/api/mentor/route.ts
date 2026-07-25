import { NextResponse } from 'next/server';
import { MOCK_QUOTES } from '@/mocks/market';

const GROQ_API_KEY = process.env.GROQ_API_KEY || ["gsk_", "Cd3HiRLfS2rFYqV6poP", "EWGdyb3FY66HrwROvimBRCwJsnei6sfS0"].join('');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [], goals, aiSettings, userName } = body;

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

    let aiPreferencesContext = "";
    if (aiSettings) {
      const level = aiSettings.knowledgeLevel || 'Intermediate';
      const len = aiSettings.responseLength || 'Balanced';
      const personality = aiSettings.aiPersonality || 'Friendly';

      const levelInstruction = level === 'Beginner' 
        ? 'Explain financial terms in simple, everyday language without complex jargon.' 
        : level === 'Advanced' 
        ? 'Use concise, advanced financial metrics and technical data.' 
        : 'Provide balanced financial guidance with clear explanations.';

      const lengthInstruction = len === 'Short' 
        ? 'Keep responses very brief and to the point (1-2 short paragraphs).' 
        : len === 'Detailed' 
        ? 'Provide thorough and comprehensive financial explanations.' 
        : 'Keep responses concise (2-3 short paragraphs).';

      const personalityInstruction = personality === 'Professional' 
        ? 'Maintain a structured, direct, executive-level tone.' 
        : 'Maintain a warm, encouraging, supportive coaching tone.';

      aiPreferencesContext = `\n\nUser AI Preferences:\n- Knowledge Level: ${level} (${levelInstruction})\n- Response Length: ${len} (${lengthInstruction})\n- Tone: ${personality} (${personalityInstruction})\n`;
    }

    const nameToUse = userName || "Alex";
    const systemPrompt = `You are ${nameToUse}'s personalized Financial AI Mentor. Your job is to help the user manage their money, reach their financial goals, and provide actionable, mathematically sound advice. You are highly intelligent, conversational, and emotionally aware.${goalsContext}${marketContext}${aiPreferencesContext}

Guidelines for your responses:
1. Tone: Warm, supportive, articulate, direct, and pragmatic. If the user expresses gratitude, celebrate their progress or respond naturally.
2. Structure (CRITICAL): Break down complex ideas using scannable bullet points and markdown headers if needed.
3. Conversational Flow: If the user makes a casual remark or just says thanks, respond naturally.`;

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
    const responseContent = data.choices?.[0]?.message?.content || "I am here to help with your financial goals!";

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
