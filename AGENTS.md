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

### Running on the VPS (per operator, last asserted 2026-06-21)
- 22 specialist Strands agents behind FastAPI router on port 8000
- Hermes Discord gateway (bot: JarvisAPP) — active
- Overnight automation @ 2am Toronto; morning brief to Discord @ 7am
- n8n workflows active
- Supabase jarvis-db connected
- Redis running in Docker
- Claude + GPT-5.5 collaboration working
- DALL-E 3 image generation working
- Ebook factory skill installed
- Graphify installed at /opt/edvisingu/graphify-out/ (auto-update hook → ~/.claude/graphify-hook.log)

### How to connect
- `ssh root@159.203.3.38` using ~/.ssh/id_ed25519 (key auth only; password auth disabled)

### ⚠️ Open blocker (2026-06-21)
- SSH from this machine fails: key IS registered server-side ("Server accepts key") but
  signature auth is refused → `Permission denied (publickey)`. Private key is valid/unencrypted
  and matches the pubkey. Cause is server-side (likely PermitRootLogin changed, an authorized_keys
  `from=`/restriction, or full disk). Resolve via the DigitalOcean web console, then re-verify.
- Until SSH is restored, live-running status above is UNVERIFIED by this environment.

### Active work
- Building the TikTok automation pipeline for @BuildingWithAI (blocked on VPS access)

### Next build phases (the original 10-step build order below is COMPLETE through ~phase 9)

## Session Handoff

Use the repo-local handoff layer to pass context between Claude Code and Codex:

- `handoff/state.yaml` is the structured source of truth
- `handoff/state.json` is the JSON mirror for tooling
- `handoff/WORKFLOW.md` is the human-readable quick-injection workflow

When context changes, update the state files and refresh the workflow summary
before handing work to the next session.
