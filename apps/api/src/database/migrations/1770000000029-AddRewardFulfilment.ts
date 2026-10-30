import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Ecosystem reward fulfilment.
 *
 * Additive only: every new column is nullable/defaulted so old application
 * versions keep working during a rolling deploy. Existing Mall columns and
 * the reward issuance state machine are untouched.
 */
export class AddRewardFulfilment1770000000029 implements MigrationInterface {
  name = "AddRewardFulfilment1770000000029";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Reward catalogue attachment
    await queryRunner.query(`
      ALTER TABLE "reward"
        ADD COLUMN IF NOT EXISTS "fulfilment_provider" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_kind" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_config" jsonb,
        ADD COLUMN IF NOT EXISTS "fulfilment_template_id" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_business_ref" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_funding_source" character varying;
    `);

    // Business reward attachment
    await queryRunner.query(`
      ALTER TABLE "business_reward"
        ADD COLUMN IF NOT EXISTS "fulfilment_provider" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_kind" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_config" jsonb,
        ADD COLUMN IF NOT EXISTS "fulfilment_template_id" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_business_ref" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_funding_source" character varying;
    `);

    // Issuance fulfilment state
    await queryRunner.query(`
      ALTER TABLE "reward_issuance"
        ADD COLUMN IF NOT EXISTS "fulfilment_provider" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_kind" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_status" character varying NOT NULL DEFAULT 'NOT_REQUIRED',
        ADD COLUMN IF NOT EXISTS "fulfilment_ref" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_code" character varying,
        ADD COLUMN IF NOT EXISTS "fulfilment_payload" jsonb,
        ADD COLUMN IF NOT EXISTS "fulfilment_error" text,
        ADD COLUMN IF NOT EXISTS "fulfilment_attempts" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "fulfilled_at" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "central_reference" character varying;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reward_issuance_fulfilment_status"
        ON "reward_issuance" ("fulfilment_status");
      CREATE INDEX IF NOT EXISTS "IDX_reward_issuance_fulfilment_ref"
        ON "reward_issuance" ("fulfilment_ref");
    `);

    // Retry queue
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reward_fulfilment_outbox" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "issuance_id" character varying NOT NULL,
        "operation" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "attempts" integer NOT NULL DEFAULT 0,
        "max_attempts" integer NOT NULL DEFAULT 8,
        "next_attempt_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_error" text,
        "payload" jsonb,
        CONSTRAINT "PK_reward_fulfilment_outbox" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_reward_fulfilment_outbox_issuance_operation"
        ON "reward_fulfilment_outbox" ("issuance_id", "operation");
      CREATE INDEX IF NOT EXISTS "IDX_reward_fulfilment_outbox_status_next"
        ON "reward_fulfilment_outbox" ("status", "next_attempt_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reward_fulfilment_outbox"`);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_reward_issuance_fulfilment_ref";
      DROP INDEX IF EXISTS "IDX_reward_issuance_fulfilment_status";
    `);
    await queryRunner.query(`
      ALTER TABLE "reward_issuance"
        DROP COLUMN IF EXISTS "central_reference",
        DROP COLUMN IF EXISTS "fulfilled_at",
        DROP COLUMN IF EXISTS "fulfilment_attempts",
        DROP COLUMN IF EXISTS "fulfilment_error",
        DROP COLUMN IF EXISTS "fulfilment_payload",
        DROP COLUMN IF EXISTS "fulfilment_code",
        DROP COLUMN IF EXISTS "fulfilment_ref",
        DROP COLUMN IF EXISTS "fulfilment_status",
        DROP COLUMN IF EXISTS "fulfilment_kind",
        DROP COLUMN IF EXISTS "fulfilment_provider";
    `);
    await queryRunner.query(`
      ALTER TABLE "business_reward"
        DROP COLUMN IF EXISTS "fulfilment_funding_source",
        DROP COLUMN IF EXISTS "fulfilment_business_ref",
        DROP COLUMN IF EXISTS "fulfilment_template_id",
        DROP COLUMN IF EXISTS "fulfilment_config",
        DROP COLUMN IF EXISTS "fulfilment_kind",
        DROP COLUMN IF EXISTS "fulfilment_provider";
    `);
    await queryRunner.query(`
      ALTER TABLE "reward"
        DROP COLUMN IF EXISTS "fulfilment_funding_source",
        DROP COLUMN IF EXISTS "fulfilment_business_ref",
        DROP COLUMN IF EXISTS "fulfilment_template_id",
        DROP COLUMN IF EXISTS "fulfilment_config",
        DROP COLUMN IF EXISTS "fulfilment_kind",
        DROP COLUMN IF EXISTS "fulfilment_provider";
    `);
  }
}
