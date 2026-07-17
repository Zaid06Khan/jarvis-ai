# Claude to Codex Bridge

This file maps the Claude-side project shape into a Codex-safe repo structure.

## Mapping

| Claude-side source | Repo-side mirror | Purpose |
| --- | --- | --- |
| `CLAUDE.md` | `AGENTS.md` | Shared project brief and operating rules |
| `.claude/settings.local.json` | `.codex/reference/claude-settings.md` | Sanitized summary of local permissions and hooks |
| Claude agent concepts | `agents/*.md` | Role contracts for the Jarvis agent fleet |
| Session context | `handoff/state.yaml` + `handoff/state.json` | Shared turn state for Codex and Claude |
| Quick injection | `handoff/WORKFLOW.md` | Human-readable handoff summary |

## Operating rule

Use the repo-local `agents/` files as coordination contracts, not as executable
automation. If a role needs code later, add code beside the role contract and
keep the contract updated.

Use `handoff/` as the shared turn-state layer. Update the YAML and JSON files
first, then refresh the workflow summary so the next session can inject context
quickly.
