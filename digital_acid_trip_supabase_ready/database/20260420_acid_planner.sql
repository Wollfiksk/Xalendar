-- Demo-friendly schema for Digital Acid Trip Planner cloud sync.
-- For production, replace the public policies with authenticated RLS rules.

create extension if not exists pgcrypto;

create table if not exists public.acid_planner_state (
  workspace text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.acid_planner_state enable row level security;

create or replace function public.set_acid_planner_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists acid_planner_state_set_updated_at on public.acid_planner_state;
create trigger acid_planner_state_set_updated_at
before update on public.acid_planner_state
for each row execute function public.set_acid_planner_updated_at();

-- DEMO POLICIES
-- These are intentionally open so the static frontend can work immediately
-- with a publishable/anon key and no auth flow.

drop policy if exists "acid planner public select" on public.acid_planner_state;
create policy "acid planner public select"
on public.acid_planner_state
for select
to anon
using (true);

drop policy if exists "acid planner public insert" on public.acid_planner_state;
create policy "acid planner public insert"
on public.acid_planner_state
for insert
to anon
with check (true);

drop policy if exists "acid planner public update" on public.acid_planner_state;
create policy "acid planner public update"
on public.acid_planner_state
for update
to anon
using (true)
with check (true);
