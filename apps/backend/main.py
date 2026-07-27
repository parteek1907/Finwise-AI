from fastapi import FastAPI, HTTPException, Depends
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
from datetime import datetime
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

from firebase_admin import auth as firebase_admin_auth
from auth_utils import get_current_user, login_with_email_password
from firebase_config import db

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
)

# Initialize Gemini client
gemini_client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    goals: Optional[List[Dict]] = None

class AuthRegisterRequest(BaseModel):
    email: str
    password: str

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class SocialAuthRequest(BaseModel):
    id_token: str

class LessonCompletionRequest(BaseModel):
    xp_earned: int

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Finwise AI Backend is running"}

@app.post("/api/auth/register")
def register_user(request: AuthRegisterRequest):
    try:
        user = firebase_admin_auth.create_user(
            email=request.email,
            password=request.password
        )
        
        # Initialize user in Firestore with Level 0 and XP 0
        db.collection("users").document(user.uid).set({
            "email": request.email,
            "xp": 0,
            "level": 0
        })
        
        return {"uid": user.uid, "email": user.email, "message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
def login_user(request: AuthLoginRequest):
    api_key = "AIzaSyAsb_Q0OIJK5_sqf3Hkbe3n26Mq41hFAig"
    if not api_key:
        raise HTTPException(status_code=500, detail="FIREBASE_WEB_API_KEY not configured on backend")
    
    return login_with_email_password(request.email, request.password, api_key)

@app.post("/api/auth/social")
def verify_social_token(request: SocialAuthRequest):
    try:
        decoded_token = firebase_admin_auth.verify_id_token(request.id_token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        
        # Check if user exists in Firestore, if not create them with Level 0 and XP 0
        user_ref = db.collection("users").document(uid)
        if not user_ref.get().exists:
            user_ref.set({
                "email": email,
                "xp": 0,
                "level": 0
            })

        return {
            "uid": uid,
            "email": email,
            "name": decoded_token.get("name"),
            "message": "Token verified successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@app.post("/api/user/complete-lesson")
def complete_lesson(request: LessonCompletionRequest, user_token=Depends(get_current_user)):
    try:
        if request.xp_earned < 0:
            raise HTTPException(status_code=400, detail="XP earned must be positive")
            
        uid = user_token.get("uid")
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            current_xp = 0
            current_level = 0
            user_ref.set({
                "email": user_token.get("email", ""),
                "xp": current_xp,
                "level": current_level
            })
        else:
            data = user_doc.to_dict()
            current_xp = data.get("xp", 0)
            current_level = data.get("level", 0)
            
        new_xp = current_xp + request.xp_earned
        import math
        new_level = math.floor((-1 + math.sqrt(1 + 8 * new_xp / 100)) / 2)
        
        leveled_up = new_level > current_level
        
        user_ref.update({
            "xp": new_xp,
            "level": new_level
        })
        
        xp_for_next_level = 50 * (new_level + 1) * (new_level + 2)
        
        return {
            "message": "Lesson completed successfully",
            "xp": new_xp,
            "level": new_level,
            "leveled_up": leveled_up,
            "previous_level": current_level,
            "xp_required_for_next_level": xp_for_next_level
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/progress")
def get_user_progress(user_token=Depends(get_current_user)):
    try:
        uid = user_token.get("uid")
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return {
                "xp": 0, 
                "level": 0,
                "xp_required_for_next_level": 100
            }
            
        data = user_doc.to_dict()
        current_xp = data.get("xp", 0)
        current_level = data.get("level", 0)
        
        return {
            "xp": current_xp,
            "level": current_level,
            "xp_required_for_next_level": 50 * (current_level + 1) * (current_level + 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        "5. Keep your responses under 3 short paragraphs.\n"
        "6. GOAL MANAGEMENT (CRITICAL): If the user explicitly asks you to add, remove, deposit, or deduct funds from one of their goals, you MUST output the following exact tag anywhere in your response text: `[ACTION: UPDATE_GOAL, goal_id: \"{id}\", amount: {amount}]`. Use a negative amount to remove funds. For example: `[ACTION: UPDATE_GOAL, goal_id: \"g1\", amount: 500]`."
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
        "CRITICAL INSTRUCTIONS FOR IMAGES: "
        "1. You must thoroughly scan and read EVERY SINGLE WORD of text visible in the image. Examine the sender details, URLs, grammar, urgency cues, and requested actions. "
        "2. If the user uploads an image that is completely irrelevant to finance, scams, or communication (e.g., a picture of a dog, a landscape, a random selfie), you MUST explicitly state that it is irrelevant. In this case, set 'isScam' to false, 'probability' to 0, and use the 'lesson' field to tell the user: 'This image appears to be irrelevant to financial scams. Please upload a screenshot of an email, text message, or financial offer.' "
        "3. IF the image contains a legitimate, safe financial context (e.g., a personal portfolio dashboard, a banking app screenshot showing balances, or a standard stock chart without a suspicious 'get rich quick' overlay), you MUST recognize it as safe. Set 'isScam' to false, 'probability' to 0, and use the 'lesson' field to confirm: 'This appears to be a legitimate financial dashboard or portfolio. No scam elements detected.' "
        "4. IF the image contains ANY suspicious financial context, crypto offer, unsolicited investment opportunity, or phishing communication, you must thoroughly analyze it for fraud. Do NOT mark everything financial as a scam—only flag it if there are actual red flags (unrealistic promises, urgency, unknown senders)."
        "You MUST output your response in valid JSON format ONLY with the following schema:\n"
        "{\n"
        "  \"isScam\": boolean,\n"
        "  \"probability\": number (0-100),\n"
        "  \"redFlags\": [{\"title\": \"short title\", \"description\": \"detailed explanation of the exact text/visual cue found in the image\"}],\n"
        "  \"lesson\": \"A short educational tip or the irrelevant image message\"\n"
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
            
            prompt_text = "Perform a deep, OCR-level analysis of this image. Read every single word, analyze the context, and determine if it's a financial scam or an irrelevant image."
            if request.text:
                prompt_text += f" Context/Text: {request.text}"
                
            response = gemini_client.models.generate_content(
                model='gemini-flash-latest',
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

class GoalSuggestionRequest(BaseModel):
    goal: Dict

@app.post("/api/goal-suggestions")
def goal_suggestions_endpoint(request: GoalSuggestionRequest):
    goal = request.goal
    prompt = (
        f"You are a financial AI. The user has a financial goal:\n"
        f"Name: {goal.get('name')}\n"
        f"Category: {goal.get('category')}\n"
        f"Target: ${goal.get('target', 0)}\n"
        f"Current Saved: ${goal.get('current', 0)}\n"
        f"Deadline: {goal.get('deadline')}\n\n"
        "Based on this exact progress and deadline, provide exactly 2 highly relevant, specific, and actionable suggestions to help the user achieve this goal faster. "
        "Return the response in ONLY valid JSON format matching this schema:\n"
        "{\n"
        "  \"suggestions\": [\n"
        "    {\"title\": \"Short Title\", \"description\": \"Detailed 1-2 sentence suggestion.\"}\n"
        "  ]\n"
        "}"
    )
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
            temperature=0.3
        )
        import json
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return {"suggestions": [
            {"title": "Automate Contributions", "description": "Set up a recurring transfer on payday to ensure consistent progress."},
            {"title": "Review Budget", "description": "Look for unused subscriptions to cancel and reallocate to this goal."}
        ]}

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

class EmotionRequest(BaseModel):
    message: str

@app.post("/api/emotion-ai")
def emotion_ai_endpoint(request: EmotionRequest):
    system_prompt = (
        "You are Groq's expert financial psychologist and behavioral finance analyst. "
        "Your task is to carefully analyze the user's message to determine their true underlying emotion, "
        "objective risk level, and any genuine cognitive biases they are exhibiting. "
        "Do not assume the user is making a trade; they might be asking about a general financial situation, "
        "a potential scam, or personal finance. "
        "All values you return MUST be strictly accurate and TRUE based on the exact context of the user's input. "
        "\nSCORING RUBRIC FOR CONFIDENCE & BIASES:"
        "\n- Confidence (0-100%): This must reflect how strongly the user is exhibiting the emotion or bias, NOT just how obvious the situation is. "
        "If the user explicitly expresses doubt, uncertainty, or skepticism (e.g., 'I am not sure', 'Should I do it?'), the confidence score MUST be lower (30-60%) because their bias is not fully cemented. "
        "If they are completely resolute and acting blindly (e.g., 'I am going all in!'), confidence should be high (80-100%)."
        "\n- Biases: MUST specifically identify well-known behavioral finance/cognitive biases (e.g., Gullibility, Greed, FOMO, Confirmation Bias, Trust Bias, Loss Aversion). "
        "Do not just say 'Uncertainty'. Dig deeper into their psychological vulnerability."
        "\nCRITICAL INSTRUCTION FOR RISK: You must act as the most serious, strict financial risk analyst. If the user asks a genuine, purely educational, or harmless question without any personal financial exposure (e.g., 'What is a stock?', 'How do mutual funds work?'), you MUST strictly set 'risk' to 'Low'. However, if the user expresses ANY level of doubt, uncertainty, or describes a situation involving their own money or a specific investment (e.g., 'My friend told me to invest, should I?', 'I am buying crypto'), you MUST provide the correct, serious risk analysis (Medium, High, or Very High based on the exposure)."
        "\nCRITICAL INSTRUCTION: If the user asks an irrelevant, non-financial question (e.g., 'hello', 'am i gay', 'what is the weather', 'who are you'), "
        "you MUST NOT analyze them financially. You MUST set 'emotion' to 'Irrelevant', 'confidence' to 0, 'risk' to 'None', 'biases' to [], "
        "and 'summary' to 'This query is not related to finance, investing, or market psychology.', and provide an empty array for recommendations.\n"
        "EXAMPLE 1 (Irrelevant):\n"
        "User: 'am i gay'\n"
        "Output: {\"emotion\": \"Irrelevant\", \"confidence\": 0, \"risk\": \"None\", \"biases\": [], \"summary\": \"This query is not related to finance, investing, or market psychology.\", \"recommendations\": []}\n"
        "EXAMPLE 2 (Uncertain about a Scam):\n"
        "User: 'my friend promises me 1000 rupees when i give him 200 should i do it im not sure'\n"
        "Output: {\"emotion\": \"Uncertainty / Mild Greed\", \"confidence\": 45, \"risk\": \"Very High\", \"biases\": [\"Trust Bias\", \"Authority Bias\"], \"summary\": \"The user is being lured into a classic advance-fee scheme, but they are exhibiting healthy skepticism and doubt rather than full gullibility.\", \"recommendations\": [\"Trust your gut feeling—do not send any money.\", \"Recognize that guaranteed high returns from friends are common scams.\", \"Politely decline the offer and protect your savings.\"]}\n\n"
        "You MUST output your response in valid JSON format ONLY with the following schema:\n"
        "{\n"
        "  \"emotion\": \"Short string of the primary emotion detected (e.g., Greed, Naivety, Panic, FOMO)\",\n"
        "  \"confidence\": number (0-100, representing how clearly the emotion/bias is shown in their text),\n"
        "  \"risk\": \"String (Low, Medium, High, Very High, or None for irrelevant queries)\",\n"
        "  \"biases\": [\"Array of actual cognitive biases detected (e.g., Authority Bias, Gullibility). Return empty array if none exist.\"],\n"
        "  \"summary\": \"A grounded, logical summary explaining exactly why they feel this way and the true reality of the situation.\",\n"
        "  \"recommendations\": [\"Array of 3 highly specific, actionable, rational steps they must take regarding their exact situation.\"]\n"
        "}\n"
    )
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.1
        )
        import json
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze emotion.")

import finnhub

finnhub_api_key = os.getenv("FINNHUB_API_KEY")
finnhub_client = finnhub.Client(api_key=finnhub_api_key) if finnhub_api_key else None

@app.get("/api/market/quote/{symbol}")
def get_market_quote(symbol: str):
    if not finnhub_client:
        raise HTTPException(status_code=500, detail="Finnhub API key not configured")
    try:
        res = finnhub_client.quote(symbol.upper())
        # Finnhub returns {'c': 0, 'd': None, 'dp': None, 'h': 0, 'l': 0, 'o': 0, 'pc': 0, 't': 0} for invalid symbols
        if not res or 'c' not in res or res['c'] == 0:
            raise HTTPException(status_code=404, detail="Symbol not found or no data")
        
        name_map = {
            "AAPL": "Apple Inc.", "TSLA": "Tesla Inc.", "MSFT": "Microsoft Corp.", 
            "GOOGL": "Alphabet Inc.", "NVDA": "NVIDIA Corp.", "AMZN": "Amazon.com Inc.",
            "META": "Meta Platforms Inc.", "BTC-USD": "Bitcoin", "ETH-USD": "Ethereum"
        }
        name = name_map.get(symbol.upper(), symbol.upper())

        return {
            "symbol": symbol.upper(),
            "name": name,
            "price": res['c'],
            "change": res['d'] if res['d'] is not None else 0,
            "changePercent": res['dp'] if res['dp'] is not None else 0,
            "high": res['h'],
            "low": res['l'],
            "open": res['o'],
            "previousClose": res['pc']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/candles/{symbol}")
def get_market_candles(symbol: str, timeframe: str = "1M"):
    if not finnhub_client:
        raise HTTPException(status_code=500, detail="Finnhub API key not configured")
    try:
        # Determine resolution and time ranges based on timeframe
        # Finnhub resolutions: 1, 5, 15, 30, 60, D, W, M
        end = int(time.time())
        if timeframe == "1D":
            start = end - (24 * 3600)
            res = "5"
        elif timeframe == "5D":
            start = end - (5 * 24 * 3600)
            res = "15"
        elif timeframe == "1M":
            start = end - (30 * 24 * 3600)
            res = "D"
        elif timeframe == "3M":
            start = end - (90 * 24 * 3600)
            res = "D"
        elif timeframe == "6M":
            start = end - (180 * 24 * 3600)
            res = "D"
        elif timeframe == "1Y":
            start = end - (365 * 24 * 3600)
            res = "W"
        else: # ALL
            start = end - (5 * 365 * 24 * 3600)
            res = "M"

        data = finnhub_client.stock_candles(symbol.upper(), res, start, end)
        
        if data.get('s') == 'no_data' or 't' not in data:
            return []
            
        candles = []
        for i in range(len(data['t'])):
            # Finnhub time is unix timestamp. TradingChart expects string 'YYYY-MM-DD' or timestamp in some cases.
            # Convert timestamp to YYYY-MM-DD if daily or above, else YYYY-MM-DD HH:MM
            dt = datetime.fromtimestamp(data['t'][i])
            if res in ["D", "W", "M"]:
                time_str = dt.strftime('%Y-%m-%d')
            else:
                time_str = data['t'][i] # lightweight charts needs unix timestamp for intraday
                
            candles.append({
                "time": time_str,
                "open": data['o'][i],
                "high": data['h'][i],
                "low": data['l'][i],
                "close": data['c'][i],
                "volume": data.get('v', [])[i] if 'v' in data and len(data['v']) > i else 0
            })
        return candles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import WebSocket, WebSocketDisconnect
import websockets
import json
import asyncio

@app.websocket("/api/market/ws/{symbol}")
async def websocket_endpoint(websocket: WebSocket, symbol: str):
    await websocket.accept()
    if not finnhub_api_key:
        await websocket.close(code=1008)
        return

    # Map crypto symbols for Finnhub WebSocket
    finnhub_symbol = symbol.upper()
    if finnhub_symbol == "BTC" or finnhub_symbol == "BTC-USD":
        finnhub_symbol = "BINANCE:BTCUSDT"
    elif finnhub_symbol == "ETH" or finnhub_symbol == "ETH-USD":
        finnhub_symbol = "BINANCE:ETHUSDT"

    try:
        async with websockets.connect(f"wss://ws.finnhub.io?token={finnhub_api_key}") as finnhub_ws:
            # Subscribe to the symbol
            subscribe_msg = {"type": "subscribe", "symbol": finnhub_symbol}
            await finnhub_ws.send(json.dumps(subscribe_msg))

            # Read from Finnhub and forward to client
            while True:
                message = await finnhub_ws.recv()
                data = json.loads(message)
                if data.get("type") == "trade" and data.get("data"):
                    # Get the most recent trade in the batch
                    latest_trade = data["data"][-1]
                    await websocket.send_json({
                        "price": latest_trade["p"],
                        "time": latest_trade["t"],
                        "volume": latest_trade["v"]
                    })
    except WebSocketDisconnect:
        print(f"Client disconnected from {symbol} stream")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass
