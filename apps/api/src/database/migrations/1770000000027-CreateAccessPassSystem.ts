import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Access passes are standalone, single-tier products that can be bought or
 * redeemed with a code. Adds the catalogue, code inventory, per-business
 * grants and the durable email outbox used for code/revocation notices.
 */
export class CreateAccessPassSystem1770000000027
  implements MigrationInterface
{
  name = "CreateAccessPassSystem1770000000027";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_checkouts_purpose_enum') THEN
          ALTER TYPE "public"."payment_checkouts_purpose_enum"
            ADD VALUE IF NOT EXISTS 'ACCESS_PASS';
        END IF;
      END $$;
    `);

    await queryRunner.query(
      `CREATE TYPE "public"."access_pass_codes_status_enum" AS ENUM('active', 'exhausted', 'revoked', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."access_pass_subscriptions_source_enum" AS ENUM('purchase', 'code', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."access_pass_subscriptions_status_enum" AS ENUM('active', 'expired', 'revoked')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."access_pass_subscriptions_payment_provider_enum" AS ENUM('stripe', 'paypal', 'mcom_wallet')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."email_queue_status_enum" AS ENUM('pending', 'processing', 'sent', 'failed')`,
    );

    await queryRunner.query(`
      CREATE TABLE "access_pass_plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL DEFAULT 0,
        "currency" character varying NOT NULL DEFAULT 'GBP',
        "duration_days" integer NOT NULL,
        "features" jsonb NOT NULL DEFAULT '[]',
        "configuration" jsonb NOT NULL DEFAULT '{}',
        "is_active" boolean NOT NULL DEFAULT true,
        "purchase_enabled" boolean NOT NULL DEFAULT true,
        "code_redemption_enabled" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_access_pass_plans_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_access_pass_plans" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "access_pass_codes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "code" character varying NOT NULL,
        "plan_id" uuid NOT NULL,
        "assigned_email" character varying,
        "assigned_business_id" uuid,
        "restrict_to_assigned_user" boolean NOT NULL DEFAULT false,
        "status" "public"."access_pass_codes_status_enum" NOT NULL DEFAULT 'active',
        "max_uses" integer NOT NULL DEFAULT 1,
        "times_used" integer NOT NULL DEFAULT 0,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "note" text,
        "created_by_admin_id" uuid,
        "last_used_at" TIMESTAMP WITH TIME ZONE,
        "email_sent_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_access_pass_codes_code" UNIQUE ("code"),
        CONSTRAINT "PK_access_pass_codes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ddee18e2fd18561afea67d33f5d" FOREIGN KEY ("plan_id")
          REFERENCES "access_pass_plans"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_5dbe1fa477a869888e9774b1277" FOREIGN KEY ("assigned_business_id")
          REFERENCES "businesses"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "access_pass_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "business_id" uuid NOT NULL,
        "plan_id" uuid NOT NULL,
        "code_id" uuid,
        "source" "public"."access_pass_subscriptions_source_enum" NOT NULL,
        "status" "public"."access_pass_subscriptions_status_enum" NOT NULL DEFAULT 'active',
        "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "plan_name" character varying NOT NULL,
        "duration_days" integer NOT NULL,
        "features" jsonb NOT NULL DEFAULT '[]',
        "configuration" jsonb NOT NULL DEFAULT '{}',
        "price" numeric(10,2) NOT NULL DEFAULT 0,
        "currency" character varying NOT NULL DEFAULT 'GBP',
        "transaction_id" character varying,
        "payment_provider" "public"."access_pass_subscriptions_payment_provider_enum",
        "granted_by_admin_id" uuid,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        "revoked_reason" text,
        "revoked_by_admin_id" uuid,
        CONSTRAINT "PK_access_pass_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_043aed3a35c077bfddbf983f16f" FOREIGN KEY ("business_id")
          REFERENCES "businesses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_d109b91bdc9a7e5d4583eb5cba8" FOREIGN KEY ("plan_id")
          REFERENCES "access_pass_plans"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_7d93d22eed1d5af0615a461de7e" FOREIGN KEY ("code_id")
          REFERENCES "access_pass_codes"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "email_queue" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "to_email" character varying NOT NULL,
        "subject" character varying NOT NULL,
        "html" text,
        "text" text,
        "status" "public"."email_queue_status_enum" NOT NULL DEFAULT 'pending',
        "attempts" integer NOT NULL DEFAULT 0,
        "max_attempts" integer NOT NULL DEFAULT 5,
        "last_error" text,
        "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "processed_at" TIMESTAMP WITH TIME ZONE,
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "metadata" jsonb,
        CONSTRAINT "PK_email_queue" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_queue"`);
    await queryRunner.query(`DROP TABLE "access_pass_subscriptions"`);
    await queryRunner.query(`DROP TABLE "access_pass_codes"`);
    await queryRunner.query(`DROP TABLE "access_pass_plans"`);
    await queryRunner.query(
      `DROP TYPE "public"."email_queue_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."access_pass_subscriptions_payment_provider_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."access_pass_subscriptions_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."access_pass_subscriptions_source_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."access_pass_codes_status_enum"`,
    );
  }
}
