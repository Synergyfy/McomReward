import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStaffIsDisabled1770000000009 implements MigrationInterface {
  name = "AddStaffIsDisabled1770000000009";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff" ADD "isDisabled" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "isDisabled"`);
  }
}