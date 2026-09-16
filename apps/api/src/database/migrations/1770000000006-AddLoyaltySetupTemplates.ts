import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoyaltySetupTemplates1770000000006 implements MigrationInterface {
  name = "AddLoyaltySetupTemplates1770000000006";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "loyalty_setup_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying NOT NULL, "sector_key" character varying NOT NULL, "benefits" json, "rewards" json NOT NULL, "campaigns" json, "is_built_in" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_loyalty_setup_templates" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_setup_templates_sector_key" ON "loyalty_setup_templates" ("sector_key") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_loyalty_setup_templates_sector_key"`,
    );
    await queryRunner.query(`DROP TABLE "loyalty_setup_templates"`);
  }
}