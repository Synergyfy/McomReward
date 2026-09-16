import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTierIdToMembership1770000000011 implements MigrationInterface {
  name = "AddTierIdToMembership1770000000011";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add tier_id FK column to membership table (nullable, legacy/fallback field)
    await queryRunner.query(
      `ALTER TABLE "membership" ADD COLUMN IF NOT EXISTS "tier_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_membership_tier" FOREIGN KEY ("tier_id") REFERENCES "tier"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT IF EXISTS "FK_membership_tier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" DROP COLUMN IF EXISTS "tier_id"`,
    );
  }
}
