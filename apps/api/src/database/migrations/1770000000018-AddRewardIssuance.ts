import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRewardIssuance1770000000018 implements MigrationInterface {
  name = "AddRewardIssuance1770000000018";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_issuance_status_enum') THEN
          CREATE TYPE "public"."reward_issuance_status_enum" AS ENUM('ISSUED', 'REDEEMED', 'EXPIRED', 'REVOKED', 'FAILED');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reward_issuance" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "reward_id" uuid,
        "business_reward_id" character varying,
        "issuer_client_id" character varying NOT NULL,
        "external_ref" character varying,
        "idempotency_key" character varying NOT NULL,
        "recipient_email" character varying NOT NULL,
        "recipient_mcom_user_id" character varying,
        "recipient_user_id" character varying,
        "recipient_user_type" character varying,
        "recipient_name" character varying,
        "recipient_resolved" boolean NOT NULL DEFAULT false,
        "code" character varying,
        "status" "public"."reward_issuance_status_enum" NOT NULL DEFAULT 'ISSUED',
        "reward_type" character varying,
        "value" numeric(12,2) NOT NULL DEFAULT 0,
        "points_awarded" integer,
        "mall_reference" character varying,
        "quantity" integer NOT NULL DEFAULT 1,
        "expires_at" TIMESTAMP,
        "redeemed_at" TIMESTAMP,
        "revoked_at" TIMESTAMP,
        "metadata" jsonb,
        CONSTRAINT "PK_reward_issuance" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reward_issuance_reward" FOREIGN KEY ("reward_id")
          REFERENCES "reward"("id") ON DELETE SET NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_reward_issuance_idempotency"
        ON "reward_issuance" ("issuer_client_id", "idempotency_key");
      CREATE INDEX IF NOT EXISTS "IDX_reward_issuance_external_ref"
        ON "reward_issuance" ("issuer_client_id", "external_ref");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reward_issuance"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."reward_issuance_status_enum"`,
    );
  }
}
