#!/usr/bin/env python3
"""Sync the Jarvis handoff files from handoff/state.yaml.

This script treats handoff/state.yaml as the source of truth and regenerates:
- handoff/state.json
- handoff/WORKFLOW.md

Usage:
    python scripts/sync_handoff.py
    python scripts/sync_handoff.py --check
    python scripts/sync_handoff.py --state handoff/state.yaml
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable

import yaml


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_STATE = ROOT / "handoff" / "state.yaml"
DEFAULT_JSON = ROOT / "handoff" / "state.json"
DEFAULT_WORKFLOW = ROOT / "handoff" / "WORKFLOW.md"


def load_state(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle)

    if not isinstance(data, dict):
        raise ValueError(f"{path} must contain a YAML mapping at the top level")
    return data


def ordered_state(state: dict[str, Any]) -> dict[str, Any]:
    return {
        "version": state.get("version", 1),
        "session": state.get("session", {}),
        "project": state.get("project", {}),
        "summary": state.get("summary", {}),
        "decisions": state.get("decisions", []),
        "blockers": state.get("blockers", []),
        "open_questions": state.get("open_questions", []),
        "history": state.get("history", []),
    }


def render_list(items: Iterable[Any], indent: str = "- ") -> str:
    lines: list[str] = []
    for item in items:
        if isinstance(item, dict):
            parts = ", ".join(f"{key}: {value}" for key, value in item.items())
            lines.append(f"{indent}{parts}")
        else:
            lines.append(f"{indent}{item}")
    return "\n".join(lines) if lines else f"{indent}None"


def render_next_actions(next_actions: Iterable[Any]) -> str:
    lines: list[str] = []
    for item in next_actions:
        if isinstance(item, dict):
            owner = item.get("owner", "unknown")
            task = item.get("task", "")
            lines.append(f"- {owner}: {task}")
        else:
            lines.append(f"- {item}")
    return "\n".join(lines) if lines else "- None"


def render_workflow(state: dict[str, Any]) -> str:
    session = state.get("session", {})
    summary = state.get("summary", {})
    project = state.get("project", {})
    summary_status = str(summary.get("status", "unknown")).rstrip(".")

    completed = summary.get("completed", [])
    next_actions = summary.get("next_actions", [])
    blockers = state.get("blockers", [])
    open_questions = state.get("open_questions", [])
    decisions = state.get("decisions", [])

    shared_docs = (
        project.get("coordination_layer", {}).get("shared_docs", [])
        if isinstance(project.get("coordination_layer", {}), dict)
        else []
    )
    wrapper_command = "sync-handoff.cmd"

    quick_inject_lines = [
        "Continue Jarvis work from the repo-local handoff layer.",
        "Read handoff/state.yaml and handoff/WORKFLOW.md first.",
        f"Current owner: {session.get('current_owner', 'unknown')}.",
        f"Next owner: {session.get('next_owner', 'unknown')}.",
        f"Current state: {summary_status}.",
        "Completed: "
        + (", ".join(completed) if completed else "none"),
        "Open work: "
        + (
            "; ".join(
                f"{item.get('owner', 'unknown')}: {item.get('task', '')}"
                if isinstance(item, dict)
                else str(item)
                for item in next_actions
            )
            if next_actions
            else "none"
        ),
    ]

    sections = [
        "# Handoff Workflow",
        "",
        "This file is generated from `handoff/state.yaml` by `scripts/sync_handoff.py`.",
        "",
        "## Update Order",
        "",
        "When you finish a turn:",
        "",
        "1. Update `handoff/state.yaml`.",
        f"2. Run `{wrapper_command}`.",
        "3. Share the quick-inject block below with the next session.",
        "",
        "## Current Context",
        "",
        f"- Project: {project.get('name', 'Jarvis')}",
        f"- Current state: {summary.get('status', 'unknown')}",
        "- Structured state: `handoff/state.yaml`",
        "- JSON mirror: `handoff/state.json`",
        "- Human workflow: `handoff/WORKFLOW.md`",
        "- Shared role docs: "
        + (
            ", ".join(f"`{doc}`" for doc in shared_docs)
            if shared_docs
            else "`agents/`"
        ),
        "",
        "## Current Ownership",
        "",
        f"- Last writer: {session.get('last_writer', 'unknown')}",
        f"- Current owner: {session.get('current_owner', 'unknown')}",
        f"- Next owner: {session.get('next_owner', 'unknown')}",
        f"- Direction: {session.get('direction', 'unknown')}",
        "",
        "## Completed",
        "",
        render_list(completed),
        "",
        "## Open Work",
        "",
        render_next_actions(next_actions),
        "",
        "## Decisions",
        "",
        render_list(decisions),
        "",
        "## Blockers",
        "",
        render_list(blockers),
        "",
        "## Open Questions",
        "",
        render_list(open_questions),
        "",
        "## Quick Inject",
        "",
        "Use this block at the start of the next session:",
        "",
        "```text",
        *quick_inject_lines,
        "```",
        "",
    ]
    return "\n".join(sections)


def write_if_changed(path: Path, content: str, check: bool) -> bool:
    existing = path.read_text(encoding="utf-8") if path.exists() else None
    if existing == content:
        return False
    if check:
        return True
    path.write_text(content, encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state", type=Path, default=DEFAULT_STATE, help="Path to state.yaml")
    parser.add_argument("--json-out", type=Path, default=DEFAULT_JSON, help="Path to state.json")
    parser.add_argument(
        "--workflow-out",
        type=Path,
        default=DEFAULT_WORKFLOW,
        help="Path to WORKFLOW.md",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify outputs are in sync without writing files",
    )
    args = parser.parse_args()

    state_path = args.state.resolve()
    json_path = args.json_out.resolve()
    workflow_path = args.workflow_out.resolve()

    state = load_state(state_path)
    canonical = ordered_state(state)

    json_text = json.dumps(canonical, indent=2, ensure_ascii=False) + "\n"
    workflow_text = render_workflow(canonical)

    json_changed = write_if_changed(json_path, json_text, args.check)
    workflow_changed = write_if_changed(workflow_path, workflow_text, args.check)

    if args.check and (json_changed or workflow_changed):
        print("handoff outputs are out of sync", file=sys.stderr)
        return 1

    if not args.check and (json_changed or workflow_changed):
        print("handoff outputs updated")
    else:
        print("handoff outputs already in sync")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
