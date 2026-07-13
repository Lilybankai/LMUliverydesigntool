-- ---------------------------------------------------------------------------
-- Admin replies to suggestions + user-facing "you have a reply" notifications.
--
-- Run this in the Supabase SQL editor AFTER admin-analytics-schema.sql.
-- Idempotent — safe to re-run.
-- ---------------------------------------------------------------------------

alter table public.suggestions
  add column if not exists admin_reply text,
  add column if not exists admin_reply_at timestamptz,
  add column if not exists reply_read_at timestamptz;

-- Lets a user mark THEIR OWN reply as read without granting broad update rights
-- on the suggestions table (which would let them edit status/title/etc.).
create or replace function public.mark_suggestion_reply_read(p_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.suggestions
  set reply_read_at = now()
  where id = p_id and user_id = auth.uid();
$$;

grant execute on function public.mark_suggestion_reply_read(uuid) to authenticated;
