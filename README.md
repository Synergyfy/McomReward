# MCOM Rewards

A loyalty & rewards platform for the MCOM ecosystem. Businesses create campaigns,
issue points/stamps, manage customers and staff, and participants earn and redeem
rewards. The repository is a **pnpm + Turborepo monorepo** with two applications:

| App | Package | Stack | Local URL |
| --- | --- | --- | --- |
| Frontend | `@mcom/web` | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix/shadcn, TanStack Query | http://localhost:3005 |
| Backend | `@mcom/api` | NestJS 11, TypeScript, TypeORM, PostgreSQL, Passport/JWT, Swagger | http://localhost:4000/api/v1 |

Extra services (optional for basic local work):

| Service | Purpose | Default URL |
| --- | --- | --- |
| MCOM Central API | SSO, entitlements, service tokens, wallet | http://localhost:3010 |
| MCOM Central web | Login/signup/upgrade flows | http://localhost:3000 |
| PostgreSQL | Primary database | localhost:5432 |

---

## 1. Repository structure

```text
mcom-rewards/
├── apps/
│   ├── api/                       # NestJS backend (@mcom/api)
│   └── web/                       # Next.js frontend (@mcom/web)
├── package.json                   # Root scripts, runs tasks through Turborepo
├── pnpm-workspace.yaml            # Workspace packages + approved native builds
├── pnpm-lock.yaml
├── turbo.json                     # Task graph (build/dev/lint/test/format)
├── .npmrc                         # shamefully-hoist, peer settings
└── .gitignore
```

### Backend — `apps/api`

```text
apps/api/
├── src/
│   ├── main.ts                    # Bootstrap: CORS, global prefix, pipes, Swagger
│   ├── app.module.ts              # Root module + global guards/middleware
│   ├── auth/                      # Login, refresh, JWT/local/partner strategies
│   ├── common/                    # Guards, decorators, filters, enums, utils, hash
│   ├── config/                    # jwt.config.ts, commission.config.ts
│   ├── database/
│   │   ├── data-source.ts         # Dev TypeORM config (migrations auto-run)
│   │   ├── data-source-prod.ts    # Prod TypeORM config (.env.prod, SSL)
│   │   ├── entities/              # Base entity
│   │   └── migrations/            # ~100 TypeORM migrations
│   ├── interceptors/              # camelCase response interceptor
│   ├── mail/                      # Nodemailer (Gmail SMTP)
│   ├── middleware/                # Request logging
│   ├── resources/                 # ~50 feature modules (controllers/services/entities/DTOs)
│   ├── seeder/                    # Full demo seeder
│   └── seed*.ts                   # Seed entrypoints (see §7)
├── test/                          # Jest e2e specs + test-utils
├── docs/                          # API/feature documentation (see §12)
├── .env.example                   # MCOM ecosystem variables example
├── nest-cli.json
├── tsconfig.json
├── eslint.config.js
└── vercel.json                    # Serverless deployment config
```

Each folder under `src/resources/` follows the NestJS convention:
`*.module.ts`, `*.controller.ts`, `*.service.ts`, `entities/`, `dto/`, and often
`*.spec.ts`.

### Frontend — `apps/web`

