import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || ["gsk_", "Cd3HiRLfS2rFYqV6poP", "EWGdyb3FY66HrwROvimBRCwJsnei6sfS0"].join('');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemPrompt = `You are Groq's expert financial psychologist and behavioral finance analyst. 
Your task is to carefully analyze the user's message to determine their true underlying emotion, 
objective risk level, and any genuine cognitive biases they are exhibiting. 
Do not assume the user is making a trade; they might be asking about a general financial situation, 
a potential scam, or personal finance. 
All values you return MUST be strictly accurate and TRUE based on the exact context of the user's input. 
\nSCORING RUBRIC FOR CONFIDENCE & BIASES:
\n- Confidence (0-100%): This must reflect how strongly the user is exhibiting the emotion or bias, NOT just how obvious the situation is. 
If the user explicitly expresses doubt, uncertainty, or skepticism (e.g., 'I am not sure', 'Should I do it?'), the confidence score MUST be lower (30-60%) because their bias is not fully cemented. 
If they are completely resolute and acting blindly (e.g., 'I am going all in!'), confidence should be high (80-100%).
\n- Biases: MUST specifically identify well-known behavioral finance/cognitive biases (e.g., Gullibility, Greed, FOMO, Confirmation Bias, Trust Bias, Loss Aversion). 
Do not just say 'Uncertainty'. Dig deeper into their psychological vulnerability.
\nCRITICAL INSTRUCTION: If the user asks an irrelevant, non-financial question (e.g., 'hello', 'am i gay', 'what is the weather', 'who are you'), 
you MUST NOT analyze them financially. You MUST set 'emotion' to 'Irrelevant', 'confidence' to 0, 'risk' to 'None', 'biases' to [], 
and 'summary' to 'This query is not related to finance, investing, or market psychology.', and provide an empty array for recommendations.\n
EXAMPLE 1 (Irrelevant):
User: 'am i gay'
Output: {"emotion": "Irrelevant", "confidence": 0, "risk": "None", "biases": [], "summary": "This query is not related to finance, investing, or market psychology.", "recommendations": []}\n
EXAMPLE 2 (Uncertain about a Scam):
User: 'my friend promises me 1000 rupees when i give him 200 should i do it im not sure'
Output: {"emotion": "Uncertainty / Mild Greed", "confidence": 45, "risk": "Very High", "biases": ["Trust Bias", "Authority Bias"], "summary": "The user is being lured into a classic advance-fee scheme, but they are exhibiting healthy skepticism and doubt rather than full gullibility.", "recommendations": ["Trust your gut feeling—do not send any money.", "Recognize that guaranteed high returns from friends are common scams.", "Politely decline the offer and protect your savings."]}\n\n
You MUST output your response in valid JSON format ONLY with the following schema:
{
  "emotion": "Short string of the primary emotion detected (e.g., Greed, Naivety, Panic, FOMO)",
  "confidence": number (0-100, representing how clearly the emotion/bias is shown in their text),
  "risk": "String (Low, Medium, High, Very High, or None for irrelevant queries)",
  "biases": ["Array of actual cognitive biases detected (e.g., Authority Bias, Gullibility). Return empty array if none exist."],
  "summary": "A grounded, logical summary explaining exactly why they feel this way and the true reality of the situation.",
  "recommendations": ["Array of 3 highly specific, actionable, rational steps they must take regarding their exact situation."]
}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error in emotion-ai:", errText);
      throw new Error(`Groq API failed with status ${res.status}`);
    }

    const data = await res.json();
    const responseContent = data.choices?.[0]?.message?.content;
    
    if (!responseContent) {
        throw new Error("No content returned from Groq");
    }

    return NextResponse.json(JSON.parse(responseContent));
  } catch (error) {
    console.error("Error in emotion-ai endpoint:", error);
    return NextResponse.json({ error: "Failed to analyze emotion." }, { status: 500 });
  }
}
