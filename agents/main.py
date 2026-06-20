import os
import httpx
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv("/opt/edvisingu/.env")

app = FastAPI(title="EdVisingU AI Orchestration Router", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Model routing matrix (manual Section 26): agent name -> (provider, model)
SONNET = ("anthropic", "claude-sonnet-4-6")
HAIKU  = ("anthropic", "claude-haiku-4-5-20251001")
GPT4O  = ("openai", "gpt-4o")
GEMINI = ("gemini", "gemini-2.0-flash")

AGENT_MATRIX = {
    "hermes-core": SONNET, "hermes-content": SONNET, "hermes-advisor": SONNET,
    "hermes-credihire": SONNET, "hermes-research": SONNET, "hermes-email": SONNET,
    "hermes-proposals": SONNET, "hermes-outreach": SONNET, "hermes-funnel": SONNET,
    "hermes-ops": HAIKU, "hermes-finance": HAIKU, "hermes-crm": HAIKU,
    "hermes-whop": HAIKU, "hermes-etsy": HAIKU, "hermes-gumroad": HAIKU,
    "hermes-builder": GPT4O,
    "hermes-social": GEMINI, "hermes-seo": GEMINI, "hermes-tiktok": GEMINI,
    "hermes-ads": GEMINI, "hermes-pinterest": GEMINI,
}
DEFAULT_AGENT = "hermes-core"


class ChatRequest(BaseModel):
    message: str
    agent: str = "hermes-core"
    max_tokens: int = 2048


class ContentRequest(BaseModel):
    topic: str
    platforms: List[str] = ["linkedin", "tiktok", "email"]
    tone: str = "bold, direct, and insightful"


class Message(BaseModel):
    role: str
    content: str


class OAIRequest(BaseModel):
    model: str
    messages: List[Message]
    stream: Optional[bool] = False
    max_tokens: Optional[int] = None


def _require(key: str) -> str:
    v = os.getenv(key)
    if not v:
        raise HTTPException(status_code=503, detail=f"{key} not configured in .env yet")
    return v


async def call_model(provider: str, model: str, msgs: List[dict], max_tokens: int = 2048) -> str:
    if provider == "anthropic":
        import anthropic
        client = anthropic.Anthropic(api_key=_require("ANTHROPIC_API_KEY"))
        system = "\n".join(m["content"] for m in msgs if m["role"] == "system")
        conv = [m for m in msgs if m["role"] in ("user", "assistant")] or [{"role": "user", "content": ""}]
        kwargs = {"model": model, "max_tokens": max_tokens, "messages": conv}
        if system:
            kwargs["system"] = system
        r = client.messages.create(**kwargs)
        return r.content[0].text
    if provider == "openai":
        key = _require("OPENAI_API_KEY")
        async with httpx.AsyncClient(timeout=120) as c:
            r = await c.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}"},
                json={"model": model, "messages": msgs, "max_tokens": max_tokens},
            )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
    if provider == "gemini":
        key = _require("GOOGLE_AI_API_KEY")
        contents = [
            {"role": ("model" if m["role"] == "assistant" else "user"), "parts": [{"text": m["content"]}]}
            for m in msgs if m["role"] in ("user", "assistant", "system")
        ]
        async with httpx.AsyncClient(timeout=120) as c:
            r = await c.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
                json={"contents": contents},
            )
            r.raise_for_status()
            return r.json()["candidates"][0]["content"]["parts"][0]["text"]
    raise HTTPException(status_code=400, detail=f"unknown provider {provider}")


@app.get("/health")
def health():
    return {"status": "running", "version": "1.0.0", "ecosystem": "EdVisingU", "agents": len(AGENT_MATRIX)}


@app.post("/chat")
async def chat(req: ChatRequest):
    provider, model = AGENT_MATRIX.get(req.agent, SONNET)
    text = await call_model(provider, model, [{"role": "user", "content": req.message}], req.max_tokens)
    return {"response": text, "agent": req.agent, "model": model}


@app.post("/content/generate")
async def generate_content(req: ContentRequest):
    prompt = (
        "You are Dr. Andre De Freitas, founder of EdVisingU.\n"
        f"Write content about: {req.topic}\nTone: {req.tone}\n"
        f"Generate for platforms: {', '.join(req.platforms)}\n"
        "Return JSON with platform names as keys and content as values."
    )
    text = await call_model("anthropic", "claude-sonnet-4-6", [{"role": "user", "content": prompt}], 4096)
    return {"topic": req.topic, "content": text}


@app.get("/v1/models")
def list_models():
    return {"object": "list", "data": [{"id": k, "object": "model"} for k in AGENT_MATRIX]}


@app.post("/v1/chat/completions")
async def oai_chat(req: OAIRequest):
    agent = req.model if req.model in AGENT_MATRIX else DEFAULT_AGENT
    provider, model = AGENT_MATRIX[agent]
    msgs = [{"role": m.role, "content": m.content} for m in req.messages]
    text = await call_model(provider, model, msgs, req.max_tokens or 2048)
    return {
        "id": "jarvis", "object": "chat.completion", "model": agent,
        "choices": [{"index": 0, "message": {"role": "assistant", "content": text}, "finish_reason": "stop"}],
    }
