# Codex Bridge

This folder is the repo-local bridge between the existing Claude Code setup and
Codex workflows.

What it is:
- A place to mirror project intent and operating rules in a Codex-friendly form.
- A sanitized summary of Claude-side project settings where needed.
- A home for project-specific notes that should stay in the repo.

What it is not:
- A second secret store.
- A runtime orchestration system.
- A replacement for the actual user-level Codex config in `C:\Users\Zaid Khan\.codex`.

Primary sources of truth:
- `CLAUDE.md`
- `AGENTS.md`
- `.claude/settings.local.json`
- `agents/`
- `handoff/`

Update rule:
- If the Claude-side instructions change, update the matching bridge file here
  at the same time.
