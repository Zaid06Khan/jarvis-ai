# Project Jarvis — EdVisingU AI Operating System

## What We Are Building
A personal AI Operating System running 24/7 on a DigitalOcean VPS.
Jarvis automates my entire business — ebook creation, content generation,
social media, AI receptionist management, and passive income streams.

## My Stack
- DigitalOcean VPS (Ubuntu 22.04, Toronto region) — $200 student credits
- Antigravity IDE with Claude Code — primary development environment
- OpenJarvis — top level AI orchestrator
- Hermes Agent — Telegram/Discord communication gateway
- Claude Sonnet 4.6 — primary reasoning model (claude-sonnet-4-6)
- Strands Agents SDK — agent orchestration (replaces Open-Claw)
- n8n — workflow automation and scheduling
- Supabase — database and memory storage (project: jarvis-db)
- FastAPI — specialist agent router (port 8000)
- Docker — containerized agent fleet
- OpenRouter — fallback AI model access (200+ models)
- Bitwarden — credential storage (NEVER hardcode secrets)

## My Accounts
- Anthropic Console: console.anthropic.com (Claude API, $5 credits)
- GitHub: Zaid06Khan (Student Pack active, $200 DO credits)
- Discord: active
- Supabase: project jarvis-db
- OpenRouter: account created
- DigitalOcean: Toronto droplet running Ubuntu 22.04

## What Jarvis Does For Me
1. Researches trending niches automatically
2. Generates and publishes ebooks to Gumroad and Etsy via n8n
3. Creates TikTok and Instagram content promoting my products
4. Manages AI receptionist client outreach for Toronto salons
5. Tracks revenue across all income streams
6. I control everything by messaging it on Telegram

## Existing Work (Do Not Rebuild)
- build_ebook.py — Python/ReportLab PDF ebook generator, fully working
- Detox water ebook live on Gumroad and Etsy
- n8n ebook automation pipeline — researches niches, generates content,
  builds PDF, publishes to Gumroad automatically
- AI voice receptionist "Aria" — ElevenLabs + Twilio + Claude Haiku,
  live on real phone number targeting Toronto salons and barbershops

## Build Order (Follow This Exactly)
1. DigitalOcean VPS setup and SSH access
2. Development environment on VPS (Python, Node, Docker)
3. OpenJarvis installation and configuration
4. Hermes Agent setup (Telegram gateway)
5. FastAPI specialist agent router
6. Supabase database and memory
7. 25-agent fleet deployment
8. n8n workflow integration
9. Content automation pipeline
10. HeyGen social media campaign system

## Security Rules (Non-Negotiable)
- NEVER commit API keys or secrets to GitHub
- ALWAYS use .env files, never hardcode credentials
- ALWAYS add .gitignore before creating any .env file
- Store ALL credentials in Bitwarden the moment you create them
- NEVER share credentials via Discord or email

## Git Workflow
- main: production only, never push directly
- dev: active integration branch
- feature/xxx: your work branches
- Always commit with prefixes: feat: / fix: / config: / docs:
- Example: git commit -m "feat: add hermes telegram gateway"

## IDE
- Antigravity IDE with Claude Code
- Remote SSH connection to DigitalOcean VPS
- All code runs on VPS, Antigravity is just the interface

## Do Not
- Use Open-Claw (use Strands Agents SDK instead)
- Install anything locally except what is needed for SSH
- Push untested code to main or dev
- Hardcode any API keys anywhere
- Rebuild existing tools that already work

## Current Status (updated 2026-06-21)
**THE SYSTEM IS BUILT AND LIVE. Do NOT reinitialize or rebuild anything.**

### Live Infrastructure
- VPS is LIVE at 159.203.3.38 (Ubuntu 22.04, Toronto)
- All code lives ON THE VPS at /opt/edvisingu/  (this local folder is just the control/docs surface)
- GitHub repo: Zaid06Khan/jarvis-ai (private), GitHub auto-deploy connected
- Dashboard live at jarvis-dashboard-rho-pearl.vercel.app

### Running on the VPS (VERIFIED 2026-06-21 via SSH)
- FastAPI router v2.3.0 on :8000 — managed by **PM2** (process `fastapi-router`, runs from /opt/edvisingu,
  `uvicorn main:app`). /health reports fleet_agents:22, codex:true, gemini:false. /docs = 200.
  Routes: /agents /chat /health /brief/send /build/collab /content/factory /content/generate
  /ebook/generate /image/generate /overnight/run /overnight/summary /overnight/trigger /system/stats
  /v1/chat/completions /v1/models
- 22 agents confirmed (hermes-core, -content, -advisor, -credihire, -research, -email, -proposals,
  -outreach, -funnel, -ops, -finance, -crm, -whop, -etsy, -gumroad, -builder[codex], -social, -seo,
  -tiktok, -ads, -pinterest[all 4 "gemini pending key"], -image[dall-e-3]).
- Hermes Discord gateway (bot JarvisAPP) — running as deploy: `~/.hermes/hermes-agent/venv/bin/python
  -m hermes_cli.main gateway run` (pid-tracked, NOT pm2/systemd).
