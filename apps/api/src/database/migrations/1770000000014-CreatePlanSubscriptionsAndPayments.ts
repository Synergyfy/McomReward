import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlanSubscriptionsAndPayments1770000000014
  implements MigrationInterface
{
  name = "CreatePlanSubscriptionsAndPayments1770000000014";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create plan_payments enum and table
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_payments_paymentmethod_enum') THEN
          CREATE TYPE "public"."plan_payments_paymentmethod_enum" AS ENUM('mcom_wallet', 'stripe', 'paypal');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plan_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "business_id" uuid,
        "amount" numeric(10,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'GBP',
        "paymentMethod" "public"."plan_payments_paymentmethod_enum" NOT NULL,
        "transactionId" character varying NOT NULL,
        "metadata" jsonb,
        CONSTRAINT "UQ_plan_payments_transactionId" UNIQUE ("transactionId"),
        CONSTRAINT "PK_plan_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_plan_payments_business" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE
      )
    `);

    // 2. Create plan_subscriptions enums and table
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_subscriptions_status_enum') THEN
          CREATE TYPE "public"."plan_subscriptions_status_enum" AS ENUM('active', 'inactive', 'expired');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_subscriptions_plan_type_enum') THEN
          CREATE TYPE "public"."plan_subscriptions_plan_type_enum" AS ENUM('monthly', 'annual', 'quarterly', 'seasonal');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plan_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "business_id" uuid,
        "plan_variant_id" uuid,
        "price_id" uuid,
        "status" "public"."plan_subscriptions_status_enum" NOT NULL DEFAULT 'inactive',
        "isActive" boolean NOT NULL DEFAULT false,
        "starts_at" TIMESTAMP WITH TIME ZONE,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "is_trial" boolean NOT NULL DEFAULT false,
        "trial_days" integer,
        "plan_type" "public"."plan_subscriptions_plan_type_enum" NOT NULL DEFAULT 'monthly',
        "transaction_id" character varying,
        "payment_provider" character varying,
        "payment_id" uuid,
        CONSTRAINT "PK_plan_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_plan_subscriptions_business" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_plan_subscriptions_plan_variant" FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_plan_subscriptions_price" FOREIGN KEY ("price_id") REFERENCES "plan_prices"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_plan_subscriptions_payment" FOREIGN KEY ("payment_id") REFERENCES "plan_payments"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "plan_subscriptions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "plan_payments" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."plan_subscriptions_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."plan_subscriptions_plan_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."plan_payments_paymentmethod_enum"`);
  }
}
