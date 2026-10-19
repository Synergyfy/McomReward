import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds the RESERVED lifecycle state and reservation bookkeeping used by the
 * MCOM Mall checkout flow (reserve → commit/release).
 *
 * See the MCOM Rewards ⇄ MCOM Mall integration handbook v3 §8, §10.1, §10.2.
 */
export class AddIssuanceReservation1770000000020 implements MigrationInterface {
  name = "AddIssuanceReservation1770000000020";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_issuance_status_enum') THEN
          ALTER TYPE "public"."reward_issuance_status_enum" ADD VALUE IF NOT EXISTS 'RESERVED';
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "reward_issuance" ADD COLUMN IF NOT EXISTS "reservation_ref" character varying;
      ALTER TABLE "reward_issuance" ADD COLUMN IF NOT EXISTS "reserved_at" timestamp;
      ALTER TABLE "reward_issuance" ADD COLUMN IF NOT EXISTS "committed_at" timestamp;
      -- NB: do NOT reference the freshly-added 'RESERVED' literal here — Postgres
      -- forbids using a new enum value in the same transaction. The sweeper
      -- filters on (status, reserved_at), which this composite index serves.
      CREATE INDEX IF NOT EXISTS "IDX_reward_issuance_status_reserved"
        ON "reward_issuance" ("status", "reserved_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_reward_issuance_status_reserved"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_issuance" DROP COLUMN IF EXISTS "committed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_issuance" DROP COLUMN IF EXISTS "reserved_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_issuance" DROP COLUMN IF EXISTS "reservation_ref"`,
    );
    // Postgres cannot remove a value from an enum type.
  }
}
