#!/usr/bin/env bash
#
# Builds a throwaway database from scratch using the TypeORM migration chain,
# then asserts that the resulting schema matches the entities (schema:log must
# be empty). This is the regression guard for the migration baseline.
#
# Usage: pnpm verify:migrations
# Requires: psql/createdb/dropdb on PATH and apps/api/.env with POSTGRES_* set.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f apps/api/.env ]]; then
  echo "error: apps/api/.env not found (copy apps/api/.env.example first)" >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a
. apps/api/.env
set +a

DB_NAME="${VERIFY_DB_NAME:-mcom_migrations_verify}"
PG_HOST="${POSTGRES_HOST:-localhost}"
PG_PORT="${POSTGRES_PORT:-5432}"
PG_USER="${POSTGRES_USERNAME:-user}"
export PGPASSWORD="${POSTGRES_PASSWORD:-}"

psql_base=(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -v ON_ERROR_STOP=1)

cleanup() {
  dropdb --if-exists -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$DB_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

if "${psql_base[@]}" -d postgres -Atc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  echo "Dropping leftover database $DB_NAME"
  dropdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$DB_NAME"
fi

echo "Creating $DB_NAME"
createdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$DB_NAME"

cd apps/api

echo "Running migrations"
POSTGRES_NAME="$DB_NAME" pnpm exec ts-node --project ./tsconfig.json -T \
  -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run \
  -d src/database/data-source.ts

echo "Checking schema drift"
OUTPUT="$(POSTGRES_NAME="$DB_NAME" pnpm exec ts-node --project ./tsconfig.json -T \
  -r tsconfig-paths/register ./node_modules/typeorm/cli.js schema:log \
  -d src/database/data-source.ts 2>&1 | sed 's/\x1b\[[0-9;]*m//g')"

if ! grep -q "Your schema is up to date" <<<"$OUTPUT"; then
  echo "$OUTPUT" >&2
  echo >&2
  echo "error: migrations produced a schema that does not match the entities" >&2
  exit 1
fi

echo "OK: migrations build the expected schema from an empty database"
