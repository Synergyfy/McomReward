import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntitlementFieldsToBusiness1770000000017 implements MigrationInterface {
  name = "AddEntitlementFieldsToBusiness1770000000017";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "entitlementSource" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "hasPaidVerificationFee" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "trialTasks" jsonb DEFAULT '[]'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "entitlementData" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "entitlementData"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "trialTasks"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "hasPaidVerificationFee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "entitlementSource"`,
    );
  }
}
