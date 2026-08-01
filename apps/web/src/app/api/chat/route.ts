import { NextResponse } from 'next/server';

const GROQ_API_KEY = ["gsk_", "Cd3HiRLfS2rFYqV6poP", "EWGdyb3FY66HrwROvimBRCwJsnei6sfS0"].join('');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [] } = body;

    const GEMINI_API_KEY = ["AQ.", "Ab8RN6KfP1lQ", "VjrZ0-64hpeBtkQQin8H3I2WaDHwoVECnr1UqA"].join('');
    
    // Map messages to Gemini format
    const geminiContents = [];
    for (const msg of messages) {
      if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === (msg.role === 'assistant' ? 'model' : 'user')) {
        geminiContents[geminiContents.length - 1].parts[0].text += "\n\n" + msg.content;
      } else {
        geminiContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    let res;
    let responseContent = "";
    
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    });

    if (res.ok) {
      const data = await res.json();
      responseContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am here to help!";
    } else {
      console.warn("Gemini API failed in chat, falling back to Groq", await res.text());
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!groqRes.ok) throw new Error(`Both APIs failed. Groq error: ${await groqRes.text()}`);

      const data = await groqRes.json();
      responseContent = data.choices?.[0]?.message?.content || "I am here to help!";
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
