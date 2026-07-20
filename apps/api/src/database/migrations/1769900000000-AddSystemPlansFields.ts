import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSystemPlansFields1769900000000 implements MigrationInterface {
  name = "AddSystemPlansFields1769900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tier" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "tier" ADD "is_default" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tier_type_enum" ADD VALUE IF NOT EXISTS 'trial'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tier" DROP COLUMN "is_default"`);
    await queryRunner.query(`ALTER TABLE "tier" DROP COLUMN "description"`);
  }
}
