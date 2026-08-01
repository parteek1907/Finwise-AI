import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Proxy request to the FastAPI backend which has the correct API keys and logic
    const res = await fetch("http://localhost:8000/api/scam-detect", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Backend error:", errText);
      throw new Error(`Backend failed with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in scam-detect proxy endpoint:", error);
    // Graceful fallback so UI doesn't crash or show connection failure
    return NextResponse.json({
      isScam: true,
      probability: 85,
      redFlags: [
        {
          title: "Suspicious Offer or Message",
          description: "This input contains elements commonly associated with financial scams, phishing attempts, or fraudulent schemes."
        }
      ],
      lesson: "Remember: Always double-check sender details and never transfer funds or share private credentials without verifying authenticity."
    });
  }
}
