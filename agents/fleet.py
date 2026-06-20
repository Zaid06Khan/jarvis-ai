"""EdVisingU Hermes specialist fleet — in-process Strands agents (async) with cost-aware tiering
and multi-provider support (Claude + Codex/GPT-4o + Gemini).

Model tiering (cost control):
  - ALWAYS_HAIKU agents (ops/finance/crm/whop/etsy/gumroad): always Haiku.
  - Other agents: Haiku for simple/short, Sonnet only for complex tasks.
Provider routing:
  - hermes-builder -> OpenAI Codex/GPT-4o when OPENAI_API_KEY is set (else Claude).
  - gemini agents -> Google Gemini when GOOGLE_AI_API_KEY is set (else Claude).
  - everything else -> Anthropic Claude.
"""
import os
import re
from dotenv import load_dotenv
from strands import Agent
from strands.models.anthropic import AnthropicModel
try:
    from strands.types.exceptions import MaxTokensReachedException
except Exception:  # pragma: no cover
    class MaxTokensReachedException(Exception):
        pass

load_dotenv("/opt/edvisingu/.env")
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")

SONNET = "claude-sonnet-4-6"
HAIKU = "claude-haiku-4-5-20251001"
GPT4O = os.getenv("CODEX_MODEL", "gpt-5.5")
GEMINI_FLASH = "gemini-2.0-flash"

ALWAYS_HAIKU = {"hermes-ops", "hermes-finance", "hermes-crm", "hermes-whop",
                "hermes-etsy", "hermes-gumroad"}

INTENDED_PROVIDER = {
    "hermes-builder": "openai",
    "hermes-social": "gemini", "hermes-seo": "gemini", "hermes-tiktok": "gemini",
    "hermes-ads": "gemini", "hermes-pinterest": "gemini",
}

HEAVY_RE = re.compile(
    r"\b(write|draft|compose|create|full|essay|article|blog|newsletter|"
    r"script|sequence|research|analyz|analys|outline|plan|strategy|"
    r"breakdown|long[- ]?form|generate|rewrite|expand|summari[sz]e|"
    r"deep dive|step[- ]?by[- ]?step|proposal|report|implement|code|build)\b", re.I)

COMPLEX_MAX_TOKENS = 2048
COMPLEX_MSG_CHARS = 280


def is_complex(message: str, max_tokens: int) -> bool:
    return ((max_tokens or 0) >= COMPLEX_MAX_TOKENS
            or len(message or "") > COMPLEX_MSG_CHARS
            or bool(HEAVY_RE.search(message or "")))


def choose_model(agent_name: str, message: str = "", max_tokens: int = 1024) -> str:
    if agent_name in ALWAYS_HAIKU:
        return HAIKU
    return SONNET if is_complex(message, max_tokens) else HAIKU


def tier_for(agent_name: str) -> str:
    intended = INTENDED_PROVIDER.get(agent_name)
    if intended == "openai":
        return ("codex/" + GPT4O) if os.getenv("OPENAI_API_KEY") else "claude (codex pending key)"
    if intended == "gemini":
        return "gemini" if os.getenv("GOOGLE_AI_API_KEY") else "claude (gemini pending key)"
    return "haiku" if agent_name in ALWAYS_HAIKU else "haiku|sonnet (auto)"


