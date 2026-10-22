import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

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

CRITICAL: You MUST return the output in ONLY valid JSON format matching the EXACT structure below. Do NOT output any reasoning outside of the JSON, comments (NO // or /*), or extra text.

EXAMPLE JSON OUTPUT FORMAT:
{
  "reasoning": "Step 1: Analyzed intent. Step 2: Identified urgency.",
  "isScam": true,
  "probability": 85,
  "riskLevel": "High",
  "analysis": "This message is a definitive phishing attempt...",
  "redFlags": [
    {
      "title": "Unsolicited Request",
      "description": "The message directly asks for sensitive info..."
    }
  ],
  "lesson": "Never share information in response to unsolicited messages."
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

      let res;
      let retries = 0;
      while (retries < 3) {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [
              {
                parts: [
                  { text: prompt_text },
                  { inlineData: { mimeType: "image/jpeg", data: b64_string } }
                ]
              }
            ],
            generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
          })
        });

        if (res.status === 503 || res.status === 429) {
          console.warn(`Gemini rate limit or 503 hit (${res.status}), retrying in 3s...`);
          await new Promise(r => setTimeout(r, 3000));
          retries++;
          continue;
        }
        break;
      }

      if (!res) throw new Error("No response from Gemini");
      if (!res.ok) throw new Error(`Gemini API error: ${await res.text()}`);

      const data = await res.json();
      let content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        content = content.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error("No valid JSON object found in response");
      }
      
      return NextResponse.json(JSON.parse(content));
    } else {
      // Use Groq API for text
      let data;
      let res;
      let retries = 0;
      while (retries < 3) {
        res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-20b",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Analyze this message: ${text}` }
              ],
              temperature: 0.1,
              max_tokens: 4000
            })
        });
        if (res.status === 429) {
          let errData;
          try { errData = await res.clone().json(); } catch(e) { errData = {}; }
          let waitTime = 5000;
          if (errData?.error?.message) {
              const match = errData.error.message.match(/try again in (\d+\.?\d*)s/);
              if (match) {
                  waitTime = (parseFloat(match[1]) * 1000) + 1000;
              }
          }
          console.warn(`Groq rate limit hit (429), waiting ${waitTime}ms and retrying...`);
          await new Promise(r => setTimeout(r, waitTime));
          retries++;
          continue;
        }
        break;
      }
      
      if (!res) throw new Error("No response from Groq");
      if (!res.ok) throw new Error(`Groq API error: ${await res.text()}`);
      
      data = await res.json();
      
      let content = data?.choices?.[0]?.message?.content || "";
      if (content && typeof content === 'string') { content = content.replace(/<think>[\s\S]*?<\/think>\n?/gi, '').trim(); }

      if (!content) throw new Error("No content returned from Groq");
      
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        content = content.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error("No valid JSON object found in response");
      }
      
      return NextResponse.json(JSON.parse(content));
    }
  } catch (error: any) {
    console.error("Error in scam-detect endpoint:", error);
    return NextResponse.json({
      reasoning: "Our AI analysis encountered an error parsing the content. However, always exercise extreme caution.",
      isScam: true,
      probability: 75,
      riskLevel: "High",
      redFlags: [
        {
          title: "System Warning",
          description: "Unable to verify the safety of this message due to a system error."
        }
      ],
      lesson: "When in doubt, never share personal information or click on unknown links.",
      analysis: "Unable to verify safety."
    });
  }
}
