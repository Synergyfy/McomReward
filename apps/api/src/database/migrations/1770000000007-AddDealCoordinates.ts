import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDealCoordinates1770000000007 implements MigrationInterface {
  name = "AddDealCoordinates1770000000007";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "deals" ADD "latitude" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "deals" ADD "longitude" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "latitude"`);
  }
}
