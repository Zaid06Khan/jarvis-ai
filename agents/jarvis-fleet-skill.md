---
name: jarvis-fleet
description: "Dispatch specialist work (content, finance, research, SEO, ads, resume, email, builder, etc.) to the EdVisingU Hermes fleet via the local FastAPI router."
version: 1.0.0
platforms: [linux]
metadata:
  hermes:
    tags: [dispatch, fleet, specialist, content, finance, research, seo, ads, ebook, router]
    related_skills: []
---

# Dispatch to the EdVisingU Hermes Fleet

A local FastAPI router at `http://127.0.0.1:8000` hosts 21 specialist agents.
When the user asks for specialist work, dispatch to the right agent using the
terminal tool, then relay the agent's answer in your reply.

## How to dispatch
Run this with the terminal tool (replace AGENT and the message):

```
curl -s -X POST http://127.0.0.1:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"AGENT","message":"<the user request>"}'
```

The JSON response has a `response` field — relay that text to the user.

## Routing table (agent → use for)
- hermes-content — LinkedIn / TikTok / YouTube / email content
- hermes-finance — MRR, revenue, pricing, projections
- hermes-research — market research, trends, competitor analysis
- hermes-seo — keywords, content briefs, meta tags
- hermes-ads — paid ad copy and targeting
- hermes-tiktok — TikTok scripts and hooks
- hermes-social — Discord/community posts
- hermes-credihire — resume analysis, ATS, cover letters
- hermes-email — email drafts in Dr. D's voice
- hermes-outreach — cold email / DMs / pitches
- hermes-proposals — consulting SOWs and proposals
- hermes-funnel — funnels and conversion flows
- hermes-builder — repos, scaffolds, technical specs
- hermes-advisor — student advising
- hermes-ops — system status
- hermes-crm / hermes-whop — CRM and membership ops
- hermes-etsy / hermes-gumroad / hermes-pinterest — listings & pins

For general questions, just answer directly — only dispatch for specialist work.
