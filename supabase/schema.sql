create extension if not exists pgcrypto;

create table if not exists public.tabs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 80),
  token_address text not null,
  host_address text,
  tx_hash text,
  chain_id integer not null default 143,
  created_at timestamptz not null default now()
);

alter table public.tabs enable row level security;
create policy "public read tabs" on public.tabs for select using (true);
create policy "service insert tabs" on public.tabs for insert with check (auth.role() = 'service_role');
