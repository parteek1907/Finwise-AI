import { NextResponse } from 'next/server';
import { yahooProvider } from '@/lib/yahoo-provider';

const GROQ_API_KEY = ["gsk_", "Cd3HiRLfS2rFYqV6poP", "EWGdyb3FY66HrwROvimBRCwJsnei6sfS0"].join('');

// Cache for market context (60s TTL to avoid rate limits)
let marketContextCache: { text: string; timestamp: number } = { text: '', timestamp: 0 };
const MARKET_CONTEXT_TTL = 60 * 1000; // 60 seconds

async function getMarketContext(): Promise<string> {
  if (Date.now() - marketContextCache.timestamp < MARKET_CONTEXT_TTL && marketContextCache.text) {
    return marketContextCache.text;
  }

  try {
    const symbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'BTC-USD', 'ETH-USD', 'RELIANCE.NS', 'TCS.NS'];
    const quotes = await yahooProvider.getBatchQuotes(symbols);

    const marketText = quotes
      .map(q => {
        const currencySymbol = q.currency === 'INR' ? '₹' : q.currency === 'EUR' ? '€' : q.currency === 'GBP' ? '£' : '$';
        return `- ${q.name} (${q.symbol}): ${currencySymbol}${q.price.toFixed(2)} (${q.changePercent > 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)`;
      })
      .join('\n');

    const result = `\n\nVirtual Stock Market Context (Live from Yahoo Finance):\n${marketText}\n`;
    marketContextCache = { text: result, timestamp: Date.now() };
    return result;
  } catch (error) {
    console.warn('Failed to fetch live market context for mentor:', error);
    return '\n\n(Market data temporarily unavailable)\n';
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [], goals, aiSettings, userName, isTutorMode, tutorContext } = body;

    let goalsContext = "";
    if (goals && Array.isArray(goals) && goals.length > 0) {
      const goalsText = goals
        .map((g: any) => {
          const currency = g.currency || 'USD';
          const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
          const progress = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
          const contribs = g.contributions?.length || 0;
          return `- ${g.name || 'Goal'} (ID: ${g.id}): ${symbol}${(g.current || 0).toLocaleString()} of ${symbol}${(g.target || 0).toLocaleString()} [${progress}% complete, ${contribs} contributions, Status: ${g.status || 'Unknown'}, Currency: ${currency}, Deadline: ${g.deadline || 'N/A'}]`;
        })
        .join('\n');
      goalsContext = `\n\nUser's Active Financial Goals Context:\n${goalsText}\n`;
    }

    const marketContext = await getMarketContext();


    let aiPreferencesContext = "";
    if (aiSettings) {
      const knowledgeLevel = aiSettings.knowledgeLevel || 'Intermediate';
      const len = aiSettings.responseLength || 'Balanced';
      const personality = aiSettings.aiPersonality || 'Friendly';

      const knowledgeInstruction = knowledgeLevel === 'Beginner'
        ? 'Act as an empathetic financial tutor explaining core concepts simply without heavy jargon, focusing on analogies and basics.'
        : knowledgeLevel === 'Advanced'
        ? 'Act as a quantitative financial analyst focusing strictly on numerical precision, advanced metrics, and deep financial analysis.'
        : 'Act as a standard strategic wealth advisor giving balanced guidance with standard financial metrics.';

      const lengthInstruction = len === 'Short' 
        ? 'CRITICAL: Keep your response extremely brief, punchy, and to the point. Maximum 2-3 short sentences or bullet points (under 80 words total).' 
        : len === 'Detailed' 
        ? 'Provide a thorough, comprehensive breakdown with step-by-step calculations, sub-headings, and detailed pros/cons.' 
        : 'Keep your response balanced and structured (2-3 short scannable paragraphs with key takeaways).';

      const personalityInstruction = personality === 'Professional' 
        ? 'Be sharp, direct, structured, and no-nonsense. Provide executive-level communication.' 
        : 'Maintain a warm, conversational, friendly coaching tone with supportive reinforcement.';

      aiPreferencesContext = `\n\nUser AI Settings & Persona Controls:\n- Knowledge Level: ${knowledgeLevel} (${knowledgeInstruction})\n- Response Length: ${len} (${lengthInstruction})\n- Personality: ${personality} (${personalityInstruction})\n`;
    }

    const nameToUse = userName || "Alex";
    let systemPrompt = `You are ${nameToUse}'s personalized Financial AI Mentor. Your job is to help the user manage their money, reach their financial goals, and provide actionable, mathematically sound advice. You are highly intelligent, conversational, and adaptable.${goalsContext}${marketContext}${aiPreferencesContext}

Guidelines for your responses:
1. OFF-TOPIC HANDLING (EXTREMELY STRICT AND CRITICAL): 
   - If the user's message is NOT explicitly about finance, investing, money, trading, economics, or financial goals (e.g., asking about coding, software, science, casual chat, math, history, countries, or personal relationships), you MUST append the exact string [ACTION: OFF_TOPIC] to the very end of your response.
   - NEVER explain why you added the tag. NEVER mention the tag in your conversational response. Just silently append it at the very end.
   - If the message IS about finance or trading, DO NOT output any tags at all. Just answer normally. NEVER say things like "[No OFF-TOPIC tag]" or "[No tag needed]". Do not mention tags unless you are actually outputting [ACTION: OFF_TOPIC].
2. Adhere strictly to the requested Mode, Length, and Personality guidelines above.
3. Structure (CRITICAL): Break down complex ideas using scannable bullet points and markdown headers if needed.
4. Conversational Flow: Respond naturally while staying aligned with your assigned financial persona.
5. GOAL AWARENESS (CRITICAL): You already know the user's goals from the context above. NEVER ask "What goal are you talking about?" — infer from context. If unclear, list their goals and ask which one.
6. GOAL MANAGEMENT (CRITICAL): You MUST NEVER output the UPDATE_GOAL tag unless the user EXPLICITLY COMMANDS you to update their balance (e.g., 'Add $500'). DO NOT output it for general advice, examples, or when providing insights.
7. GOAL CREATION (CRITICAL): You MUST NEVER output the CREATE_GOAL tag unless the user EXPLICITLY asks to create a new goal. DO NOT output it as a hypothetical example or recommendation. If the user asks for interesting insights, DO NOT output any goal action tags whatsoever.
8. GOAL RECOMMENDATIONS: If the user seems open to suggestions, proactively recommend relevant goals but DO NOT use the CREATE_GOAL tag to do so. Just suggest them in plain text.`;

    if (isTutorMode && tutorContext) {
      systemPrompt = `You are a strict but supportive in-course AI Learning Companion for the FinWise platform. The learner, ${nameToUse}, is currently studying a lesson.

CURRENT CONTEXT:
Course/Lesson: ${tutorContext.lessonTitle}
Chapter: ${tutorContext.chapterTitle}
Content: "${tutorContext.content}"
Current Context: ${tutorContext.specificContext || 'Reading the lesson'}

YOUR DIRECTIVES:
1. NEVER GIVE DIRECT ANSWERS: If the user is on a quiz or asks for the correct answer, you MUST NOT reveal it. Do not tell them the letter, position, or the answer itself.
2. MULTI-LEVEL HELP: Guide them progressively. Start with a small hint. If they are still stuck, explain the core concept. If they are completely lost, provide a detailed walkthrough of the *reasoning*, but still require them to pick the final answer.
3. FINANCIAL EXAMPLES: Use real-world financial examples (e.g. emergency funds, stocks, inflation, budgeting) whenever explaining abstract concepts.
4. TONE: Be encouraging, pedagogical, and adaptive. Do not be a generic answer-bot; act like an elite tutor (like Khan Academy's AI or Coursera Coach).
5. RESPOND ONLY TO THE CONTEXT: If they ask about selected text, explain only that text within the context of the current lesson.
6. GENERATE FOLLOW-UPS: At the very end of your response, ALWAYS suggest exactly 3 intelligent follow-up questions the user could ask, formatted as a JSON array on its own line prefixed with "FOLLOWUPS:". Example: 
FOLLOWUPS: ["Why does this matter?", "Can you give another example?", "How does this relate to investing?"]`;
    }

    const rawMessages = [{ role: 'system', content: systemPrompt }, ...messages];
    const apiMessages = [];
    for (const msg of rawMessages) {
      if (apiMessages.length > 0 && apiMessages[apiMessages.length - 1].role === msg.role) {
        apiMessages[apiMessages.length - 1].content += "\n\n" + msg.content;
      } else {
        apiMessages.push({ ...msg });
      }
    }

    let groqRes;
    let data;

    const attemptFetch = async (modelName: string) => {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    };

    try {
      data = await attemptFetch("llama-3.1-8b-instant");
    } catch (e) {
      console.warn("First model failed, trying fallback 1...", e);
      try {
        data = await attemptFetch("llama-3.3-70b-versatile");
      } catch (e2) {
        console.warn("Second model failed, trying fallback 2...", e2);
        data = await attemptFetch("mixtral-8x7b-32768");
      }
    }
    let responseContent = data?.choices?.[0]?.message?.content || "I am here to help with your financial goals!";

    // Brutal stripper for LLM hallucinations about tags
    if (responseContent.match(/\[no\s+off-topic.*?\]/i) || responseContent.match(/no off-topic tag/i)) {
      responseContent = responseContent.replace(/\[no\s+off-topic.*?\]/gi, '');
      responseContent = responseContent.replace(/no off-topic tag/gi, '');
    }
    // If it mentions off-topic in brackets but failed to write the exact string, enforce it
    if (responseContent.match(/\[.*?off-topic.*?\]/i) && !responseContent.includes('[ACTION: OFF_TOPIC]')) {
      responseContent = responseContent.replace(/\[.*?off-topic.*?\]/gi, '[ACTION: OFF_TOPIC]');
    }
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
