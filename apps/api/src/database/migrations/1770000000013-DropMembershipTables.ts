import { MigrationInterface, QueryRunner } from "typeorm";

export class DropMembershipTables1770000000013 implements MigrationInterface {
  name = "DropMembershipTables1770000000013";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop foreign key constraints referencing membership if any exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'membership') THEN
          DROP TABLE "membership" CASCADE;
        END IF;
      END $$;
    `);

    // 2. Drop memberships table if it exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'memberships') THEN
          DROP TABLE "memberships" CASCADE;
        END IF;
      END $$;
    `);

    // 3. Drop membership_payments table if it exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'membership_payments') THEN
          DROP TABLE "membership_payments" CASCADE;
        END IF;
      END $$;
    `);

    // 4. Drop membership enum types if they exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_payments_paymentmethod_enum') THEN
          DROP TYPE "public"."membership_payments_paymentmethod_enum";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status_enum') THEN
          DROP TYPE "public"."membership_status_enum";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_plantype_enum') THEN
          DROP TYPE "public"."membership_plantype_enum";
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op rollback since membership table is permanently retired and superseded by plan_subscriptions
  }
}
