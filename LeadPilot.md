# LeadPilot — AI Lead Qualification Agent (Portfolio Demo)

> Drop this file into a fresh repo as `CLAUDE.md` (or `SPEC.md`) and tell Claude Code:
> "Read this spec and scaffold Phase 1."

## What this is
A production-quality demo of an AI chatbot that sits on a business website, answers
questions from the business's own knowledge base (RAG), qualifies visitors as leads,
books appointments, and pushes structured lead summaries to a "CRM" (Google Sheets,
architected so it can be swapped for GoHighLevel/HubSpot via one adapter).

**Demo business (fictional):** "Riverside Dental Clinic" — a small clinic with services,
pricing FAQs, insurance questions, and appointment booking. All content is seeded.

**This is a portfolio case study, not a live product.** Optimize for: impressive live
demo, clean code a hiring manager can read, and a README that reads like a case study.

## Hard constraints
- **$0 budget.** Every service must run on a free tier. No paid APIs.
- Builder: solo dev (April), experienced with Next.js/TypeScript/Supabase.
- No long-term maintenance planned — no cron jobs, no queues, nothing that rots.

## Tech stack (all free tier)
| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 App Router + TypeScript | Deploy on Vercel free tier |
| Styling | Tailwind CSS | |
| DB + vectors | Supabase (Postgres + pgvector) | Free tier, RLS on |
| LLM | Google Gemini API — `gemini-flash-latest` | Free tier, no card required. Uses the "latest" alias, not a dated model, since dated models get retired for new API keys (hit this during Phase 2 — `gemini-2.5-flash` was already blocked) and the spec explicitly wants nothing that rots. |
| Embeddings | Gemini `gemini-embedding-001` | Free tier |
| Booking | Cal.com free plan, embedded widget | Real bookings in demo |
| CRM sink | Google Sheets via service account | Behind a `CrmAdapter` interface |
| Fallback LLM | Groq free tier (optional env swap) | Same adapter pattern |
| Rate limiting | Upstash Redis free tier | Global limit on `/api/chat`, shared across serverless instances |

Keep all keys in `.env.local`; commit `.env.example` with placeholders.

## Architecture
```
/app
/page.tsx → Riverside Dental marketing page (chat widget embedded)
/admin → simple password-gated dashboard (env var password is fine for demo)
/api/chat → streaming chat endpoint (RAG + tools)
/api/lead → lead capture endpoint
/lib
/rag.ts → embed query, pgvector similarity search, build context
/llm.ts → LlmAdapter interface + GeminiAdapter (+ optional GroqAdapter)
/crm.ts → CrmAdapter interface + SheetsAdapter (find-or-append by Lead id, so
re-upserted Leads update their existing Sheet row instead of duplicating;
document how a GhlAdapter would slot in)
/qualify.ts → lead scoring logic (see below)
/scripts
/seed.ts → chunk + embed knowledge base markdown files into Supabase
/knowledge
*.md → ~8 seeded docs: services, pricing, insurance, hours, FAQs
```

## Core flows

### 1. RAG chat
- User asks a question → embed query → pgvector top-k (k=5, cosine) → inject chunks
into system prompt → stream Gemini response.
- System prompt: friendly clinic receptionist persona; answer ONLY from provided
context; if unknown, offer to take contact details; never invent pricing/medical advice.
- Store conversation transcripts in `conversations` table (session id, messages jsonb).

### 2. Lead qualification (the differentiator)
- The model is instructed to naturally collect: name, contact (email/phone), service
interest, urgency/timeline, insurance status.
- After each assistant turn, unconditionally run a lightweight extraction call
(same Gemini model, JSON-only output) against the full transcript so far, returning
`{name, contact, service, urgency, insurance, score}`. `urgency` and `insurance` are
constrained enums (see schema) — the model must bucket into these, not return
freeform text.
- Score 0–100 heuristic: contact info present (+40), named service (+20),
urgency is `asap` or `this_month` (+25), insurance is `has_insurance` (+15).
- First time score ≥ 60 for a conversation → creates its Lead row (upsert, keyed by
`conversation_id`) and syncs via `CrmAdapter` (Sheets, find-or-append by Lead id).
Every later extraction on that conversation re-upserts the row and re-syncs the CRM,
regardless of whether the recomputed score is still ≥ 60 — qualification is a
one-way gate on *creation*, not a live condition (see
[ADR-0001](./docs/adr/0001-lead-lifecycle.md)). Each conversation always produces at
most one Lead; no cross-conversation dedup by contact info.

