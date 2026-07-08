# LMU Livery Design Tool

React/Vite livery design tool for Le Mans Ultimate.

## Local Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Supabase Setup

Run [supabase-schema.sql](supabase-schema.sql) in the Supabase SQL Editor before enabling saves/login in production.

Supabase Auth notes:

- Enable the Google provider in Supabase Auth if you want the existing "Sign in with Google" button to work.
- Add your local and production URLs to Supabase Auth redirect URLs.
- The current checkout/paywall flow is not connected to a payment provider yet.

## Coolify Deployment

Use Coolify's static site or Nixpacks flow for this repository.

- Install command: `npm ci`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20 or newer

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```
