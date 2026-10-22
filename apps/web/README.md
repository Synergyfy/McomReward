# @mcom/web — MCOM Rewards frontend

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. Runs on
**http://localhost:3005** and talks to the API at
`http://localhost:4000/api/v1`.

For monorepo setup, the full env reference, and backend details, see the
[root README](../../README.md).

## Quick start

```bash
# From the repository root
pnpm install
pnpm --filter @mcom/web dev      # next dev -p 3005
```

Create `apps/web/.env.local` before starting (see root README §6). Minimum:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3005
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_BYPASS_SSO=false
NEXT_PUBLIC_LOCAL_FILE_UPLOAD=true
```

`NEXT_PUBLIC_*` values are inlined at build time — restart `next dev` after
changing them.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm --filter @mcom/web dev` | Dev server on port 3005 |
| `pnpm --filter @mcom/web build` | Production build |
| `pnpm --filter @mcom/web start` | Serve the production build |
| `pnpm --filter @mcom/web lint` | ESLint |
| `pnpm --filter @mcom/web test:e2e` | Playwright (auto-starts dev server) |
| `pnpm --filter @mcom/web test:e2e:ui` | Playwright UI mode |

Install browsers once: `pnpm --filter @mcom/web exec playwright install`.

## Layout

- `src/app/` — App Router routes:
  - `(others)/` public marketing site, checkout, legal
  - `dashboard/` business dashboard
  - `admin/` platform admin
  - `participant/` customer portal
  - `plaque-user/`, `staff/` role dashboards
  - `auth/`, `sso/`, `sso-login/`, `login/`, `signup/`, `onboarding/`
  - `api/` route handlers for uploads and Cloudinary signing
- `src/components/` — shared and feature UI (`ui/` = shadcn/Radix primitives).
- `src/services/` — Axios client (`api.ts`) plus per-domain services/hooks.
- `src/lib/` — auth cookies, SSO URL helpers, utilities.
- `src/context/`, `src/hooks/`, `src/types/`.
- `src/proxy.ts` — protects `/dashboard/*` (Next 16 proxy convention).
- `e2e/` — Playwright specs.
- `public/uploads/` — local upload destination (gitignored).

## Auth & uploads

- Tokens live in `mcom_rewards_access` / `mcom_rewards_refresh` cookies; the
  Axios interceptor refreshes them on `401`, and `AuthBootstrap` restores the
  session on load.
- `NEXT_PUBLIC_BYPASS_SSO=true` disables frontend SSO redirects only; API calls
  still require a valid JWT.
- `NEXT_PUBLIC_LOCAL_FILE_UPLOAD=true` stores files in `public/uploads`;
  otherwise uploads go to Cloudinary (`CLOUDINARY_*` + `NEXT_PUBLIC_CLOUDINARY_*`).
