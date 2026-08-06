-- Fix: "canceling statement due to statement timeout" when saving/loading a
-- design that contains large embedded images.
--
-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Why: liveries store imported images inline as base64 data URLs inside
-- saved_designs.layers (JSONB), so a design with several images is a large row.
-- Postgres' default per-statement timeout for the API roles (~8s) can be
-- exceeded when writing (or reading) such a row, which surfaces as a failed
-- save. Raising the timeout gives these writes room to complete. The app change
-- that shipped alongside this (downscaling imported images) keeps new designs
-- small so this stays a safety margin rather than a crutch.

alter role authenticated set statement_timeout = '30s';
alter role anon set statement_timeout = '15s';

-- Reload PostgREST so pooled API connections pick up the new setting.
notify pgrst, 'reload config';
