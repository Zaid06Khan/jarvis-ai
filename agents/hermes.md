# Hermes Gateway

## Purpose

Owns the communication gateway for Telegram and Discord.

## Responsibilities

- Receive messages and route them into the Jarvis workflow.
- Return responses back to the correct chat channel.
- Preserve message context and channel identity.

## Inputs

- User chat messages
- Agent replies
- Notification events

## Outputs

- Chat responses
- Event notifications
- Message metadata

## Dependencies

- Bot credentials
- Messaging platform APIs
- Orchestrator or router integration

## Safety

- Never store tokens in repo files.
- Keep outbound messages aligned with the source channel.

