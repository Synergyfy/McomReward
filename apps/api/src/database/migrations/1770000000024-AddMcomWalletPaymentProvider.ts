import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * MCOM Pay wallet charges are now a first-class payment provider. Adding the
 * enum value keeps payment_history and plan_subscriptions consistent with the
 * MCOM Pay method that actually settled the charge.
 */
export class AddMcomWalletPaymentProvider1770000000024 implements MigrationInterface {
  name = "AddMcomWalletPaymentProvider1770000000024";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_history_payment_provider_enum') THEN
          ALTER TYPE "public"."payment_history_payment_provider_enum"
            ADD VALUE IF NOT EXISTS 'mcom_wallet';
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_subscriptions_payment_provider_enum') THEN
          ALTER TYPE "public"."plan_subscriptions_payment_provider_enum"
            ADD VALUE IF NOT EXISTS 'mcom_wallet';
        END IF;
      END $$;
    `);
  }

  public async down(): Promise<void> {
    // Postgres cannot remove an enum value safely.
  }
}
