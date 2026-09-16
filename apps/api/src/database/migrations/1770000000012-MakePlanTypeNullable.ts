import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePlanTypeNullable1770000000012 implements MigrationInterface {
  name = "MakePlanTypeNullable1770000000012";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the NOT NULL constraint on plan_type so the column matches the entity
    // which marks it nullable: true. Existing rows with a value are unaffected.
    await queryRunner.query(
      `ALTER TABLE "membership" ALTER COLUMN "plan_type" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the NOT NULL constraint (only safe if all rows have a value)
    await queryRunner.query(
      `UPDATE "membership" SET "plan_type" = 'monthly' WHERE "plan_type" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ALTER COLUMN "plan_type" SET NOT NULL`,
    );
  }
}
