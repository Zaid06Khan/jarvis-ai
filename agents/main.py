"""EdVisingU AI Orchestration Router — fronts the in-process Strands Hermes fleet.

Endpoints are async and await Strands' async API so all model calls run on the
single FastAPI event loop. /content/factory generates content and queues it in
Supabase (all DB secrets stay here — n8n just triggers this endpoint).
"""
import os
import re
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import fleet  # in-process specialist agents

load_dotenv("/opt/edvisingu/.env")

app = FastAPI(title="EdVisingU AI Orchestration Router", version="2.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_SB = None


def supabase():
    global _SB
    if _SB is None:
        from supabase import create_client
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise HTTPException(status_code=503, detail="Supabase not configured in .env")
        _SB = create_client(url, key)
    return _SB


def extract_json(text: str):
    t = text.strip()
    t = re.sub(r"^```(?:json)?", "", t).strip()
    t = re.sub(r"```$", "", t).strip()
    try:
        return json.loads(t)
    except Exception:
        m = re.search(r"\{.*\}", t, re.S)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                return None
    return None


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


@app.get("/health")
def health():
    return {"status": "running", "version": "2.1.0", "ecosystem": "EdVisingU",
            "fleet_agents": len(fleet.AGENTS)}


@app.get("/agents")
def agents():
    return {"agents": [{"name": a, "model": fleet.model_for(a),
                        "intended": fleet.INTENDED_PROVIDER.get(a, "anthropic")} for a in fleet.AGENTS]}


@app.post("/chat")
async def chat(req: ChatRequest):
    text, model = await fleet.get_response(req.agent, req.message, max_tokens=req.max_tokens)
    return {"response": text, "agent": req.agent if req.agent in fleet.AGENTS else "hermes-core", "model": model}


@app.post("/content/generate")
async def generate_content(req: ContentRequest):
    prompt = (f"Write content about: {req.topic}\nTone: {req.tone}\n"
              f"Generate for these platforms: {', '.join(req.platforms)}\n"
              "Return JSON with platform names as keys and the content as values.")
    text, model = await fleet.get_response("hermes-content", prompt, max_tokens=4096)
    return {"topic": req.topic, "content": text, "model": model}


@app.post("/content/factory")
async def content_factory(req: ContentRequest):
    """Generate platform content AND queue each piece in Supabase content_queue."""
    prompt = (f"Create ready-to-post social content about: {req.topic}\nTone: {req.tone}\n"
              f"Return ONLY a raw JSON object (no markdown, no commentary) whose keys are exactly: "
              f"{', '.join(req.platforms)}. Each value is the finished content for that platform.")
    text, model = await fleet.get_response("hermes-content", prompt, max_tokens=4096)
    parsed = extract_json(text)
    sb = supabase()
    inserted = []
    if isinstance(parsed, dict) and parsed:
        for platform, content in parsed.items():
            body = content if isinstance(content, str) else json.dumps(content)
            sb.table("content_queue").insert(
                {"topic": req.topic, "platform": str(platform), "raw_content": body, "status": "pending"}
            ).execute()
            inserted.append(str(platform))
    else:
        sb.table("content_queue").insert(
            {"topic": req.topic, "platform": "mixed", "raw_content": text, "status": "pending"}
        ).execute()
        inserted.append("mixed")
    return {"topic": req.topic, "model": model, "queued": len(inserted), "platforms": inserted}


@app.get("/v1/models")
def list_models():
    return {"object": "list", "data": [{"id": a, "object": "model"} for a in fleet.AGENTS]}


@app.post("/v1/chat/completions")
async def oai_chat(req: OAIRequest):
    agent = req.model if req.model in fleet.AGENTS else "hermes-core"
    history = [{"role": m.role, "content": m.content} for m in req.messages[:-1]]
    last = req.messages[-1].content if req.messages else ""
    text, model = await fleet.get_response(agent, last, history=history, max_tokens=req.max_tokens or 2048)
    return {"id": "jarvis", "object": "chat.completion", "model": agent,
            "choices": [{"index": 0, "message": {"role": "assistant", "content": text},
                         "finish_reason": "stop"}]}
