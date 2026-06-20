-- EdVisingU / Jarvis — Supabase schema (project: jarvis-db)
-- Run this in Supabase dashboard → SQL Editor. Safe to re-run (IF NOT EXISTS).

create extension if not exists vector;

-- AI memory (vector search; alternative/complement to ChromaDB)
create table if not exists ai_memory (
  id uuid default gen_random_uuid() primary key,
  agent_name text not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Leads / CRM
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  name text, email text unique, source text,
  status text default 'new', tags text[], notes text,
  created_at timestamptz default now()
);

-- Content pipeline queue
create table if not exists content_queue (
  id uuid default gen_random_uuid() primary key,
  topic text not null, platform text not null,
  status text default 'pending',
  raw_content text, final_content text,
  scheduled_at timestamptz, published_at timestamptz,
  created_at timestamptz default now()
);

-- Products / courses / offers
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null, type text not null, price numeric,
  description text, platform text, url text,
  active boolean default true, created_at timestamptz default now()
);

-- Members / subscribers
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  email text unique not null, name text, whop_id text,
  plan text, status text default 'active', joined_at timestamptz default now()
);

alter table ai_memory     enable row level security;
alter table leads         enable row level security;
alter table content_queue enable row level security;
alter table products      enable row level security;
alter table members       enable row level security;
-- RLS on, no policies yet => only the service_role key can read/write (server-side only).
