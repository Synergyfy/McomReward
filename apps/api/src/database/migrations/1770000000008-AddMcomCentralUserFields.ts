import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMcomCentralUserFields1770000000008 implements MigrationInterface {
  name = "AddMcomCentralUserFields1770000000008";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "mcomUserId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "mcomAccessToken" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "mcomRefreshToken" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "mcomTokenExpiresAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "membershipLevel" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "membershipTier" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD IF NOT EXISTS "membershipStatus" character varying`,
    );

    await queryRunner.query(
      `ALTER TABLE "participants" ADD IF NOT EXISTS "mcomUserId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "participants" ADD IF NOT EXISTS "mcomAccessToken" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "participants" ADD IF NOT EXISTS "mcomRefreshToken" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "participants" ADD IF NOT EXISTS "mcomTokenExpiresAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "participants" DROP COLUMN IF EXISTS "mcomTokenExpiresAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "participants" DROP COLUMN IF EXISTS "mcomRefreshToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "participants" DROP COLUMN IF EXISTS "mcomAccessToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "participants" DROP COLUMN IF EXISTS "mcomUserId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "membershipStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "membershipTier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "membershipLevel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "mcomTokenExpiresAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "mcomRefreshToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "mcomAccessToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "mcomUserId"`,
    );
  }
}
