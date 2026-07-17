# Handoff

This folder is the shared turn-state layer for Claude Code and Codex.

Files:
- `state.yaml` - canonical structured session state
- `state.json` - machine-friendly mirror of the same state
- `WORKFLOW.md` - quick injection and update workflow for handoffs
- `../scripts/sync_handoff.py` - generator that keeps the derived files in sync
- `../scripts/sync_handoff.ps1` - PowerShell wrapper for the generator
- `../sync-handoff.cmd` - short Windows entrypoint for the generator

Update order:
1. Edit `state.yaml`
2. Run `sync-handoff.cmd`
3. Commit the regenerated `state.json` and `WORKFLOW.md`

Do not edit `state.json` or `WORKFLOW.md` by hand unless you are intentionally
changing the generator output format.
