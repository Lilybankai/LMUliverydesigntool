# LMU Livery Design Tool

React/Vite livery design tool exported from Base44.

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

## Coolify Deployment

Use Coolify's static site or Nixpacks flow for this repository.

- Install command: `npm ci`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20 or newer

Optional Base44 environment variables:

```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-base44-backend.example
VITE_BASE44_FUNCTIONS_VERSION=prod
```

Without those variables, the app builds and runs in standalone mode, but Base44-backed login, saved designs, subscriptions, uploads, and functions are unavailable.