```text
apps/web/
├── src/
│   ├── app/                       # Next.js App Router routes (see §10)
│   │   ├── layout.tsx             # Root layout, fonts, providers
│   │   ├── providers.tsx          # React Query / toast providers
│   │   └── api/                   # Next route handlers (uploads, Cloudinary signing)
│   ├── components/                # UI + feature components (shadcn/ui in components/ui)
│   ├── context/                   # Campaign, impersonation, guide, dialog contexts
│   ├── hooks/                     # Shared hooks
│   ├── lib/                       # auth-cookies, sso-utils, utils, export helpers
│   ├── services/                  # Axios client + one folder per domain
│   ├── types/                     # Shared TS types
│   └── proxy.ts                   # Next 16 route protection for /dashboard
├── e2e/                           # Playwright specs
├── public/                        # Static assets; local uploads go to public/uploads
├── next.config.ts                 # Remote image allow-list
├── playwright.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json                # shadcn/ui config
├── next-env.d.ts
├── tsconfig.json                  # `@/*` -> `./src/*` alias
└── eslint.config.mjs
```

---

## 2. Prerequisites

- **Node.js 20+** (Node 22 LTS is what this repo is currently developed on).
- **pnpm 9.x** (`packageManager` pins `pnpm@9.15.9`).
- **PostgreSQL 14+** running locally (or a reachable Postgres instance).
- Git.

Enable pnpm via Corepack:

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
node -v   # v20+ (v22 recommended)
pnpm -v   # 9.15.9
```

---

## 3. Quick start (both apps)

```bash
# 1. Clone and install from the repository root
git clone https://github.com/Synergyfy/McomReward.git
cd mcom-rewards
pnpm install

# 2. Create the database
createdb mcom_rewards
# or: psql -U postgres -c "CREATE DATABASE mcom_rewards;"

# 3. Configure env files
cp apps/api/.env.example apps/api/.env   # then add DB/JWT/email keys from §5
# create apps/web/.env.local (§6)

# 4. Start both apps (Turborepo)
pnpm dev
```

Then open:

- Frontend: **http://localhost:3005**
- API: **http://localhost:4000/api/v1**
- Swagger UI: **http://localhost:4000/api-docs**

The API **runs pending migrations automatically on boot** (`migrationsRun: true`
in `src/database/data-source.ts`). If the database does not exist or credentials
are wrong, the API will fail during startup.

A brand-new empty database is fully provisioned by the migration chain — no
dump or manual SQL is required. The chain starts with
`1764182062300-BaselineSchema.ts`, which creates the schema that predates the
migration history (see §7).

Optional demo data (⚠️ **wipes existing data first**):

```bash
pnpm --filter @mcom/api seed
```

---

## 4. Root scripts

Run from the repository root. Turborepo fans out to each workspace that defines
the task.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Runs `dev` in every workspace (API watch mode + Next dev on 3005) |
| `pnpm start:dev` | Alias for the same watch-mode setup |
| `pnpm build` | Builds API (`nest build`) and web (`next build`) |
| `pnpm lint` | ESLint for both workspaces |
| `pnpm test` | Runs `test` in workspaces that define it (currently the API/Jest) |
| `pnpm verify:migrations` | Builds a throwaway database from migrations and asserts the schema matches the entities |
| `pnpm format` | Prettier write (API; web has no format script) |

Target one app with pnpm filters:

```bash
pnpm --filter @mcom/api dev
pnpm --filter @mcom/web dev
pnpm --filter @mcom/api build
pnpm --filter @mcom/web lint
```

> `turbo.json` declares `build`/`dev` for `.next` and `dist` outputs. Build the
> API before running `start:prod`.

---

## 5. Backend environment (`apps/api/.env`)

`apps/api/.env.example` covers the MCOM ecosystem block. A full local file needs
the following variables. Values are placeholders — never commit real secrets.

```dotenv
# ---- Core ----
NODE_ENV=development
PORT=4000
JWT_SECRET=change-me-to-a-long-random-string
ADMIN_EMAIL=admin@example.com          # used only by the seeder
ADMIN_PASSWORD=password                # used only by the seeder
COMMISSION_RATE=0.9

# ---- PostgreSQL ----
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_NAME=mcom_rewards

# ---- Email (Nodemailer / Gmail SMTP) ----
EMAIL_USER=you@gmail.com
EMAIL_PASSWORD=your-google-app-password

# ---- Payments (optional for basic dev) ----
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox

# ---- Bot protection (optional) ----
TURNSTILE_SECRET=

# ---- MCOM Central / SSO (optional for basic local auth) ----
MCOM_SOLUTIONS_URL=http://localhost:3010
MCOM_CENTRAL_URL=http://localhost:3000/api/v1
MCOM_CENTRAL_WEB_URL=http://localhost:3000
MCOM_CLIENT_ID=mcom-rewards
MCOM_CLIENT_SECRET=your-oauth-client-secret
MCOM_REDIRECT_URI=http://localhost:3005/auth/callback
MCOM_SCOPES=profile email business membership packages
MCOM_PLATFORM_SLUG=mcom-rewards

# Shared-secret / HMAC / webhook security
MCOM_API_KEY=your-shared-system-api-key
MCOM_HMAC_SECRET=your-hmac-data-sharing-secret
MCOM_WEBHOOK_SECRET=your-webhook-signing-secret
MCOM_PARTNER_WEBHOOK_URLS=
MCOM_REWARDS_FUNDORDONATE_WEBHOOK_SECRET=
SSO_SECRET=legacy-shared-sso-secret
PROVISION_API_KEY=

# ---- Wallet & MCOM Pay ----
MCOM_WALLET_ENABLED=true
MCOM_PAY_ENABLED=true

# ---- Zero-hop service mesh (direct app-to-app RS256) ----
MCOM_SERVICE_ENABLED=true
MCOM_SERVICE_BASE_URL=http://localhost:4000
MCOM_SERVICE_SCOPES=rewards:read rewards:issue mall:read mall:write
MCOM_ALLOWED_CALLERS=fundordonate,mcom-mall
MCOM_PARTNER_EVENT_PATH=/api/v1/partner/events
MCOM_PARTNER_EVENT_SCOPE=rewards:issue
MCOM_MALL_EVENT_SCOPE=mall:write

# ---- MCOM Mall peer (optional) ----
MALL_API_URL=https://api.mall.mcom.com
MALL_APP_URL=http://localhost:3001
MCOM_MALL_CLIENT_ID=mcom-mall
```

What actually matters:

| Variable | Required | Notes |
| --- | --- | --- |
| `JWT_SECRET` | **Yes** | Signs access tokens. Changing it invalidates existing sessions. |
| `POSTGRES_*` | **Yes** | Read by `src/database/data-source.ts`. Defaults exist but are placeholders. |
| `PORT` | No | Defaults to `3000` in `main.ts`; the development `.env` uses `4000`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeder only | Admin account created by `seed`. |
| `EMAIL_*` | For OTP/reset mail | Gmail SMTP on port 587; use an app password. |
| `COMMISSION_RATE` | No | Loaded by `src/config/commission.config.ts` (default `0.9`). |
| `MCOM_*`, `MALL_*`, `SSO_SECRET`, `PROVISION_API_KEY` | Only for SSO/M2M/wallet features | Missing values disable or degrade those integrations. |
| `STRIPE_*`, `PAYPAL_*` | Only for checkout | PayPal defaults to sandbox. |
| `TURNSTILE_SECRET` | No | When absent, server-side Turnstile verification is skipped. |

Notes:

- `ConfigModule.forRoot({ isGlobal: true })` loads `apps/api/.env` relative to the
  process working directory; start the API from `apps/api` (the workspace scripts
  already do).
- Production uses `src/database/data-source-prod.ts`, which reads `.env.prod`,
  enables SSL, and does **not** auto-run migrations.

---

## 6. Frontend environment (`apps/web/.env.local`)

```dotenv
# ---- Core ----
NEXT_PUBLIC_APP_URL=http://localhost:3005
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# ---- Auth / SSO ----
NEXT_PUBLIC_BYPASS_SSO=false
NEXT_PUBLIC_MCOM_SOLUTIONS_URL=http://localhost:3000
NEXT_PUBLIC_MCOM_CENTRAL_API=http://localhost:3010/api/v1
NEXT_PUBLIC_MCOM_CLIENT_ID=mcom-rewards
NEXT_PUBLIC_MCOM_REDIRECT_URI=http://localhost:3005/auth/callback
NEXT_PUBLIC_MCOM_SCOPES=profile email business membership packages
# Fallbacks kept for older deployments:
NEXT_PUBLIC_SSO_CLIENT_ID=
NEXT_PUBLIC_MCOM_SOLUTIONS_API_URL=

# ---- Uploads ----
# true  -> write to apps/web/public/uploads (local dev)
# false -> use Cloudinary
NEXT_PUBLIC_LOCAL_FILE_UPLOAD=true
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
NEXT_PUBLIC_CLOUDINARY_API_SECRET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ---- Payments / bot protection (optional) ----
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

Important:

- `NEXT_PUBLIC_*` variables are **inlined at build time**. Restart `next dev`
  after changing them; rebuild for production.
- `NEXT_PUBLIC_API_BASE_URL` must include `/api/v1`; it is used directly as the
  Axios base URL.
- With `NEXT_PUBLIC_BYPASS_SSO=true` the frontend skips SSO redirects and session
  bootstrap. It does **not** bypass backend authorization — protected API calls
  still need a valid JWT.
- Local uploads are written to `apps/web/public/uploads/`, which is gitignored.
  Use Cloudinary (`NEXT_PUBLIC_LOCAL_FILE_UPLOAD=false`) on hosts without a
  persistent disk.

---

## 7. Database, migrations & seeding

### Migrations

TypeORM entities are auto-discovered from `**/*.entity.ts`; the dev DataSource
has `synchronize: false` and `migrationsRun: true`.

```bash
# Apply pending migrations manually
pnpm --filter @mcom/api migration:run

