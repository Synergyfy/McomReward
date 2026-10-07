import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNfcCards1770000000015 implements MigrationInterface {
  name = "CreateNfcCards1770000000015";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nfc_cards_type_enum') THEN
          CREATE TYPE "public"."nfc_cards_type_enum" AS ENUM('Business', 'Staff', 'Premium');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nfc_cards_status_enum') THEN
          CREATE TYPE "public"."nfc_cards_status_enum" AS ENUM('Active', 'Inactive', 'Pending');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "nfc_cards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "type" "public"."nfc_cards_type_enum" NOT NULL DEFAULT 'Business',
        "status" "public"."nfc_cards_status_enum" NOT NULL DEFAULT 'Pending',
        "tapCount" integer NOT NULL DEFAULT 0,
        "linkedPage" character varying,
        "business_id" uuid,
        CONSTRAINT "PK_nfc_cards" PRIMARY KEY ("id"),
        CONSTRAINT "FK_nfc_cards_business" FOREIGN KEY ("business_id")
          REFERENCES "businesses"("id") ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "IDX_nfc_cards_business" ON "nfc_cards" ("business_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "nfc_cards"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."nfc_cards_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."nfc_cards_type_enum"`);
  }
}
