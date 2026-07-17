# FastAPI Router

## Purpose

Owns the specialist agent router exposed through FastAPI.

## Responsibilities

- Route requests to the correct specialist agent.
- Keep request and response contracts stable.
- Expose health and status endpoints if needed.

## Inputs

- Orchestrator handoffs
- Agent task payloads
- Service status and error reports

## Outputs

- Routed task results
- Response envelopes
- Errors with enough context to recover

## Dependencies

- FastAPI app and runtime
- Specialist agent registry

## Safety

- Keep routing behavior explicit.
- Avoid coupling the API to a single downstream agent.

