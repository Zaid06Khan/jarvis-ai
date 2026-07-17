# Handoff Workflow

This file is generated from `handoff/state.yaml` by `scripts/sync_handoff.py`.

## Update Order

When you finish a turn:

1. Update `handoff/state.yaml`.
2. Run `sync-handoff.cmd`.
3. Share the quick-inject block below with the next session.

## Current Context

- Project: Jarvis
- Current state: Handoff scaffold created and ready for use.
- Structured state: `handoff/state.yaml`
- JSON mirror: `handoff/state.json`
- Human workflow: `handoff/WORKFLOW.md`
- Shared role docs: `CLAUDE.md`, `AGENTS.md`, `.codex/bridge.md`, `.codex/safety.md`, `agents/README.md`, `handoff/WORKFLOW.md`

## Current Ownership

- Last writer: codex
- Current owner: codex
- Next owner: claude-code
- Direction: codex-to-claude

## Completed

- .codex bridge docs created
- agents role contracts created
- handoff structured state added

## Open Work

- claude-code: Read handoff/WORKFLOW.md, then continue work from handoff/state.yaml.
- codex: Keep the structured state and markdown summary in sync after each turn.

## Decisions

- Use a shared repo-local handoff instead of direct agent-to-agent chat.
- Keep the state machine simple and manually updateable.

## Blockers

- None

## Open Questions

- None

## Quick Inject

Use this block at the start of the next session:

```text
Continue Jarvis work from the repo-local handoff layer.
Read handoff/state.yaml and handoff/WORKFLOW.md first.
Current owner: codex.
Next owner: claude-code.
Current state: Handoff scaffold created and ready for use.
Completed: .codex bridge docs created, agents role contracts created, handoff structured state added
Open work: claude-code: Read handoff/WORKFLOW.md, then continue work from handoff/state.yaml.; codex: Keep the structured state and markdown summary in sync after each turn.
```
