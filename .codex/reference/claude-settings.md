# Sanitized Claude Settings Summary

Source: `.claude/settings.local.json`

This is a human-readable summary of the Claude-side local settings so Codex can
share the same project assumptions without copying the raw config wholesale.

## Permission summary

- Read access is allowed for the Downloads directory.
- Several read-only command checks are allowed for local tooling and package
  inspection.
- A remote SSH health-check command exists for the Jarvis VPS.

## Hook summary

- A post-tool-use Bash hook logs graph updates when commands touch the deploy
  path for Jarvis.
- When the command pattern matches the deploy path, the hook triggers a remote
  `graphify update` on the VPS.

## Practical note

Codex should treat the remote graph update as a project-specific side effect,
not as a default behavior to re-create locally.

