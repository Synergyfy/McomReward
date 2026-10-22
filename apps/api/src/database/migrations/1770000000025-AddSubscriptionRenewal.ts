import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Partner-owned recurring billing. MCOM does not store a mandate for partner
 * subscriptions, so we schedule renewals ourselves: wallet debits for
 * auto-renew, or a fresh MCOM Pay charge per period for card/PayPal.
 *
 * See MCOM Payments Partner Integration Guide, Part C.
 */
export class AddSubscriptionRenewal1770000000025 implements MigrationInterface {
  name = "AddSubscriptionRenewal1770000000025";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_subscriptions_status_enum') THEN
          ALTER TYPE "public"."plan_subscriptions_status_enum"
            ADD VALUE IF NOT EXISTS 'past_due';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_billing_method_enum') THEN
          CREATE TYPE "public"."subscription_billing_method_enum" AS ENUM(
            'wallet', 'stripe', 'paypal'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_invoices_status_enum') THEN
          CREATE TYPE "public"."subscription_invoices_status_enum" AS ENUM(
            'pending', 'paid', 'failed', 'canceled', 'refunded'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "plan_subscriptions"
        ADD COLUMN IF NOT EXISTS "auto_renew" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "billing_method" "public"."subscription_billing_method_enum",
        ADD COLUMN IF NOT EXISTS "billing_anchor" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "next_billing_at" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "grace_until" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "renewal_attempts" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "canceled_at" TIMESTAMP WITH TIME ZONE;
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_plan_subscriptions_next_billing_at" ON "plan_subscriptions" ("next_billing_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_invoices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "subscription_id" uuid NOT NULL,
        "period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
        "period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
        "amount_minor" character varying NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'GBP',
        "billing_method" "public"."subscription_billing_method_enum" NOT NULL,
        "charge_id" character varying,
        "status" "public"."subscription_invoices_status_enum" NOT NULL DEFAULT 'pending',
        "attempts" integer NOT NULL DEFAULT 0,
        "paid_at" TIMESTAMP WITH TIME ZONE,
        "failure_reason" text,
        "metadata" jsonb,
        CONSTRAINT "PK_subscription_invoices" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subscription_invoices_period" UNIQUE ("subscription_id", "period_start"),
        CONSTRAINT "FK_subscription_invoices_subscription"
          FOREIGN KEY ("subscription_id") REFERENCES "plan_subscriptions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_subscription_id" ON "subscription_invoices" ("subscription_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_charge_id" ON "subscription_invoices" ("charge_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_status" ON "subscription_invoices" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_invoices"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."subscription_invoices_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."subscription_billing_method_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_subscriptions"
        DROP COLUMN IF EXISTS "canceled_at",
        DROP COLUMN IF EXISTS "renewal_attempts",
        DROP COLUMN IF EXISTS "grace_until",
        DROP COLUMN IF EXISTS "next_billing_at",
        DROP COLUMN IF EXISTS "billing_anchor",
        DROP COLUMN IF EXISTS "billing_method",
        DROP COLUMN IF EXISTS "auto_renew"`,
    );
    // Postgres cannot remove an enum value safely.
  }
}
