import os
import requests
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
# Fast + free-tier friendly model. See console.groq.com/docs/models for other options.
GROQ_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = (
    "You are EcoWatt AI, a friendly and knowledgeable energy-saving assistant "
    "built into a home energy monitoring dashboard. You help users understand "
    "their electricity usage, explain unusual spikes, and give practical, "
    "specific energy-saving tips (appliance habits, AC temperature, peak-hour "
    "usage, etc). Keep replies concise (2-5 sentences) and conversational, "
    "avoid generic disclaimers, and speak directly to the user's situation "
    "when they mention specifics."
)


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    text: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


@router.post("/chat")
def chat_with_assistant(data: ChatRequest, current_user: User = Depends(get_current_user)):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not set in backend/.env. Get a free key at console.groq.com/keys and add it there.",
        )

    # Build the conversation for Groq (OpenAI-compatible chat format).
    # Only send the last 10 turns to keep requests small and fast.
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in data.history[-10:]:
        role = "assistant" if m.role == "ai" or m.role == "assistant" else "user"
        messages.append({"role": role, "content": m.text})
    messages.append({"role": "user", "content": data.message})

    try:
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": 0.6,
                "max_tokens": 400,
            },
            timeout=30,
        )
        response.raise_for_status()
        result = response.json()
        reply = result["choices"][0]["message"]["content"]
        return {"reply": reply}
    except requests.exceptions.HTTPError as e:
        detail = e.response.json().get("error", {}).get("message", str(e)) if e.response is not None else str(e)
        raise HTTPException(status_code=502, detail=f"Groq API error: {detail}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Could not reach Groq API: {str(e)}")