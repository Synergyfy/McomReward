import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Renewal charges use a dedicated purpose so the fulfillment handler advances
 * the existing subscription period instead of creating a brand-new one.
 */
export class AddPlanRenewalCheckoutPurpose1770000000026 implements MigrationInterface {
  name = "AddPlanRenewalCheckoutPurpose1770000000026";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_checkouts_purpose_enum') THEN
          ALTER TYPE "public"."payment_checkouts_purpose_enum"
            ADD VALUE IF NOT EXISTS 'PLAN_RENEWAL';
        END IF;
      END $$;
    `);
  }

  public async down(): Promise<void> {
    // Postgres cannot remove an enum value safely.
  }
}
