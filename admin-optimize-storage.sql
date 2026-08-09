-- Allow admins to update ANY saved design.
--
-- Needed for the one-time "Optimise storage" action in the admin dashboard,
-- which re-compresses existing designs' embedded images to WebP (and
-- de-duplicates them) to reclaim database space. Normal update is owner-scoped;
-- this adds an admin-only policy on top. Run once in the Supabase SQL editor.

drop policy if exists "Admins can update all saved designs" on public.saved_designs;
create policy "Admins can update all saved designs"
  on public.saved_designs for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
