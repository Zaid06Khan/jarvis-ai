"""EdVisingU AI Orchestration Router — fronts the in-process Strands Hermes fleet.

Endpoints are async and await Strands' async API so all model calls run on the
single FastAPI event loop (no per-request asyncio.run / loop-closed errors).
"""
from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import fleet  # in-process specialist agents

load_dotenv("/opt/edvisingu/.env")

app = FastAPI(title="EdVisingU AI Orchestration Router", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


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
    return {"status": "running", "version": "2.0.0", "ecosystem": "EdVisingU",
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