# Generate a migration from entity changes
pnpm --filter @mcom/api migration:generate src/database/migrations/AddSomething

# Revert the last migration
pnpm --filter @mcom/api migration:revert
```

Production:

```bash
pnpm --filter @mcom/api migration:run:prod   # reads .env.prod, SSL enabled
```

Guidelines:

- Never edit an already-applied migration; add a new one.
- Keep migrations runnable on a fresh database (CI/e2e depend on this).
- Because migrations auto-run on API boot, a broken migration blocks startup.

#### Baseline and existing databases

The original schema was created outside TypeORM (synchronize / an earlier
codebase), so migrations from `1764182062301` onward assumed tables such as
`categories`, `participants`, `businesses`, `payment_history` already existed.
`1764182062300-BaselineSchema.ts` supplies that starting point, and
`1770000000022-SyncSchemaDrift.ts` reconciles the index/constraint naming drift
that pre-existing databases accumulated from synchronize runs.

**Databases created before these files were added already contain the schema**,
so the baseline must be recorded as applied instead of executed. Run this once
per existing environment (dev/staging/prod) before the next deploy:

```sql
INSERT INTO migrations (timestamp, name)
VALUES (1764182062300, 'BaselineSchema1764182062300');
```

Then apply the remaining migrations normally (`migration:run` or
`migration:run:prod`). Databases created after this change need no manual step.

Verify that a clean database can still be built from scratch:

```bash
pnpm verify:migrations
```

This creates a throwaway database, runs every migration, asserts that
`schema:log` is empty, and drops the database.

### Seeders

| Command | Behavior |
| --- | --- |
| `pnpm --filter @mcom/api seed` | **Destructive** — truncates tables, then creates the admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD`), taxonomy, demo businesses, participants, campaigns, rewards, tiers, etc. |
| `pnpm --filter @mcom/api seed:taxonomy` | Seeds sectors/categories/subcategories only. |
| `pnpm --filter @mcom/api seed:prod` | Seeds production reference data; reads `.env.prod`. |
| `pnpm --filter @mcom/api seed:plans-prod` | Seeds production plan data; reads `.env.prod`. |

