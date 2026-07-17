# n8n

## Purpose

Owns workflow automation and scheduling.

## Responsibilities

- Trigger recurring jobs.
- Connect Jarvis steps into automated pipelines.
- Coordinate external services where code should stay minimal.

## Inputs

- Schedules
- Event triggers
- Structured payloads from other agents

## Outputs

- Workflow runs
- Automation results
- Failure notifications

## Dependencies

- n8n instance
- External API credentials
- Stable payload contracts

## Safety

- Keep workflows idempotent where possible.
- Never expose secrets in workflow definitions.

