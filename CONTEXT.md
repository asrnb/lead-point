# LeadPilot

An AI chatbot that answers questions from a business's knowledge base (RAG), qualifies visitors as leads, and books appointments. Demoed as a fictional dental clinic ("Riverside Dental Clinic").

## Language

**Lead**:
A snapshot of the current best-known qualification state for one Conversation — one row per `conversation_id`, upserted (overwritten) every time extraction re-runs after the score first crosses the Qualified threshold. Fields (name, contact, service, urgency, insurance, score) can change on later upserts, but once created a Lead row is never deleted or un-synced, even if a later score dip would no longer cross the threshold on its own.
_Avoid_: Contact, prospect

**Qualified**:
The one-way gate a Conversation crosses the first time its extracted score reaches ≥ 60, triggering creation of its Lead row. Crossing is sticky: it is a gate on Lead *creation*, not a live condition the Lead must keep satisfying.
_Avoid_: Hot lead, converted

**Urgency**:
An enum extracted from the conversation: `asap | this_month | researching | unknown`. Scoring reads `asap` and `this_month` identically (+25 each — both mean "has a timeline"); the enum keeps the distinction visible in the admin dashboard even though the scorer treats them the same.
_Avoid_: Timeline, freeform urgency text

**Insurance**:
An enum extracted from the conversation: `has_insurance | no_insurance | unknown`. Scoring reads this directly (+15 for `has_insurance`).
_Avoid_: Freeform insurance text

**Conversation**:
The full message history tied to one `session_id`, identified by a client-generated UUID persisted in `localStorage`. Survives page reloads and tab closes; only ends if the visitor clears storage or switches browser/device. At most one Lead per Conversation.
_Avoid_: Session (as a separate concept — a Conversation IS the session, scoped by `session_id`), chat, thread

**Conversion rate**:
Qualified leads ÷ total conversations, shown on the admin dashboard. Measures how often a conversation crosses the Qualified gate — not a booking or sale conversion, since booking completion isn't tracked (see non-goals).
_Avoid_: Booking rate, close rate

**CrmAdapter**:
The interface that keeps the CRM sink (Google Sheets) in sync with a Lead's current state. Every upsert of a qualified Lead re-syncs its corresponding CRM row (find-or-append, keyed by the Lead's id) — the CRM always reflects current state, not just the first qualification.
_Avoid_: CRM sync (as a one-time action), CRM push