- n8n (node, :5678 localhost) + redis (docker, :6379 localhost) — both Up in Docker ~5h.
- Overnight automation @ 2am = **n8n schedule workflow** `workflows/overnight-engine.json`
  (cron `0 2 * * *` → POST http://127.0.0.1:8000/overnight/run). 7am morning brief uses /brief/send
  (schedule lives in n8n runtime DB; not in exported workflow files).
- Dashboard jarvis-dashboard-rho-pearl.vercel.app — LIVE (Vercel serving, Next.js App Router; root
  returns a 307 middleware redirect, X-Vercel-Cache HIT — normal, not an outage).
- Supabase jarvis-db connected; DALL-E 3 image gen via hermes-image; Claude+GPT-5.5 (codex) collab on.
- Graphify v0.8.44 at /opt/edvisingu/graphify-out/ — VERIFIED working (graph.json fresh 2026-06-21 20:32).
  Code lives on the VPS, so query remotely: `ssh deploy@159.203.3.38 'cd /opt/edvisingu && graphify
  query "<question>"'`. IMPORTANT: graphify resolves graphify-out/ relative to CWD — you MUST `cd
  /opt/edvisingu` first; passing the graph.json path as an arg does NOT work. Use this for codebase
  questions instead of grepping. NOTE: no ~/.claude/graphify-hook.log under deploy; graph IS updating.
- Repo layout: agents/ api-configs/ automation/ dashboards/ scripts/ vector-db/ workflows/ + main.py,
  .env (chmod 600), .gitignore. Git repo present at /opt/edvisingu/.git.

### How to connect  ⚠️ PORT 2222 + USER deploy (NOT root / NOT port 22)
- `ssh deploy@159.203.3.38 -p 2222` using ~/.ssh/id_ed25519 (key auth only; password auth disabled)
- Port 22 is CLOSED and root SSH login is disabled. ALL connections MUST use port 2222 as `deploy`.
- A ~/.ssh/config alias is set so plain `ssh 159.203.3.38` auto-applies Port 2222 + User deploy.

### ✅ SSH access (RESOLVED 2026-06-21)
- The earlier `Permission denied (publickey)` was because SSH was moved to port 2222 and root
  login on port 22 was disabled. Fixed: connect as `deploy@159.203.3.38 -p 2222`.

### Active work
- Building the TikTok automation pipeline for @BuildingWithAI. VPS access restored. Chain is a
  WIRING job (all keys exist): hermes-tiktok script → HeyGen video (HEYGEN_API_KEY) →
  Blotato auto-post (BLOTATO_API_KEY) → n8n schedule → Discord approval. Scope decisions pending.

### Build progress
The 10-step build order (above) is COMPLETE through ~phase 9. Remaining: phase 10 (HeyGen social
campaign system) — in progress as the TikTok pipeline.

### Session log — 2026-06-21
- SSH FIXED: moved to **port 2222** as user **deploy**; `~/.ssh/config` alias added so plain
  `ssh 159.203.3.38` works. Root login + port 22 are disabled.
- VERIFIED all services live on 159.203.3.38: FastAPI router :8000 (22 agents), Hermes Discord
  gateway, n8n, redis, overnight 2am n8n workflow, Vercel dashboard. Disk 8%, healthy.
- Graphify VERIFIED on the VPS graph; local graph built (deep mode, 41 nodes); Graphify Claude Code
  integration installed — **PreToolUse hook registered in `.claude/settings.json`** (graphify config
  also present in `.claude/settings.local.json`). Auto-update on code change is wired.
- TikTok pipeline for @BuildingWithAI: **PLANNED, not built**. All keys exist (HEYGEN_API_KEY,
  BLOTATO_API_KEY, ELEVENLABS_API_KEY, OPENAI_API_KEY). Awaiting 4 scope decisions
  (video format / approval flow / first-build scope / topic source).
- Created `.codex/tasks.json` (task handoff) and `.codex/handoff.md` (session handoff note).

### Claude Code ↔ Codex division of work
- Running side-by-side in a split panel; handoff via `.codex/` docs + `.codex/tasks.json`.
- **Claude Code** = VPS, agent fleet, FastAPI router, architecture, integrations, infra.
- **Codex** = UI, boilerplate, fast/local code generation.
- `.codex/` is a SANITIZED docs bridge only (no secrets). Sources of truth: CLAUDE.md, AGENTS.md,
  `.claude/settings.local.json`, `agents/`.

### Next build phases

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

### TWO graphs — query the right one
There are two separate Graphify graphs. Pick by what you're asking about:
- **VPS graph** → `/opt/edvisingu/graphify-out/graph.json` (the real application code).
  Query it for ALL agent / router / fleet / dashboard / workflow / API code:
  `ssh deploy@159.203.3.38 'cd /opt/edvisingu && graphify query "<question>"'` (must cd first).
- **Local graph** → `./graphify-out/graph.json` (this control/docs folder only).
  Query it for CLAUDE.md, config, and local docs: `graphify query "<question>"` from this folder.
- Rule of thumb: anything about how Jarvis *runs* = VPS graph; anything about project setup,
  status, or config notes = local graph. Local graphify is v0.8.25, VPS is v0.8.44.

### Session Handoff

Use the repo-local handoff layer to pass context between Claude Code and Codex:

- `handoff/state.yaml` is the structured source of truth
- `handoff/state.json` is the JSON mirror for tooling
- `handoff/WORKFLOW.md` is the human-readable quick-injection workflow

When context changes, update the state files and refresh the workflow summary
before handing work to the next session.