### 3. Booking
- When user expresses intent to book, the assistant surfaces the Cal.com embed.
Implemented via a Gemini tool/function call (`show_booking`), not a sentinel string
embedded in the response text — the client distinguishes tool-call stream events
from text-token events and renders the widget on the tool call, which is more
reliable than parsing a magic marker out of streamed text.

### 4. Admin dashboard (`/admin`)
- Table of leads: score, fields captured, timestamp, link to transcript.
- Simple stats: conversations, qualified leads, conversion % (defined as
qualified leads ÷ total conversations — the Qualified rate, not a booking or
sale conversion, since booking completion isn't tracked; see non-goals).
- Auth: single shared password from env (state clearly in README this is demo-only;
production would use Supabase Auth).

## Database schema (Supabase)
```sql
documents(id, title, source, created_at)
chunks(id, document_id, content, embedding vector(768))
conversations(id, session_id, messages jsonb, created_at)
leads(id, conversation_id, name, contact, service,
urgency enum('asap','this_month','researching','unknown'),
insurance enum('has_insurance','no_insurance','unknown'),
score int, synced_to_crm bool, created_at)
```
Enable RLS; server routes use service role key; nothing sensitive client-side.

## Build phases (for Claude Code)
1. **Phase 1 — Scaffold:** Next.js app, Supabase schema + migrations, seed script,
marketing page with chat UI shell (no LLM yet). Verify seed embeds run.
2. **Phase 2 — RAG chat:** `/api/chat` streaming with Gemini + pgvector retrieval.
Test with 10 sample questions; log retrieved chunks in dev. ✅ Done — verified
end-to-end (retrieval, streaming, and conversation persistence all confirmed
against live Supabase + Gemini).
3. **Phase 3 — Qualification + CRM:** extraction call, scoring, SheetsAdapter,
leads table + admin dashboard. ✅ Done — verified end-to-end (structured
extraction, deterministic scoring, upsert-and-resync CRM, password-gated
admin dashboard with stats + transcript links, all against live services).
4. **Phase 4 — Booking + polish:** Cal.com embed trigger, empty/error states,
mobile layout, rate limiting on chat endpoint (Upstash Redis free tier). ✅
Done — migrated to the AI SDK's `useChat`/UIMessage streaming so the
`show_booking` tool call is a distinct stream event the client renders as an
iframe; rate limit verified (20/10min per session, confirmed 429 on the
21st request); mobile-responsive widget sizing.
5. **Phase 5 — Case study packaging:** README with problem → solution → architecture
diagram → results; record 2–3 min Loom; add screenshots.

## Design direction
Clean, trustworthy healthcare aesthetic — soft neutrals, one confident accent color,
generous whitespace. The chat widget should feel native to the site, not bolted on.
(Distinct from run.ilo's predawn theme — this should read "professional clinic".)

## README / case-study checklist (do not skip — this is the deliverable)
- One-paragraph problem statement written for business owners, not devs.
- Architecture diagram (Mermaid is fine).
- "Swap the CRM" section showing the adapter interface and a stub `GhlAdapter`.
- Cost section: "$0/month on free tiers" table.
- Link to live demo + Loom walkthrough.
- Honest limitations section (demo auth, free-tier rate limits).

## Explicit non-goals
- No multi-tenancy, no payments, no user accounts, no email sequences.
- No fine-tuning. RAG only.
- No cross-conversation lead dedup. Each conversation produces its own Lead row,
  even if the same person's contact info shows up in a prior conversation.
- No booking completion tracking. Showing the Cal.com widget is the extent of
  LeadPilot's involvement; whether the visitor actually books is Cal.com's concern,
  not recorded in our DB or admin dashboard.
- Do not add features beyond this spec without asking.
