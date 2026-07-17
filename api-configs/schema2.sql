-- Jarvis Dashboard — additional tables + columns + sample data
-- Run in Supabase (jarvis-db) -> SQL Editor. Safe to re-run.

-- Revenue ledger (Gumroad / Etsy / Aria)
create table if not exists revenue (
  id uuid default gen_random_uuid() primary key,
  source text not null,
  amount numeric not null default 0,
  occurred_at timestamptz not null default now(),
  meta jsonb,
  created_at timestamptz default now()
);

-- Agent chat history (dashboard Agent Chat page)
create table if not exists agent_chats (
  id uuid default gen_random_uuid() primary key,
  agent text not null,
  role text not null,
  content text not null,
  model text,
  created_at timestamptz default now()
);

-- Extend leads for the CRM view
alter table leads add column if not exists business_type text;
alter table leads add column if not exists last_contact timestamptz;
alter table leads add column if not exists next_follow_up timestamptz;
alter table leads add column if not exists est_revenue numeric default 0;

-- Extend products for the ebook manager
alter table products add column if not exists sales_count integer default 0;
alter table products add column if not exists revenue numeric default 0;
alter table products add column if not exists cover_url text;

alter table revenue enable row level security;
alter table agent_chats enable row level security;

-- ---- SAMPLE DATA (only seeds if revenue is empty; delete once real data flows) ----
do $$
begin
  if not exists (select 1 from revenue) then
    insert into revenue (source, amount, occurred_at)
    select s,
      (random() * (case s when 'aria' then 220 else 55 end))::numeric(10,2),
      now() - (g || ' days')::interval
    from generate_series(0, 29) g,
         (values ('gumroad'), ('etsy'), ('aria')) as t(s)
    where random() < 0.6;
  end if;

  if not exists (select 1 from leads) then
    insert into leads (name, email, source, business_type, status, est_revenue, last_contact, notes) values
      ('Bloor Street Barbers','bloor@example.com','aria','barbershop','interested',300, now() - interval '2 days','Wants after-hours booking'),
      ('Queen West Nails','qw@example.com','aria','nail salon','demo',450, now() - interval '1 day','Demo scheduled Friday'),
      ('Danforth Dental','dd@example.com','aria','dental clinic','contacted',0, now() - interval '5 days','Left voicemail'),
      ('Liberty Hair Co','liberty@example.com','aria','hair salon','converted',600, now(),'Live on Aria');
  end if;

  if not exists (select 1 from products where type = 'ebook') then
    insert into products (name, type, price, description, platform, active, sales_count, revenue) values
      ('Detox Water Recipes','ebook',9,'7-day detox water guide for busy people','gumroad',true,42,378),
      ('Morning Routines That Stick','ebook',12,'Science-backed AM routines','gumroad',true,18,216);
  end if;
end $$;
