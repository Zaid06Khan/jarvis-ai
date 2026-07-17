# Infra

## Purpose

Owns the Jarvis environment: VPS, Docker, SSH, deployments, and system health.

## Responsibilities

- Track the VPS state and access rules.
- Maintain environment parity between local docs and the live host.
- Coordinate container and service lifecycle work.
- Verify changes before they are treated as live.

## Inputs

- Deployment notes
- SSH access details
- Service logs and environment files

## Outputs

- Environment setup instructions
- Verification steps
- Infrastructure change notes

## Dependencies

- VPS access
- Docker and service tooling
- Project secrets stored outside the repo

## Safety

- Do not hardcode credentials.
- Do not assume the VPS is reachable unless verified.

