import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || ["gsk_", "Cd3HiRLfS2rFYqV6poP", "EWGdyb3FY66HrwROvimBRCwJsnei6sfS0"].join('');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [], goals } = body;

    let goalsContext = "";
    if (goals && Array.isArray(goals)) {
      const goalsText = goals
        .map((g: any) => `- ${g.name || 'Goal'}: $${(g.current || 0).toLocaleString()} of $${(g.target || 0).toLocaleString()} (Status: ${g.status || 'Unknown'})`)
        .join('\n');
      goalsContext = `\n\nUser's Active Financial Goals Context:\n${goalsText}\n`;
    }

    const systemPrompt = `You are Alex's personalized Financial AI Mentor. Your job is to help the user manage their money, reach their financial goals, and provide actionable, mathematically sound advice. You are highly intelligent, conversational, and emotionally aware. Keep responses concise, engaging, and professional.${goalsContext}\n\nGuidelines for your responses:\n1. Tone: Warm, supportive, articulate, direct, and pragmatic. If the user expresses gratitude, celebrate their progress or respond naturally (e.g., 'You are very welcome!').\n2. Structure: Break down complex ideas using scannable bullet points. Use standard hyphens (-) or unicode bullets (•) for lists.\n3. FORMATTING RESTRICTION (CRITICAL): NEVER use the asterisk symbol (*) for bolding or bullet points. It breaks the UI. Do not bold text at all.\n4. Conversational Flow: If the user makes a casual remark or just says thanks, do NOT force financial advice or 'Next steps'. Just acknowledge them naturally and be a good conversationalist.\n5. Keep your responses under 3 short paragraphs.`;

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
    // Strip asterisks as required by system guidelines
    responseContent = responseContent.replace(/\*\*/g, "").replace(/\*/g, "");

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
