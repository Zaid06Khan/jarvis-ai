"""EdVisingU AI Orchestration Router — fronts the in-process Strands Hermes fleet.

Cost-aware tiering (Haiku default, Sonnet for complex). Adds:
  - /overnight/run + /overnight/summary  (autonomous multi-stream nightly engine)
  - /build/collab                        (Claude plans -> Codex codes -> Claude reviews)
"""
import os
import re
import json
import datetime
import subprocess
from typing import List, Optional
import httpx
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

import fleet

load_dotenv("/opt/edvisingu/.env")

app = FastAPI(title="EdVisingU AI Orchestration Router", version="2.4.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

ROUTER_TOKEN = os.getenv("ROUTER_TOKEN", "")
OPEN_PATHS = {"/health"}


@app.middleware("http")
async def auth_gate(request: Request, call_next):
    """Loopback callers (hermes, n8n) need no token; external callers must present the bearer token."""
    path = request.url.path
    if path not in OPEN_PATHS:
        host = request.client.host if request.client else ""
        if host not in ("127.0.0.1", "::1", "localhost"):
            if not ROUTER_TOKEN or request.headers.get("authorization") != f"Bearer {ROUTER_TOKEN}":
                return JSONResponse({"detail": "unauthorized"}, status_code=401)
    return await call_next(request)


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
    max_tokens: int = 1024


class ContentRequest(BaseModel):
    topic: str
    platforms: List[str] = ["linkedin", "tiktok", "email"]
    tone: str = "bold, direct, and insightful"


class CollabRequest(BaseModel):
    task: str


class OvernightRequest(BaseModel):
    streams: Optional[List[str]] = None  # subset of: content, product, ebook


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
    return {"status": "running", "version": "2.3.0", "ecosystem": "EdVisingU",
            "fleet_agents": len(fleet.AGENTS),
            "codex": bool(os.getenv("OPENAI_API_KEY")), "gemini": bool(os.getenv("GOOGLE_AI_API_KEY"))}


@app.get("/agents")
def agents():
    return {"agents": [{"name": a, "tier": fleet.tier_for(a)} for a in fleet.AGENTS]}


@app.post("/chat")
async def chat(req: ChatRequest):
    text, model = await fleet.get_response(req.agent, req.message, max_tokens=req.max_tokens)
    return {"response": text, "agent": req.agent if req.agent in fleet.AGENTS else "hermes-core", "model": model}


@app.post("/content/generate")
async def generate_content(req: ContentRequest):
    prompt = (f"Write content about: {req.topic}\nTone: {req.tone}\n"
              f"Generate for these platforms: {', '.join(req.platforms)}\n"
              "Return JSON with platform names as keys and the content as values.")
    text, model = await fleet.get_response("hermes-content", prompt, max_tokens=4096, force_model=fleet.SONNET)
    return {"topic": req.topic, "content": text, "model": model}


async def _queue_content(topic: str, platforms: List[str]):
    prompt = (f"Create ready-to-post social content about: {topic}\nTone: bold, practical.\n"
              f"Return ONLY a raw JSON object (no markdown) whose keys are exactly: {', '.join(platforms)}. "
              "Each value is the finished content for that platform.")
    text, model = await fleet.get_response("hermes-content", prompt, max_tokens=4096, force_model=fleet.SONNET)
    parsed = extract_json(text)
    sb = supabase()
    queued = []
    if isinstance(parsed, dict) and parsed:
        for platform, content in parsed.items():
            body = content if isinstance(content, str) else json.dumps(content)
            sb.table("content_queue").insert(
                {"topic": topic, "platform": str(platform), "raw_content": body, "status": "pending"}).execute()
            queued.append(str(platform))
    else:
        sb.table("content_queue").insert(
            {"topic": topic, "platform": "mixed", "raw_content": text, "status": "pending"}).execute()
        queued.append("mixed")
    return queued, model


@app.post("/content/factory")
async def content_factory(req: ContentRequest):
    queued, model = await _queue_content(req.topic, req.platforms)
    return {"topic": req.topic, "model": model, "queued": len(queued), "platforms": queued}


@app.post("/build/collab")
async def build_collab(req: CollabRequest):
    """Claude (hermes-core) plans -> Codex (hermes-builder/GPT-4o) implements -> Claude reviews."""
    plan, m_plan = await fleet.get_response(
        "hermes-core",
        f"Create a concise technical plan to build: {req.task}. Numbered steps, key files, and stack. Under 180 words.",
        max_tokens=2000)
    code, m_code = await fleet.get_response(
        "hermes-builder",
        f"Task: {req.task}\n\nApproved plan:\n{plan}\n\nImplement the core code now. Runnable, with brief comments.",
        max_tokens=6000, codex_complex=True)  # multi-step build -> gpt-5.5
    review, m_rev = await fleet.get_response(
        "hermes-core",
        f"Review this implementation for bugs, security issues, and gaps. 3-6 sharp bullet points:\n\n{code[:4500]}",
        max_tokens=1500)
    return {"task": req.task,
            "plan": plan, "planner": m_plan,
            "code": code, "coder": m_code,
            "review": review, "reviewer": m_rev}


@app.post("/overnight/run")
async def overnight_run(req: Optional[OvernightRequest] = None):
    """Autonomous multi-stream nightly engine. Cost-bounded: ~1 Sonnet + ~3 Haiku calls."""
    streams = (req.streams if req and req.streams else ["content", "product"])
    sb = supabase()
    out = {"ran_at": datetime.datetime.utcnow().isoformat() + "Z", "results": {}}

    # 1) Niche intelligence (Haiku, cheap). Ask for a JSON array -> robust parse.
    research, _ = await fleet.get_response(
        "hermes-core",
        'Output ONLY a JSON array of exactly 3 strings. Each string is one specific, concrete '
        'digital-product niche with durable evergreen demand. '
        'Example: ["meal prep for shift workers", "budgeting for freelancers", "sleep routines for new parents"]. '
        'No prose, no keys, no code fences — just the raw JSON array of 3 real niches.',
        max_tokens=200, force_model=fleet.HAIKU)
    niches_list = []
    try:
        niches_list = json.loads(re.sub(r"^```(?:json)?|```$", "", research.strip()).strip())
    except Exception:
        m = re.search(r"\[.*\]", research, re.S)
        if m:
            try:
                niches_list = json.loads(m.group(0))
            except Exception:
                niches_list = []
    niches_list = [str(n).strip() for n in niches_list if str(n).strip()][:3]
    out["results"]["niches"] = niches_list or research
    niche = niches_list[0][:80] if niches_list else "AI productivity tools"
    out["niche"] = niche

    queued = []
    if "content" in streams:
        queued, _ = await _queue_content(niche, ["linkedin", "tiktok", "email"])
        out["results"]["content_queued"] = queued

    product = ""
    if "product" in streams:
        product, _ = await fleet.get_response(
            "hermes-gumroad",
            f"Propose ONE specific Gumroad digital product for the niche '{niche}': title, one-line pitch, suggested price. 3 lines max.",
            max_tokens=220)
        sb.table("content_queue").insert(
            {"topic": niche, "platform": "product-idea", "raw_content": product, "status": "idea"}).execute()
        out["results"]["product_idea"] = product

    brief = (f"# Jarvis Overnight Brief — {out['ran_at'][:10]}\n\n"
             f"**Focus niche:** {niche}\n\n"
             f"## Niches researched\n{research}\n\n"
             f"## Content queued ({len(queued)}): {', '.join(queued) or 'none'}\n\n"
             f"## Product idea\n{product or 'skipped'}\n")
    sb.table("content_queue").insert(
        {"topic": "OVERNIGHT BRIEF", "platform": "overnight-brief", "raw_content": brief, "status": "brief"}).execute()
    out["brief_stored"] = True
    return out


@app.get("/overnight/summary")
def overnight_summary():
    sb = supabase()
    rows = (sb.table("content_queue").select("raw_content,created_at")
            .eq("platform", "overnight-brief").order("created_at", desc=True).limit(1).execute().data)
    return {"brief": rows[0]["raw_content"] if rows else "No overnight brief yet."}


async def _run_overnight_bg(streams):
    try:
        await overnight_run(OvernightRequest(streams=streams))
    except Exception:
        pass


@app.post("/overnight/trigger")
async def overnight_trigger(bg: BackgroundTasks, req: Optional[OvernightRequest] = None):
    streams = (req.streams if req and req.streams else ["content", "product"])
    bg.add_task(_run_overnight_bg, streams)
    return {"ok": True, "message": "overnight run started", "streams": streams}


class EbookRequest(BaseModel):
    niche: str = ""


async def _gen_ebook_bg(niche):
    try:
        n = niche or "AI productivity"
        meta, _ = await fleet.get_response(
            "hermes-content",
            f"Propose a sellable ebook for the niche '{n}'. Return ONLY raw JSON with keys: "
            f"title, description (2 sentences), price (number in CAD). No code fences.",
            max_tokens=500)
        data = extract_json(meta) or {}
        supabase().table("products").insert({
            "name": data.get("title") or f"{n} Playbook",
            "type": "ebook",
            "price": float(data.get("price") or 17),
            "description": data.get("description") or "",
            "platform": "gumroad",
            "active": False,
        }).execute()
    except Exception:
        pass


@app.post("/ebook/generate")
async def ebook_generate(bg: BackgroundTasks, req: Optional[EbookRequest] = None):
    bg.add_task(_gen_ebook_bg, (req.niche if req else ""))
    return {"ok": True, "message": "ebook generation started"}


@app.post("/brief/send")
async def brief_send():
    rows = (supabase().table("content_queue").select("raw_content")
            .eq("platform", "overnight-brief").order("created_at", desc=True).limit(1).execute().data)
    brief = rows[0]["raw_content"] if rows else "No overnight brief yet."
    webhook = os.getenv("DISCORD_WEBHOOK_URL", "")
    delivered = False
    if webhook:
        try:
            async with httpx.AsyncClient(timeout=15) as c:
                await c.post(webhook, json={"content": brief[:1900]})
            delivered = True
        except Exception:
            delivered = False
    return {"delivered": delivered, "brief": brief}


@app.get("/system/stats")
def system_stats():
    vps = {"cpu": 0, "mem": 0, "disk": 0}
    try:
        import psutil
        vps["cpu"] = psutil.cpu_percent(interval=0.3)
        vps["mem"] = psutil.virtual_memory().percent
        vps["disk"] = psutil.disk_usage("/").percent
        vps["load"] = open("/proc/loadavg").read().split()[0]
        secs = float(open("/proc/uptime").read().split()[0])
        vps["uptime"] = f"{int(secs // 86400)}d {int((secs % 86400) // 3600)}h"
    except Exception:
        pass

    def port_up(port):
        try:
            import socket
            s = socket.socket(); s.settimeout(0.5)
            ok = s.connect_ex(("127.0.0.1", port)) == 0; s.close()
            return ok
        except Exception:
            return False

    def svc_active(name):
        try:
            r = subprocess.run(["systemctl", "--user", "is-active", name],
                               capture_output=True, text=True, timeout=3)
            return r.stdout.strip() == "active"
        except Exception:
            return None

    services = [
        {"name": "FastAPI Router", "up": True},
        {"name": "Hermes Gateway", "up": svc_active("hermes-gateway")},
        {"name": "n8n", "up": port_up(5678)},
        {"name": "Redis", "up": port_up(6379)},
        {"name": "Supabase", "up": bool(os.getenv("SUPABASE_URL"))},
    ]
    return {"vps": vps, "services": services,
            "providers": {"anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
                          "openai": bool(os.getenv("OPENAI_API_KEY")),
                          "gemini": bool(os.getenv("GOOGLE_AI_API_KEY"))}}


@app.get("/v1/models")
def list_models():
    return {"object": "list", "data": [{"id": a, "object": "model"} for a in fleet.AGENTS]}


@app.post("/v1/chat/completions")
async def oai_chat(req: OAIRequest):
    agent = req.model if req.model in fleet.AGENTS else "hermes-core"
    history = [{"role": m.role, "content": m.content} for m in req.messages[:-1]]
    last = req.messages[-1].content if req.messages else ""
    text, model = await fleet.get_response(agent, last, history=history, max_tokens=req.max_tokens or 1024)
    return {"id": "jarvis", "object": "chat.completion", "model": agent,
            "choices": [{"index": 0, "message": {"role": "assistant", "content": text},
                         "finish_reason": "stop"}]}
