# Jarvis Vercel Router Proxy Design

## Scope

Prepare `dashboards/jarvis-dashboard` for Vercel without changing dashboard features or UI. The production branch remains `dev`.

## Architecture

Browser components call same-origin Next.js endpoints under `/api`. Those route handlers call the FastAPI router through `src/lib/router.ts`. Only server code reads `ROUTER_URL` and `ROUTER_TOKEN`, so the browser bundle and network requests never contain the bearer token.

The dashboard will keep its dedicated route handlers instead of adding a catch-all proxy. Each handler exposes only the VPS operations that the dashboard uses.

## Configuration

Vercel must provide these server-only values:

- `ROUTER_URL` set to `http://159.203.3.38:8000`
- `ROUTER_TOKEN` set to the actual bearer token as a Vercel secret

The router helper will reject missing configuration. It will not contain a production URL or empty-token fallback. A committed `.env.example` will list required variable names without values.

## Request Handling

`routerFetch` will validate that paths begin with `/`, attach the bearer token, disable caching, and abort stalled requests. Route handlers will continue returning same-origin JSON responses to the dashboard.

The helper will throw on upstream HTTP errors. Existing route handlers can translate those failures into their current fallback or `502` responses without leaking the token or upstream response body.

## Verification

Verification will include:

- Search client files for direct VPS URLs and router environment variables.
- Run lint and the production Next.js build.
- Confirm Vercel uses `dev` and `dashboards/jarvis-dashboard`.
- Exercise the deployed login, overview, system status, and one router-backed action without exposing credentials.

## Out Of Scope

This change will not refactor dashboard pages, change the UI, alter Supabase data, or modify the VPS router.