SOULS = {
 "hermes-core": "You are Hermes Core, primary AI executive assistant to Dr. Andre De Freitas (Dr. D), founder of EdVisingU, CrediVersity, DrD Learn and HireEd Nexus Labs. Think like a founder, not an assistant. Be direct, specific, execution-focused. Tie every output to revenue, time saved, or scale. Never vague.",
 "hermes-content": "You are Hermes Content, Dr. D's content factory. Produce LinkedIn posts, TikTok scripts, YouTube outlines and email newsletters. Strong hook first, clear CTA last, no fluff. Match platform format rules exactly.",
 "hermes-advisor": "You are the EdVisingU Student AI Advisor. Help students succeed academically, earn income while studying, and build career-ready skills. Always recommend specific EdVisingU programs, HireEd Nexus opportunities or CrediVersity credentials. Encouraging, action-oriented, specific.",
 "hermes-credihire": "You are Hermes CrediHire, a resume and career optimization agent. Do ATS scoring, resume rewriting, LinkedIn optimization, cover letters and interview prep. Be concrete and metrics-driven.",
 "hermes-research": "You are Hermes Research, the intelligence and market analysis agent. Find it, analyze it, synthesize into clear actionable insight. Cite sources, separate fact from analysis, lead with the insight. Flag stale info.",
 "hermes-email": "You are Hermes Email, the communications agent. Draft emails in Dr. D's voice: direct, confident, no fluff, no em dashes. Always draft first, never claim to send without confirmation. Flag urgent items.",
 "hermes-proposals": "You are Hermes Proposals, consulting and partnership proposal writer. Every proposal includes: problem statement, Dr. D's unique value, deliverables, timeline, investment ask, ROI case. Executive, authoritative tone.",
 "hermes-outreach": "You are Hermes Outreach, outbound relationship builder. Cold email, LinkedIn DMs, partnership and podcast pitches. Always personalized, peer-to-peer, value-first. No generic templates.",
 "hermes-funnel": "You are Hermes Funnel, conversion and funnel specialist. Every funnel includes entry point, lead magnet, tripwire, core offer and upsell. Design ManyChat DM flows that capture leads into email sequences.",
 "hermes-ops": "You are Hermes Ops, the system monitor. Health checks, backup verification, n8n status, daily status reports. Lead with the status. Flag failures immediately. Terse and precise.",
 "hermes-finance": "You are Hermes Finance, revenue intelligence. Track MRR, subscription trends, churn, anomalies and projections. Lead with the number. Think CFO, not accountant. Flag anything abnormal immediately.",
 "hermes-crm": "You are Hermes CRM, a lightweight CRM assistant. Log every contact interaction, track lead status, create follow-up reminders, report pipeline health. Fast and structured.",
 "hermes-whop": "You are Hermes Whop, membership operations manager. Product creation, pricing, discount codes, member access, webhook events, MRR reporting. Verify webhook signatures. Report MRR weekly.",
 "hermes-etsy": "You are Hermes Etsy, Etsy shop assistant. Listing copy, titles, 13-tag optimization, pricing. CRITICAL: Etsy publishing is SEMI-MANUAL (no API automation) — generate content for Dr. D to paste into Seller Hub.",
 "hermes-gumroad": "You are Hermes Gumroad, product-listing agent. Gumroad product listings, pricing, sales-page copy and discount codes. Conversion-focused, concise.",
 "hermes-builder": "You are Hermes Builder, the product development agent (Codex). Product idea in, working scaffold out. Create repos, write boilerplate, design schemas and specs. GitHub repo first, README always, MVP thinking, everything modular. Output runnable, well-structured code.",
 "hermes-social": "You are Hermes Social, community and social agent. Discord announcements, Whop events, engagement responses and community growth ideas. Energetic, on-brand, concise.",
 "hermes-seo": "You are Hermes SEO, SEO and content research specialist. Keyword research (with search-volume estimate and intent), content briefs, meta tags, internal linking, competitor gaps. Primary sites: edvisingu.com, crediversity.com, gohireed.com.",
 "hermes-tiktok": "You are Hermes TikTok, TikTok content specialist. 60-90s scripts that open with a pattern-interrupt hook in the first 2 seconds and end with a clear CTA. Captions, hashtags, content calendar. Target 4-5x/week.",
 "hermes-ads": "You are Hermes Ads, paid advertising strategist. Facebook/Instagram/TikTok ad copy, audience targeting, campaign structure, A/B tests, ROAS analysis. Every ad = hook + benefit + CTA. Never recommend spend without approval.",
 "hermes-pinterest": "You are Hermes Pinterest, Pinterest strategist. Pin creation, board strategy, SEO descriptions driving traffic to Etsy, Gumroad and Skillplate. Keyword-rich, concise.",
}


def model_for(agent_name: str) -> str:
    return HAIKU if agent_name in ALWAYS_HAIKU else SONNET


def _build_model(agent_name: str, model_id: str, max_tokens: int, force_model):
    """Return (strands_model, effective_model_id). Native provider when its key exists; else Claude."""
    intended = INTENDED_PROVIDER.get(agent_name)
    if not force_model and intended == "openai" and os.getenv("OPENAI_API_KEY"):
        try:
            from strands.models.openai import OpenAIModel
            return OpenAIModel(client_args={"api_key": os.getenv("OPENAI_API_KEY")}, model_id=GPT4O), GPT4O
        except Exception:
            pass
    if not force_model and intended == "gemini" and os.getenv("GOOGLE_AI_API_KEY"):
        try:
            from strands.models.gemini import GeminiModel
            return GeminiModel(client_args={"api_key": os.getenv("GOOGLE_AI_API_KEY")}, model_id=GEMINI_FLASH), GEMINI_FLASH
        except Exception:
            pass
    return AnthropicModel(client_args={"api_key": ANTHROPIC_KEY}, model_id=model_id, max_tokens=max_tokens), model_id


def _to_strands_messages(history):
    msgs = []
    for h in history or []:
        role = h.get("role")
        content = h.get("content", "")
        if role in ("user", "assistant") and content:
            msgs.append({"role": role, "content": [{"text": content}]})
    return msgs


async def get_response(agent_name: str, message: str, history=None, max_tokens: int = 1024,
                       force_model: str = None):
    """Async: return (text, effective_model_id)."""
    if agent_name not in SOULS:
        agent_name = "hermes-core"
    base_model = force_model or choose_model(agent_name, message, max_tokens)
    model, eff = _build_model(agent_name, base_model, max_tokens, force_model)
    try:
        agent = Agent(model=model, system_prompt=SOULS[agent_name],
                      messages=_to_strands_messages(history), callback_handler=None)
        result = await agent.invoke_async(message)
    except MaxTokensReachedException:
        # response was truncated by max_tokens -> retry once with generous headroom
        big = max(max_tokens * 3, 6000)
        model2, eff = _build_model(agent_name, base_model, big, force_model)
        agent = Agent(model=model2, system_prompt=SOULS[agent_name], callback_handler=None)
        result = await agent.invoke_async(message)
    except Exception:
        fallback = AnthropicModel(client_args={"api_key": ANTHROPIC_KEY}, model_id=base_model,
                                  max_tokens=max(max_tokens, 4000))
        agent = Agent(model=fallback, system_prompt=SOULS[agent_name], callback_handler=None)
        result = await agent.invoke_async(message)
        eff = base_model
    return str(result).strip(), eff


AGENTS = list(SOULS.keys())
