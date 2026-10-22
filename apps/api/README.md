# @mcom/api — MCOM Rewards backend

NestJS 11 + TypeORM + PostgreSQL API for the MCOM Rewards platform. All routes
are served under **`/api/v1`**; Swagger is at **`/api-docs`**.

For monorepo setup, shared prerequisites, SSO/M2M details, and the full env
reference, see the [root README](../../README.md).

## Quick start

```bash
# From the repository root
pnpm install
cp apps/api/.env.example apps/api/.env   # add the remaining keys (root README §5)
createdb mcom_rewards

pnpm --filter @mcom/api dev              # nest start --watch, http://localhost:4000
```

The API auto-runs pending migrations on startup (`migrationsRun: true`). Ensure
`POSTGRES_*` and `JWT_SECRET` are set before starting.

## Useful scripts

| Command | Purpose |
| --- | --- |
| `pnpm --filter @mcom/api dev` | Watch mode (`nest start --watch`) |
| `pnpm --filter @mcom/api build` | Compile to `dist/` |
| `pnpm --filter @mcom/api start:prod` | Run `node dist/main` |
| `pnpm --filter @mcom/api lint` | ESLint with `--fix` |
| `pnpm --filter @mcom/api format` | Prettier write |
| `pnpm --filter @mcom/api test` | Jest unit tests |
| `pnpm --filter @mcom/api test:e2e` | Jest e2e (needs `.env.test`) |
| `pnpm --filter @mcom/api test:cov` | Coverage |
| `pnpm --filter @mcom/api migration:run` | Apply migrations |
| `pnpm --filter @mcom/api migration:generate src/database/migrations/Name` | Generate migration |
| `pnpm --filter @mcom/api migration:revert` | Revert last migration |
| `pnpm --filter @mcom/api migration:run:prod` | Apply using `.env.prod` |
| `pnpm --filter @mcom/api seed` | ⚠️ Destructive demo seed |
| `pnpm --filter @mcom/api seed:taxonomy` | Taxonomy only |
| `pnpm --filter @mcom/api seed:prod` / `seed:plans-prod` | Production reference data |

## Layout

- `src/main.ts` — bootstrap (CORS, global prefix, validation, Swagger).
- `src/app.module.ts` — root module and global guards.
- `src/resources/*` — feature modules (controllers, services, entities, DTOs).
- `src/auth/` — JWT/local/partner auth, refresh tokens.
- `src/common/` — guards, decorators, filters, enums, utils.
- `src/database/` — data sources, entities, ~100 migrations.
- `src/seeder/`, `src/seed*.ts` — seeding entrypoints.
- `test/` — Jest e2e specs; helpers TRUNCATE all tables.
- `docs/` — endpoint, workflow, and partner-integration documentation.

## Auth notes

`JwtAuthGuard` is global; use `@Public()` for open routes. Roles are `Admin`,
`Business`, `Staff`, `Participant`, `Partner`, `Network`. Access tokens live for
1 hour and are refreshed with `POST /auth/refresh-token`. M2M partners use
RS256 service tokens from MCOM Central (see `docs/partner-rewards-m2m.md`).

## Conventions

- Validate all input with DTOs (`class-validator`); unknown fields are rejected.
- New schema changes require a migration — `synchronize` is disabled.
- Responses are camelCased by the global interceptor.
- No `any` types (see `GEMINI.md`).
