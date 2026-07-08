create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  marketing_opt_in boolean not null default false,
  marketing_opt_in_date timestamptz,
  free_export_used boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  vehicle_id text not null,
  base_colour text,
  custom_colour text,
  base_opacity numeric not null default 1,
  layers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  checkout_id text unique,
  subscription_id text,
  status text not null default 'pending' check (status in ('pending', 'active', 'canceled', 'expired')),
  buyer_email text,
  activated_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists saved_designs_set_updated_at on public.saved_designs;
create trigger saved_designs_set_updated_at
  before update on public.saved_designs
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.saved_designs enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read own saved designs" on public.saved_designs;
create policy "Users can read own saved designs"
  on public.saved_designs for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own saved designs" on public.saved_designs;
create policy "Users can create own saved designs"
  on public.saved_designs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own saved designs" on public.saved_designs;
create policy "Users can update own saved designs"
  on public.saved_designs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own saved designs" on public.saved_designs;
create policy "Users can delete own saved designs"
  on public.saved_designs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.saved_designs to authenticated;
grant select on public.subscriptions to authenticated;
