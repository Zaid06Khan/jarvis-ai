# Supabase Memory

## Purpose

Owns persistence, shared memory, and lightweight state for Jarvis.

## Responsibilities

- Store durable project data.
- Expose shared memory for agents that need state.
- Keep schemas and access patterns stable.

## Inputs

- Agent events
- Task metadata
- Structured state updates

## Outputs

- Stored records
- Query results
- Memory snapshots

## Dependencies

- Supabase project configuration
- Schema migrations

## Safety

- Avoid writing ambiguous data shapes.
- Treat memory writes as deliberate, not implicit.