> Run `seed` only against a local/demo database. It calls `clearDatabase()`
> before inserting.

---

## 8. Authentication & authorization

### Local JWT flow

1. `POST /api/v1/auth/login` (LocalStrategy) returns `user`, `accessToken`, and
   `refreshToken`.
2. The frontend stores tokens in **namespaced cookies**:
   `mcom_rewards_access` and `mcom_rewards_refresh` (7-day cookies, see
   `src/lib/auth-cookies.ts`). Namespacing avoids collisions with the MCOM mall
   app on `localhost`.
3. `services/api.ts` attaches `Authorization: Bearer <access token>` to every
   request and performs **single-flight refresh** against
   `POST /api/v1/auth/refresh-token` on `401`.
4. `AuthBootstrap` silently refreshes an expired access token on app load.
5. `src/proxy.ts` redirects `/dashboard/*` to `/login` when neither cookie exists
   (Next 16 uses `proxy.ts` instead of `middleware.ts`).

Access tokens expire in **1 hour** (`src/config/jwt.config.ts`); the refresh
token keeps the session alive across browser restarts.

### Global guards (applied in `app.module.ts`)

| Guard | Purpose |
| --- | --- |
| `JwtAuthGuard` | Protects every route by default; opt out with `@Public()`. |
| `ImpersonationGuard` | Handles admin `x-business-id` / `x-participant-id` impersonation. |
| `RolesGuard` | Enforces `@Roles(...)`; roles are `Admin`, `Business`, `Staff`, `Participant`, `Partner`, `Network`. |
| `MembershipGuard` | Enforces plan/subscription entitlements. |
| `TenantOwnershipGuard` | Prevents cross-tenant access. |
| `ThrottlerGuard` | Global rate limit: 100 requests / 60s (per `ThrottlerModule`). |

### SSO with MCOM Central (optional)

- `GET /api/v1/sso/authorize-url` builds the OAuth authorize URL.
- Frontend helpers live in `src/lib/sso-utils.ts`; callbacks are
  `/auth/callback` and `/sso/callback` (they validate the OAuth `state` cookie).
- M2M/service-mesh calls use short-lived **RS256 service tokens** minted by MCOM
  Central and verified offline via JWKS. See
  `apps/api/docs/partner-rewards-m2m.md` and
  `apps/api/src/resources/service-mesh/`.
- If you do not run MCOM Central, use local email/password login and leave the
  `MCOM_*` values empty or pointed at unreachable URLs; those features will be
  unavailable but the core app still runs.

