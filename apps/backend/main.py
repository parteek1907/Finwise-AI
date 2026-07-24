from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Finwise AI Backend",
    description="FastAPI Backend for Finwise AI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all local ports (3000, 3001, etc)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel
from typing import List, Dict, Optional
import time
import random
import os
from dotenv import load_dotenv
from groq import Groq
from google import genai
from google.genai import types
import base64

# Load environment variables
load_dotenv(".env.local")

# Initialize Groq client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

# Initialize Gemini client
gemini_client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    goals: Optional[List[Dict]] = None

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Finwise AI Backend is running"}

@app.post("/api/mentor")
def mentor_endpoint(request: ChatRequest):
    goals_context = ""
    if request.goals:
        goals_text = "\n".join([
            f"- {g.get('name', 'Goal')}: ${g.get('current', 0):,} of ${g.get('target', 0):,} (Status: {g.get('status', 'Unknown')})"
            for g in request.goals
        ])
        goals_context = f"\n\nUser's Active Financial Goals Context:\n{goals_text}\n"

    system_prompt = (
        "You are Alex's personalized Financial AI Mentor. Your job is to help the user manage their money, "
        "reach their financial goals, and provide actionable, mathematically sound advice. "
        "You are highly intelligent, conversational, and emotionally aware. "
        "Keep responses concise, engaging, and professional."
        f"{goals_context}"
        "\n\nGuidelines for your responses:\n"
        "1. Tone: Warm, supportive, articulate, direct, and pragmatic. If the user expresses gratitude, celebrate their progress or respond naturally (e.g., 'You are very welcome!').\n"
        "2. Structure: Break down complex ideas using scannable bullet points. Use standard hyphens (-) or unicode bullets (•) for lists.\n"
        "3. FORMATTING RESTRICTION (CRITICAL): NEVER use the asterisk symbol (*) for bolding or bullet points. It breaks the UI. Do not bold text at all.\n"
        "4. Conversational Flow: If the user makes a casual remark or just says thanks, do NOT force financial advice or 'Next steps'. Just acknowledge them naturally and be a good conversationalist.\n"
        "5. Keep your responses under 3 short paragraphs."
    )
    
    # Format messages for Groq API
    api_messages = [{"role": "system", "content": system_prompt}]
    
    for msg in request.messages:
        api_messages.append({"role": msg.role, "content": msg.content})
        
    try:
        chat_completion = client.chat.completions.create(
            messages=api_messages,
            model="llama-3.1-8b-instant", # Groq supports llama-3.1 models
        )
        
        response_content = chat_completion.choices[0].message.content
        # Hard strip asterisks to guarantee clean UI
        response_content = response_content.replace("**", "").replace("*", "")
        
        return {
            "role": "assistant",
            "content": response_content
        }
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        raise HTTPException(status_code=503, detail="I apologize, but I am having trouble connecting to my brain right now. Please check the API configuration.")

class ScamDetectRequest(BaseModel):
    text: Optional[str] = None
    image_base64: Optional[str] = None

class RedFlag(BaseModel):
    title: str
    description: str

class ScamResult(BaseModel):
    isScam: bool
    probability: int
    redFlags: List[RedFlag]
    lesson: str

@app.post("/api/scam-detect")
def scam_detect_endpoint(request: ScamDetectRequest):
    if not request.text and not request.image_base64:
        raise HTTPException(status_code=400, detail="Must provide text or image")

    system_prompt = (
        "You are an expert cybersecurity and financial fraud analyst. "
        "Your task is to analyze the provided text or image to determine if it is a scam or phishing attempt. "
        "You MUST output your response in valid JSON format ONLY with the following schema:\n"
        "{\n"
        "  \"isScam\": boolean,\n"
        "  \"probability\": number (0-100),\n"
        "  \"redFlags\": [{\"title\": \"short title\", \"description\": \"detailed explanation\"}],\n"
        "  \"lesson\": \"A short educational tip about this type of scam\"\n"
        "}\n"
    )
    
    if request.image_base64:
        try:
            # Strip data URL prefix if present
            b64_string = request.image_base64
            if "," in b64_string:
                b64_string = b64_string.split(",")[1]
                
            image_bytes = base64.b64decode(b64_string)
            image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
            
            prompt_text = "Analyze this screenshot for signs of a scam."
            if request.text:
                prompt_text += f" Context/Text: {request.text}"
                
            response = gemini_client.models.generate_content(
                model='gemini-1.5-flash',
                contents=[prompt_text, image_part],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ScamResult,
                    system_instruction=system_prompt,
                    temperature=0.1
                )
            )
            import json
            return json.loads(response.text)
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            raise HTTPException(status_code=500, detail="Failed to analyze image.")
    else:
        api_messages = [{"role": "system", "content": system_prompt}]
        api_messages.append({"role": "user", "content": f"Analyze this message: {request.text}"})

        try:
            chat_completion = client.chat.completions.create(
                messages=api_messages,
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
                temperature=0.1
            )
            import json
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            raise HTTPException(status_code=500, detail="Failed to analyze message.")

class TitleRequest(BaseModel):
    message: str

@app.post("/api/chat-title")
def chat_title_endpoint(request: TitleRequest):
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Create a concise, 3-5 word title for a chat based on the user's first message. Do NOT use quotes or punctuation in the output. Just the raw text."},
                {"role": "user", "content": f"Generate a title for this message: {request.message}"}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3
        )
        title = completion.choices[0].message.content.strip()
        # Remove any surrounding quotes if the model adds them despite instructions
        if title.startswith('"') and title.endswith('"'):
            title = title[1:-1]
        return {"title": title}
    except Exception as e:
        print(f"Error generating title: {e}")
        return {"title": "New Chat"}

