import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreditsSystem1770000000005 implements MigrationInterface {
  name = "AddCreditsSystem1770000000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "credit_levels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "level" integer NOT NULL, "credits_needed" integer NOT NULL, "matching_contribution" double precision NOT NULL, "total_cashback" double precision NOT NULL, CONSTRAINT "PK_credit_levels" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_credit_levels_level" ON "credit_levels" ("level") `,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."credit_rules_platform_enum" AS ENUM('MCOM_LOYALTY', 'MCOM_MALL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."credit_rules_reward_type_enum" AS ENUM('PERCENTAGE', 'FIXED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "credit_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "platform" "public"."credit_rules_platform_enum" NOT NULL, "event_type" character varying NOT NULL, "reward_type" "public"."credit_rules_reward_type_enum" NOT NULL, "reward_value" double precision NOT NULL, "level" integer, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_credit_rules" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_credit_rules_event_type" ON "credit_rules" ("event_type") `,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."credit_transactions_user_type_enum" AS ENUM('PARTICIPANT', 'BUSINESS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."credit_transactions_type_enum" AS ENUM('CREDIT', 'DEBIT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."credit_transactions_unit_enum" AS ENUM('CREDITS', 'GBP')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."credit_transactions_source_platform_enum" AS ENUM('MCOM_LOYALTY', 'MCOM_MALL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "credit_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" character varying NOT NULL, "user_type" "public"."credit_transactions_user_type_enum" NOT NULL, "amount" double precision NOT NULL, "type" "public"."credit_transactions_type_enum" NOT NULL, "unit" "public"."credit_transactions_unit_enum" NOT NULL, "source_platform" "public"."credit_transactions_source_platform_enum", "event_type" character varying, "description" character varying, "status" character varying, CONSTRAINT "PK_credit_transactions" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_credit_transactions_user" ON "credit_transactions" ("user_id", "created_at") `,
    );

    // Seed default credit levels
    await queryRunner.query(
      `INSERT INTO "credit_levels" ("level", "credits_needed", "matching_contribution", "total_cashback") VALUES (1, 25, 25, 50), (2, 50, 50, 120), (3, 100, 100, 300), (4, 200, 200, 650), (5, 400, 400, 1400)`,
    );

    // Seed default credit earning rules
    await queryRunner.query(
      `INSERT INTO "credit_rules" ("platform", "event_type", "reward_type", "reward_value", "is_active") VALUES ('MCOM_LOYALTY', 'CAMPAIGN_JOIN', 'FIXED', 5, true), ('MCOM_LOYALTY', 'DEAL_PURCHASE', 'FIXED', 10, true), ('MCOM_LOYALTY', 'REVIEW_SUBMITTED', 'FIXED', 2, true)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_credit_transactions_user"`);
    await queryRunner.query(`DROP TABLE "credit_transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."credit_transactions_source_platform_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."credit_transactions_unit_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."credit_transactions_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."credit_transactions_user_type_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_credit_rules_event_type"`);
    await queryRunner.query(`DROP TABLE "credit_rules"`);
    await queryRunner.query(
      `DROP TYPE "public"."credit_rules_reward_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."credit_rules_platform_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_credit_levels_level"`);
    await queryRunner.query(`DROP TABLE "credit_levels"`);
  }
}