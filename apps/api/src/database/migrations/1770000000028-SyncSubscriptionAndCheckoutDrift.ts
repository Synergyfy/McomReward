import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Brings the recurring-billing and payment-checkout tables in line with the
 * entity metadata.
 *
 * Earlier migrations used hand-written constraint/index/enum names. TypeORM's
 * schema checker compares against its generated names, so a brand-new database
 * built from the migration chain previously finished one `schema:log` behind
 * the entities. This migration normalises the names and enum ownership without
 * losing data.
 */
export class SyncSubscriptionAndCheckoutDrift1770000000028 implements MigrationInterface {
  name = "SyncSubscriptionAndCheckoutDrift1770000000028";

  public async up(queryRunner: QueryRunner): Promise<void> {
    /* ---------------------------------------------------------------- */
    /* Billing method enum: one enum per owning table                    */
    /* ---------------------------------------------------------------- */

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type
          WHERE typname = 'plan_subscriptions_billing_method_enum'
        ) THEN
          CREATE TYPE "public"."plan_subscriptions_billing_method_enum"
            AS ENUM('wallet', 'stripe', 'paypal');
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_type
          WHERE typname = 'subscription_invoices_billing_method_enum'
        ) THEN
          CREATE TYPE "public"."subscription_invoices_billing_method_enum"
            AS ENUM('wallet', 'stripe', 'paypal');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      DECLARE
        current_type text;
      BEGIN
        SELECT udt_name INTO current_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'plan_subscriptions'
          AND column_name = 'billing_method';

        IF current_type IS DISTINCT FROM 'plan_subscriptions_billing_method_enum' THEN
          ALTER TABLE "plan_subscriptions"
            ALTER COLUMN "billing_method"
            TYPE "public"."plan_subscriptions_billing_method_enum"
            USING "billing_method"::text::"public"."plan_subscriptions_billing_method_enum";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      DECLARE
        current_type text;
      BEGIN
        SELECT udt_name INTO current_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'subscription_invoices'
          AND column_name = 'billing_method';

        IF current_type IS DISTINCT FROM 'subscription_invoices_billing_method_enum' THEN
          ALTER TABLE "subscription_invoices"
            ALTER COLUMN "billing_method"
            TYPE "public"."subscription_invoices_billing_method_enum"
            USING "billing_method"::text::"public"."subscription_invoices_billing_method_enum";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."subscription_billing_method_enum";
    `);

    /* ---------------------------------------------------------------- */
    /* Foreign keys and indexes                                          */
    /* ---------------------------------------------------------------- */

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_subscription_invoices_subscription'
        ) THEN
          ALTER TABLE "subscription_invoices"
            DROP CONSTRAINT "FK_subscription_invoices_subscription";
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_4f183991dc9bcbda39fa6141931'
        ) THEN
          ALTER TABLE "subscription_invoices"
            ADD CONSTRAINT "FK_4f183991dc9bcbda39fa6141931"
            FOREIGN KEY ("subscription_id")
            REFERENCES "plan_subscriptions"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_plan_subscriptions_next_billing_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_subscription_invoices_subscription_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_subscription_invoices_charge_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_subscription_invoices_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_payment_checkouts_business_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_payment_checkouts_purpose"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_payment_checkouts_status"`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_52d43a8573296d4d1aafae5505" ON "plan_subscriptions" ("next_billing_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_4f183991dc9bcbda39fa614193" ON "subscription_invoices" ("subscription_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_93c696be07257ea729bcff6297" ON "subscription_invoices" ("charge_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_a1157200973b566a6bf4204f16" ON "subscription_invoices" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_62ad996d68eca135c0da93ae9e" ON "payment_checkouts" ("business_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_0ecb7a64538ee9c6c9ac3fe709" ON "payment_checkouts" ("purpose")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_63e9e7c1860628fd10aca7791a" ON "payment_checkouts" ("purpose_ref")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_ebfee94f31e51eb4850209f059" ON "payment_checkouts" ("status")`,
    );

    /* ---------------------------------------------------------------- */
    /* Payment checkout unique keys: constraints -> unique indexes       */
    /* ---------------------------------------------------------------- */

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'UQ_payment_checkouts_charge_id'
        ) THEN
          ALTER TABLE "payment_checkouts"
            DROP CONSTRAINT "UQ_payment_checkouts_charge_id";
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'UQ_payment_checkouts_idempotency_key'
        ) THEN
          ALTER TABLE "payment_checkouts"
            DROP CONSTRAINT "UQ_payment_checkouts_idempotency_key";
        END IF;
      END $$;
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_265da30708afada24433e2c021" ON "payment_checkouts" ("charge_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_0e21b9f03c3b8ef9e8df1dfe0d" ON "payment_checkouts" ("idempotency_key")`,
    );

    /* ---------------------------------------------------------------- */
    /* Access pass FKs: normalise old handwritten names (already-applied  */
    /* databases) to the generated names used by fresh installations.     */
    /* ---------------------------------------------------------------- */

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_access_pass_codes_plan'
        ) THEN
          ALTER TABLE "access_pass_codes" DROP CONSTRAINT "FK_access_pass_codes_plan";
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_ddee18e2fd18561afea67d33f5d'
        ) THEN
          ALTER TABLE "access_pass_codes"
            ADD CONSTRAINT "FK_ddee18e2fd18561afea67d33f5d"
            FOREIGN KEY ("plan_id") REFERENCES "access_pass_plans"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_access_pass_codes_business'
        ) THEN
          ALTER TABLE "access_pass_codes" DROP CONSTRAINT "FK_access_pass_codes_business";
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_5dbe1fa477a869888e9774b1277'
        ) THEN
          ALTER TABLE "access_pass_codes"
            ADD CONSTRAINT "FK_5dbe1fa477a869888e9774b1277"
            FOREIGN KEY ("assigned_business_id") REFERENCES "businesses"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_access_pass_subscriptions_business'
        ) THEN
          ALTER TABLE "access_pass_subscriptions" DROP CONSTRAINT "FK_access_pass_subscriptions_business";
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_043aed3a35c077bfddbf983f16f'
        ) THEN
          ALTER TABLE "access_pass_subscriptions"
            ADD CONSTRAINT "FK_043aed3a35c077bfddbf983f16f"
            FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_access_pass_subscriptions_plan'
        ) THEN
          ALTER TABLE "access_pass_subscriptions" DROP CONSTRAINT "FK_access_pass_subscriptions_plan";
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_d109b91bdc9a7e5d4583eb5cba8'
        ) THEN
          ALTER TABLE "access_pass_subscriptions"
            ADD CONSTRAINT "FK_d109b91bdc9a7e5d4583eb5cba8"
            FOREIGN KEY ("plan_id") REFERENCES "access_pass_plans"("id")
            ON DELETE RESTRICT ON UPDATE NO ACTION;
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_access_pass_subscriptions_code'
        ) THEN
          ALTER TABLE "access_pass_subscriptions" DROP CONSTRAINT "FK_access_pass_subscriptions_code";
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_7d93d22eed1d5af0615a461de7e'
        ) THEN
          ALTER TABLE "access_pass_subscriptions"
            ADD CONSTRAINT "FK_7d93d22eed1d5af0615a461de7e"
            FOREIGN KEY ("code_id") REFERENCES "access_pass_codes"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /* Restore the pre-sync index names and the shared billing enum. */
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_0e21b9f03c3b8ef9e8df1dfe0d"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_265da30708afada24433e2c021"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_ebfee94f31e51eb4850209f059"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_63e9e7c1860628fd10aca7791a"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_0ecb7a64538ee9c6c9ac3fe709"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_62ad996d68eca135c0da93ae9e"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_a1157200973b566a6bf4204f16"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_93c696be07257ea729bcff6297"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_4f183991dc9bcbda39fa614193"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_52d43a8573296d4d1aafae5505"`,
    );

    await queryRunner.query(
      `ALTER TABLE "payment_checkouts" ADD CONSTRAINT "UQ_payment_checkouts_charge_id" UNIQUE ("charge_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_checkouts" ADD CONSTRAINT "UQ_payment_checkouts_idempotency_key" UNIQUE ("idempotency_key")`,
    );

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'subscription_billing_method_enum'
        ) THEN
          CREATE TYPE "public"."subscription_billing_method_enum"
            AS ENUM('wallet', 'stripe', 'paypal');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "plan_subscriptions"
        ALTER COLUMN "billing_method"
        TYPE "public"."subscription_billing_method_enum"
        USING "billing_method"::text::"public"."subscription_billing_method_enum";
    `);
    await queryRunner.query(`
      ALTER TABLE "subscription_invoices"
        ALTER COLUMN "billing_method"
        TYPE "public"."subscription_billing_method_enum"
        USING "billing_method"::text::"public"."subscription_billing_method_enum";
    `);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."plan_subscriptions_billing_method_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."subscription_invoices_billing_method_enum"`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_payment_checkouts_status" ON "payment_checkouts" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_checkouts_purpose" ON "payment_checkouts" ("purpose")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_checkouts_business_id" ON "payment_checkouts" ("business_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_subscription_invoices_status" ON "subscription_invoices" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_subscription_invoices_charge_id" ON "subscription_invoices" ("charge_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_subscription_invoices_subscription_id" ON "subscription_invoices" ("subscription_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_plan_subscriptions_next_billing_at" ON "plan_subscriptions" ("next_billing_at")`,
    );

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_4f183991dc9bcbda39fa6141931'
        ) THEN
          ALTER TABLE "subscription_invoices"
            DROP CONSTRAINT "FK_4f183991dc9bcbda39fa6141931";
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_subscription_invoices_subscription'
        ) THEN
          ALTER TABLE "subscription_invoices"
            ADD CONSTRAINT "FK_subscription_invoices_subscription"
            FOREIGN KEY ("subscription_id") REFERENCES "plan_subscriptions"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
  }
}
