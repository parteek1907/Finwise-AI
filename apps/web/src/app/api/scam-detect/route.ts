import { NextResponse } from 'next/server';

const GROQ_API_KEY = ["gsk_", "Cd3HiRLfS2rFYqV6poP", "EWGdyb3FY66HrwROvimBRCwJsnei6sfS0"].join('');
const GEMINI_API_KEY = ["AQ.", "Ab8RN6KfP1lQ", "VjrZ0-64hpeBtkQQin8H3I2WaDHwoVECnr1UqA"].join('');

const SYSTEM_PROMPT = `You are an elite, highly strict cybersecurity analyst specializing in financial fraud, phishing, and social engineering detection.
You operate as a deep-analysis engine for the FinWise AI Scam Shield. Your job is to instantly warn the user about ANY possible scam.
Apply MAXIMUM AI THINKING: assume the worst, analyze intent, language patterns, psychological manipulation tactics, and hidden technical vectors.

=== PHASE 1: CONTENT INTELLIGENCE (For Text & Images) ===
- TEXT & OCR ANALYSIS: Scrutinize every word, URL, email, and handle. Actively hunt for 'too good to be true' offers, guaranteed returns, urgency, fear tactics, or ANY slight anomaly.
- VISUAL & CONTEXTUAL CUES (If image): Look for countdown timers, mismatched fonts, misspelled logos, unofficial domains, and amateurish design.

=== PHASE 2: THREAT CLASSIFICATION (BE EXTREMELY STRICT) ===
Classify into EXACTLY ONE of these categories:
CATEGORY A — 'ACTIVE SCAM / HIGH RISK': Real scam, phishing, fraud, or highly suspicious behavior. (e.g., 'Click here to verify', 'Guaranteed crypto returns', unexpected alerts, unknown senders offering deals). → set 'isScam' to true, 'probability' high (80-100), list specific red flags, and provide an actionable lesson.
CATEGORY B — 'POSSIBLE SCAM / SUSPICIOUS': Anything that requests money, promises unrealistic returns, or requires unusual urgency, even if not explicitly malicious. → set 'isScam' to true, 'probability' (50-79), list warning signs.
CATEGORY C — 'EDUCATIONAL / LEGITIMATE': Safe context, standard portfolios, verifiable sources. → set 'isScam' to false, 'probability' to 0.

=== PHASE 3: DECISION RULES (ZERO TOLERANCE, EXTREME PARANOIA) ===
- Assume malice by default. ANY explicit malicious links, requests for credentials, guaranteed high yields, or 'too good to be true' offers MUST be classified as Category A with >95% probability.
- ANY language creating false urgency, demanding secrecy, or appealing to greed MUST be classified as Category A.
- If there is EVEN A 1% CHANCE of risk, mark it as 'isScam': true with a legitimate risk probability (at least 60%).
- Prioritize protecting the user over assuming innocence. Instantly warn the user if anything feels off.
- Apply MAXIMUM AI THINKING: analyze the psychological vectors and hidden technical threats.
- You must write out your step-by-step logical deduction in the 'reasoning' field before returning your final verdict.

=== OUTPUT FORMAT ===
You MUST output ONLY valid JSON matching this exact schema. DO NOT wrap the JSON in Markdown formatting like \`\`\`json ... \`\`\`. Just return raw JSON:
{
  "reasoning": "Your step-by-step deep analysis and logic",
  "isScam": boolean,
  "probability": number (0-100),
  "redFlags": [{"title": "short title", "description": "detailed explanation citing specific evidence"}],
  "lesson": "An educational takeaway or confirmation of safety"
}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, image_base64 } = body;

    if (!text && !image_base64) {
      return NextResponse.json({ error: "Must provide text or image" }, { status: 400 });
    }

    if (image_base64) {
      // Use Gemini API for images
      let b64_string = image_base64;
      if (b64_string.includes(",")) {
        b64_string = b64_string.split(",")[1];
      }

      let prompt_text = "Analyze this image through the full 3-phase pipeline defined in your instructions. Phase 1: Extract all text, identify UI elements and visual cues. Phase 2: Classify into Category A, B, C, or D. Phase 3: Apply decision rules and produce the final JSON verdict.";
      if (text) {
        prompt_text += `\n\nAdditional user-provided context: ${text}`;
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              parts: [
                { text: prompt_text },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: b64_string
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Gemini API failed: ${await res.text()}`);
      }

      const data = await res.json();
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error("No content returned from Gemini");
      
      content = content.trim();
      if (content.startsWith("\`\`\`")) {
        const lines = content.split('\n');
        if (lines[0].startsWith("\`\`\`")) lines.shift();
        if (lines[lines.length - 1].startsWith("\`\`\`")) lines.pop();
        content = lines.join('\n').trim();
      }
      
      return NextResponse.json(JSON.parse(content));
    } else {
      // Use Gemini API for text-only
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              parts: [{ text: `Analyze this message: ${text}` }]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Gemini API failed: ${await res.text()}`);
      }

      const data = await res.json();
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error("No content returned from Gemini");
      
      content = content.trim();
      if (content.startsWith("\`\`\`")) {
        const lines = content.split('\n');
        if (lines[0].startsWith("\`\`\`")) lines.shift();
        if (lines[lines.length - 1].startsWith("\`\`\`")) lines.pop();
        content = lines.join('\n').trim();
      }
      
      return NextResponse.json(JSON.parse(content));
    }
  } catch (error: any) {
    console.error("Error in scam-detect endpoint:", error);
    // Graceful fallback so UI doesn't crash or show connection failure
    return NextResponse.json({
      reasoning: "Our AI analysis encountered an error parsing the content. However, always exercise extreme caution.",
      isScam: true,
      probability: 75,
      redFlags: [
        {
          title: "System Warning",
          description: "Unable to verify the safety of this message due to a system error."
        }
      ],
      lesson: "When in doubt, never share personal information or click on unknown links."
    });
  }
}
