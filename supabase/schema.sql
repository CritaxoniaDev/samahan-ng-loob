-- Run this once in the Supabase SQL editor before migrating data.
-- IDs are text so the original Firestore document IDs (and any shared links) are preserved.

create table if not exists public.notes (
  id text primary key default gen_random_uuid()::text,
  text text not null,
  x double precision not null default 0,
  y double precision not null default 0,
  color text,
  font text,
  -- stored as the same locale string the app has always written
  timestamp text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id text primary key default gen_random_uuid()::text,
  message text,
  image text,
  theme text,
  created_at timestamptz not null default now()
);

-- Public read + insert only, matching what the app does today.
alter table public.notes enable row level security;
alter table public.messages enable row level security;

create policy "Public can read notes" on public.notes for select to anon using (true);
create policy "Public can add notes" on public.notes for insert to anon with check (true);
create policy "Public can read messages" on public.messages for select to anon using (true);
create policy "Public can add messages" on public.messages for insert to anon with check (true);

-- Optional: live updates on the whiteboard when someone else pins a note.
alter publication supabase_realtime add table public.notes;