---

## 9. API conventions

- **Base prefix:** `/api/v1` (`app.setGlobalPrefix("api/v1")`).
- **Swagger:** `/api-docs` (persisted auth enabled).
- **Health/root:** `GET /api/v1` is public.
- **Validation:** global `ValidationPipe` with `whitelist` and
  `forbidNonWhitelisted` — unknown fields return `400`.
- **Errors:** normalized by `GlobalExceptionFilter`.
- **Casing:** `CamelCaseInterceptor` converts response keys to camelCase.
- **CORS:** enabled with `origin: true` and credentials (dev-friendly; tighten in
  production).
- **Logging:** `LoggingMiddleware` + Nest logger; mail uses Nodemailer.

### Feature modules (grouped)

| Area | Modules (most under `src/resources/`; `auth`/`user` live in `src/`) |
| --- | --- |
| Accounts & access | `auth`, `user`, `admin`, `business`, `staff`, `participant`, `partner`, `network`, `sso`, `provision`, `service-mesh` |
| Loyalty core | `campaign`, `rewards`, `participant-campaign-balance`, `participant-progression`, `tier`, `tier-progression`, `stamp`, `matching-point`, `season`, `referral`, `wishlist`, `coupon` |
| Catalog & content | `category`, `subcategory`, `sector`, `deal`, `library-assets`, `training-support`, `notification` |
| Commerce & money | `payment`, `payment-history`, `point-package`, `mcom-packages`, `plans`, `system-plans`, `wallet`, `credits`, `financials`, `plaque-sales`, `plaque-user`, `qr-plaques` |
| Business tooling | `analytics`, `business-assets`, `loyalty-setup`, `setup`, `security`, `system-setting`, `group-circle`, `help-requests`, `mall-integration`, `partner-rewards` |

---

## 10. Frontend overview

### Routes (`src/app`)

| Route | Audience |
| --- | --- |
| `(others)/*` | Public marketing site: home, pricing, deals, campaigns, brands, memberships, checkout, legal, etc. |
| `/login`, `/signup`, `/verify-email`, `/onboarding` | Auth entry points and role selection |
| `/auth/callback`, `/auth/sso`, `/sso/callback`, `/sso-login` | SSO callbacks |
| `/dashboard/*` | Business dashboard: campaigns, customers, deals, staff, wallet, subscription, media, assets, analytics, support |
| `/admin/*` | Platform admin: users, businesses, campaigns, plans, sectors, financials, plaques, security, settings |
| `/participant/*` | Participant/customer portal: wallet, campaigns, stamps, rewards, progression, wishlist, settings |
| `/plaque-user/*` | QR-plaque owner mini dashboard |
| `/staff/*` | Staff redemption dashboard |
| `/loyalty-setup/*` | Guided loyalty configuration screens |
| `/api/upload`, `/api/sign-cloudinary-params` | Next route handlers for file uploads / signed Cloudinary uploads |

### Services layer

- `src/services/api.ts` — shared Axios instance, token injection, refresh queue,
  impersonation headers.
- `src/services/<domain>/` — per-domain API functions and React Query hooks.
  Add new endpoints here rather than calling Axios directly from components.

### UI

- App Router + React Server/Client Components (`"use client"` where needed).
- Tailwind CSS v4 with `tailwind.config.ts` and `postcss.config.mjs`.
- shadcn/ui + Radix primitives in `src/components/ui`; feature components live
  beside their domain.
- Icons via `lucide-react`/`react-icons`; forms via `react-hook-form` + `zod`;
  data via TanStack Query; charts via `recharts`.

---

## 11. Testing, linting & formatting

```bash
# API unit tests (Jest, src/**/*.spec.ts)
pnpm --filter @mcom/api test

# API e2e (requires apps/api/.env.test + a dedicated test database)
pnpm --filter @mcom/api test:e2e

# API coverage
pnpm --filter @mcom/api test:cov

# Frontend e2e (Playwright, starts Next on 3005)
pnpm --filter @mcom/web exec playwright install   # first time only
pnpm --filter @mcom/web test:e2e

# Lint / format
pnpm lint
pnpm format
```

> ⚠️ API e2e helpers **TRUNCATE every table** (`test/test-utils.ts`). Point
> `.env.test` at a throwaway database — never at your dev/demo data.
>
> Playwright specs assume the frontend on `:3005` and, for SSO scenarios, MCOM
> Central on `:3000`. `playwright.config.ts` reuses an already-running dev server.

