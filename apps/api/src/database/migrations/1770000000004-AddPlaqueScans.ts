import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlaqueScans1770000000004 implements MigrationInterface {
  name = "AddPlaqueScans1770000000004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."plaque_scans_type_enum" AS ENUM('scan', 'redemption', 'commission')`,
    );
    await queryRunner.query(
      `CREATE TABLE "plaque_scans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "plaque_id" uuid NOT NULL, "plaque_name" character varying NOT NULL, "type" "public"."plaque_scans_type_enum" NOT NULL DEFAULT 'scan', "description" text NOT NULL, "source" character varying NOT NULL DEFAULT 'QR Code', "scanned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_plaque_scans" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_plaque_scans_plaque_id" ON "plaque_scans" ("plaque_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_plaque_scans_plaque_id"`);
    await queryRunner.query(`DROP TABLE "plaque_scans"`);
    await queryRunner.query(`DROP TYPE "public"."plaque_scans_type_enum"`);
  }
}
