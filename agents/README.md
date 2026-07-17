# Agent Roles

This directory defines the Jarvis role map.

Each file is a contract for one responsibility area:
- what the role owns
- what it depends on
- what it produces
- when to hand work off
- what safety limits apply

These are documentation-first contracts. They are meant to keep Claude Code and
Codex aligned on boundaries and responsibility, not to act as an orchestrator by
themselves.

The companion coordination layer lives in `handoff/`:
- `handoff/state.yaml`
- `handoff/state.json`
- `handoff/WORKFLOW.md`

## Role Index

- `orchestrator.md` - top-level coordination and routing
- `infra.md` - VPS, containers, SSH, and deployment environment
- `router-fastapi.md` - specialist agent router and API surface
- `hermes.md` - Telegram and Discord gateway
- `supabase-memory.md` - persistence, memory, and shared state
- `n8n.md` - workflow automation and scheduling
- `content-factory.md` - ebook and content generation pipeline
- `research.md` - niche discovery and source gathering
- `social-media.md` - TikTok and Instagram content operations
- `receptionist.md` - AI receptionist workflow and client outreach
- `handoff/` - shared turn-state and quick injection workflow
