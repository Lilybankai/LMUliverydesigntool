-- ---------------------------------------------------------------------------
-- Admin dashboard: analytics events + feature suggestions.
--
-- Run this in the Supabase SQL editor AFTER supabase-schema.sql.
-- It is idempotent — safe to re-run.
--
-- Admin access is granted by email allowlist. Keep the list inside
-- public.is_admin() in sync with ADMIN_EMAILS in src/lib/admin.js.
-- ---------------------------------------------------------------------------

-- Returns true when the calling user's email is in the admin allowlist.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = any (array[
    'marketing@thelilybankagency.co.uk'
  ]);
$$;

-- --------------------------------------------------------------------------
-- Analytics events (page views, downloads, etc.)
-- --------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at);
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name);

-- --------------------------------------------------------------------------
-- Feature suggestions / feedback
-- --------------------------------------------------------------------------
create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  category text not null default 'feature' check (category in ('feature', 'bug', 'idea', 'other')),
  title text not null,
  body text,
  status text not null default 'new' check (status in ('new', 'planned', 'in_progress', 'done', 'declined')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suggestions_created_at_idx on public.suggestions (created_at);
create index if not exists suggestions_status_idx on public.suggestions (status);

drop trigger if exists suggestions_set_updated_at on public.suggestions;
create trigger suggestions_set_updated_at
  before update on public.suggestions
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- Row level security
-- --------------------------------------------------------------------------
alter table public.analytics_events enable row level security;
alter table public.suggestions enable row level security;

-- analytics_events: any signed-in user can log their own events; only admins read.
drop policy if exists "Anyone can insert analytics events" on public.analytics_events;
create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  to authenticated
  with check (user_id is null or (select auth.uid()) = user_id);

drop policy if exists "Admins can read analytics events" on public.analytics_events;
create policy "Admins can read analytics events"
  on public.analytics_events for select
  to authenticated
  using (public.is_admin());

-- suggestions: users create + read their own; admins read all + update status.
drop policy if exists "Users can insert suggestions" on public.suggestions;
create policy "Users can insert suggestions"
  on public.suggestions for insert
  to authenticated
  with check (user_id is null or (select auth.uid()) = user_id);

drop policy if exists "Users read own or admins read all suggestions" on public.suggestions;
create policy "Users read own or admins read all suggestions"
  on public.suggestions for select
  to authenticated
  using (public.is_admin() or (select auth.uid()) = user_id);

drop policy if exists "Admins can update suggestions" on public.suggestions;
create policy "Admins can update suggestions"
  on public.suggestions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admin read-all on the existing tables so the dashboard can count them.
-- (These are additive — normal users keep their own-row policies.)
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all saved designs" on public.saved_designs;
create policy "Admins can read all saved designs"
  on public.saved_designs for select
  to authenticated
  using (public.is_admin());

-- --------------------------------------------------------------------------
-- Grants
-- --------------------------------------------------------------------------
grant select, insert on public.analytics_events to authenticated;
grant select, insert, update on public.suggestions to authenticated;