---

## 12. Documentation index

- **This README** — setup, structure, env, architecture.
- `apps/api/GEMINI.md` — backend conventions and AI-agent rules (strict typing,
  no `any`, no migrations/tests/commits without explicit instruction).
- `apps/api/docs/` — feature and endpoint docs:
  - `endpoints/` — admin, participant, staff, category, wishlist endpoints
  - `workflows/` — participant join-campaign flow
  - `partner-rewards-m2m.md` — FundOrDonate partner API + zero-hop service mesh
  - `wishlist_api.md`, `network_endpoints.md`, `matching_point_api.md`,
    `progression_resource.md`, `tier_progression_endpoint.md`,
    `SYSTEM-PLANS-API.md`, `mcom_solution_admin_plans_api.md`
  - `admin_guides/`, `dev_docs/`
- Additional design/spec Markdown files sit next to the apps (`apps/api/*.md`,
  `apps/web/*.md`). They are feature design notes, not setup instructions.

---

## 13. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ECONNREFUSED` / `database "mcom_rewards" does not exist` | Start PostgreSQL, create the database, verify `POSTGRES_*` in `apps/api/.env`. |
| API exits at boot with a migration error | Fix the failing migration or restore a clean DB. Migrations auto-run on startup. |
| `relation ... does not exist` | Run `pnpm --filter @mcom/api migration:run` (or restart the API). |
| `bcrypt`/`sharp` native build errors | `pnpm rebuild bcrypt sharp`; ensure build scripts are allowed (`pnpm-workspace.yaml` → `allowBuilds`). |
| Port already in use | Web is fixed to `3005`; change `apps/web/package.json` dev script or free the port. API port comes from `PORT`. |
| Login succeeds but every request is 401 | Check `JWT_SECRET` is set and stable; clear `mcom_rewards_*` cookies; make sure `NEXT_PUBLIC_API_BASE_URL` includes `/api/v1`. |
| Endless redirect to `/login` | If using SSO, complete the central flow or set `NEXT_PUBLIC_BYPASS_SSO=true` for frontend-only work (API auth still required). |
| Signup/login jumps to `localhost:3000` | Expected when MCOM Central is not running; those pages delegate to the central app. |
| Env change has no effect in frontend | `NEXT_PUBLIC_*` is baked at build/dev start — restart `next dev` or rebuild. |
| Uploaded files disappear / 404 | Local uploads go to `public/uploads` and only work with `NEXT_PUBLIC_LOCAL_FILE_UPLOAD=true`; use Cloudinary in production. |
| CORS errors | API allows all origins in dev. Ensure you call the API host (`:4000`), not the Next host. |
| Cookie clash with another MCOM app | Rewards uses `mcom_rewards_access`/`mcom_rewards_refresh`; do not rename them to generic `access`/`refresh`. |
| `pnpm dev` starts only one app | Each workspace must define `dev`; check the output of `pnpm --filter <pkg> dev` individually. |

---

## 14. Production / deployment notes

- **API:** `pnpm --filter @mcom/api build` → `node dist/main`. `apps/api/vercel.json`
  routes all methods to `src/main.ts` for Vercel. Set all env vars in the host,
  use a pooled Postgres connection if serverless, and run migrations explicitly
  (`migration:run:prod`) — the prod DataSource does not auto-run them.
- **Web:** `pnpm --filter @mcom/web build` (4 GB heap via `cross-env`). Deploy the
  `.next` output to Vercel/Node. `NEXT_PUBLIC_*` values must be present at build
  time. Keep `NEXT_PUBLIC_LOCAL_FILE_UPLOAD` false/unset and configure Cloudinary.
- **Security:** change `JWT_SECRET`, `SSO_SECRET`, `MCOM_HMAC_SECRET`, and
  `MCOM_API_KEY` from placeholders; restrict CORS (`app.enableCors`) and rotate
  OAuth/client secrets per environment.

---

## 15. Conventions for contributors

- TypeScript everywhere; the API forbids `any` (see `apps/api/GEMINI.md`).
- Backend: one feature = one module folder under `src/resources/`; DTOs validate
  input; new schema changes require a migration.
- Frontend: add data access in `src/services/<domain>/`; keep shared auth logic in
  `src/lib/auth-cookies.ts`; use the `@/` alias.
- Do not commit `.env`, `.env.local`, `.env.prod`, build output, or uploads.
- Run `pnpm lint` (and relevant tests) before opening a PR.
