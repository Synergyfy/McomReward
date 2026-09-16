import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUnifiedPlansAndPayments1770000000010
  implements MigrationInterface
{
  name = "CreateUnifiedPlansAndPayments1770000000010";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create plan_tier_levels
    await queryRunner.query(
      `CREATE TYPE "public"."plan_tier_levels_name_enum" AS ENUM('STANDARD', 'PRO', 'PRO_PLUS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_tier_levels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" "public"."plan_tier_levels_name_enum" NOT NULL,
        "sortOrder" integer NOT NULL DEFAULT 1,
        "durationDays" integer,
        "isCalendarYear" boolean NOT NULL DEFAULT false,
        CONSTRAINT "UQ_plan_tier_levels_name" UNIQUE ("name"),
        CONSTRAINT "PK_plan_tier_levels" PRIMARY KEY ("id")
      )`,
    );

    // 2. Create plans
    await queryRunner.query(
      `CREATE TABLE "plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_plans_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_plans" PRIMARY KEY ("id")
      )`,
    );

    // 3. Create plan_variants
    await queryRunner.query(
      `CREATE TABLE "plan_variants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "plan_id" uuid NOT NULL,
        "tier_level_id" uuid NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "features" jsonb NOT NULL DEFAULT '[]',
        "configuration" jsonb NOT NULL DEFAULT '{}',
        CONSTRAINT "PK_plan_variants" PRIMARY KEY ("id"),
        CONSTRAINT "FK_plan_variants_plan" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_plan_variants_tier_level" FOREIGN KEY ("tier_level_id") REFERENCES "plan_tier_levels"("id") ON DELETE CASCADE
      )`,
    );

    // 4. Create plan_prices
    await queryRunner.query(
      `CREATE TABLE "plan_prices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "plan_variant_id" uuid NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'GBP',
        "amount" numeric(10,2) NOT NULL,
        "stripePriceId" character varying,
        "paypalPlanId" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "effectiveFrom" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "effectiveTo" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_plan_prices" PRIMARY KEY ("id"),
        CONSTRAINT "FK_plan_prices_variant" FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id") ON DELETE CASCADE
      )`,
    );

    // 5. Create membership_payments
    await queryRunner.query(
      `CREATE TYPE "public"."membership_payments_paymentmethod_enum" AS ENUM('mcom_wallet', 'stripe', 'paypal')`,
    );
    await queryRunner.query(
      `CREATE TABLE "membership_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "business_id" uuid,
        "amount" numeric(10,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'GBP',
        "paymentMethod" "public"."membership_payments_paymentmethod_enum" NOT NULL,
        "transactionId" character varying NOT NULL,
        "metadata" jsonb,
        CONSTRAINT "UQ_membership_payments_transactionId" UNIQUE ("transactionId"),
        CONSTRAINT "PK_membership_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_membership_payments_business" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE
      )`,
    );

    // 6. Add plan variant, price snapshot, payment, and active columns to membership
    await queryRunner.query(
      `ALTER TABLE "membership" ADD COLUMN IF NOT EXISTS "plan_variant_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD COLUMN IF NOT EXISTS "price_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD COLUMN IF NOT EXISTS "payment_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_membership_plan_variant" FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_membership_price" FOREIGN KEY ("price_id") REFERENCES "plan_prices"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_membership_payment" FOREIGN KEY ("payment_id") REFERENCES "membership_payments"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "FK_membership_payment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "FK_membership_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "FK_membership_plan_variant"`,
    );
    await queryRunner.query(`ALTER TABLE "membership" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "membership" DROP COLUMN "payment_id"`);
    await queryRunner.query(`ALTER TABLE "membership" DROP COLUMN "price_id"`);
    await queryRunner.query(
      `ALTER TABLE "membership" DROP COLUMN "plan_variant_id"`,
    );

    await queryRunner.query(`DROP TABLE "membership_payments"`);
    await queryRunner.query(
      `DROP TYPE "public"."membership_payments_paymentmethod_enum"`,
    );

    await queryRunner.query(`DROP TABLE "plan_prices"`);
    await queryRunner.query(`DROP TABLE "plan_variants"`);
    await queryRunner.query(`DROP TABLE "plans"`);
    await queryRunner.query(`DROP TABLE "plan_tier_levels"`);
    await queryRunner.query(
      `DROP TYPE "public"."plan_tier_levels_name_enum"`,
    );
  }
}
