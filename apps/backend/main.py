from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Finwise AI Backend",
    description="FastAPI Backend for Finwise AI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel
from typing import List, Dict
import time
import random

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Finwise AI Backend is running"}

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    # Simulate network processing time
    time.sleep(random.uniform(0.5, 1.5))
    
    # Get the last user message
    user_messages = [m for m in request.messages if m.role == "user"]
    if not user_messages:
        return {"role": "assistant", "content": "Hello. How can I help you?"}
        
    last_msg = user_messages[-1].content.lower()
    
    # Simple simulated mentor logic
    if any(word in last_msg for word in ["doge", "crypto", "bitcoin", "meme"]):
        response = "I notice you're asking about highly volatile assets. Remember our lesson on the 'Thrill of the Game'? Investing in meme coins is closer to gambling than building wealth.\n\nBefore you proceed, ask yourself: Are you comfortable losing 100% of this money? If not, let's look at your structured goals first."
    elif any(word in last_msg for word in ["fomo", "panic", "sell"]):
        response = "It sounds like emotions might be driving this decision. When the market drops, selling turns temporary paper losses into permanent realized losses. Let's review your long-term plan before making a move."
    else:
        response = "That's an interesting perspective. How does this align with your goal of reaching financial freedom? Let's unpack the emotions behind this decision."

    return {
        "role": "assistant",
        "content": response
    }
