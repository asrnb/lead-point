create extension if not exists pgcrypto;
create extension if not exists vector;

create type urgency_level as enum ('asap', 'this_month', 'researching', 'unknown');
create type insurance_status as enum ('has_insurance', 'no_insurance', 'unknown');

create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source text not null,
  created_at timestamptz not null default now()
);

create table chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  content text not null,
  embedding vector(768) not null,
  created_at timestamptz not null default now()
);

create index chunks_embedding_idx on chunks using hnsw (embedding vector_cosine_ops);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references conversations(id) on delete cascade,
  name text,
  contact text,
  service text,
  urgency urgency_level not null default 'unknown',
  insurance insurance_status not null default 'unknown',
  score int not null check (score between 0 and 100),
  synced_to_crm boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- conversation_id is unique: a Lead is an upsert target keyed by its Conversation,
-- never appended to or duplicated (see docs/adr/0001-lead-lifecycle.md).

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger conversations_set_updated_at
  before update on conversations
  for each row execute function set_updated_at();

create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

alter table documents enable row level security;
alter table chunks enable row level security;
alter table conversations enable row level security;
alter table leads enable row level security;

-- Deliberately no policies: default-deny for `anon`/`authenticated` roles.
-- All reads/writes go through server routes using the service_role key,
-- which bypasses RLS entirely. Nothing in this schema is queried client-side.
