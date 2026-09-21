import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlaqueSales1770000000001 implements MigrationInterface {
  name = "AddPlaqueSales1770000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."plaque_sales_payout_status_enum" AS ENUM('Pending', 'Paid', 'Cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plaque_sales_status_enum" AS ENUM('Completed', 'Canceled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "plaque_sales" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "plaque_id" uuid NOT NULL, "plaque_name" character varying NOT NULL, "seller_id" uuid NOT NULL, "seller_name" character varying NOT NULL, "buyer_id" uuid NOT NULL, "buyer_name" character varying NOT NULL, "sale_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "sale_price" numeric(12,2) NOT NULL, "commission_percentage" numeric(5,2) NOT NULL DEFAULT '0', "commission_amount" numeric(12,2) NOT NULL, "payout_status" "public"."plaque_sales_payout_status_enum" NOT NULL DEFAULT 'Pending', "status" "public"."plaque_sales_status_enum" NOT NULL DEFAULT 'Completed', CONSTRAINT "PK_plaque_sales" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_plaque_sales_plaque_name" ON "plaque_sales" ("plaque_name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_plaque_sales_plaque_name"`,
    );
    await queryRunner.query(`DROP TABLE "plaque_sales"`);
    await queryRunner.query(`DROP TYPE "public"."plaque_sales_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."plaque_sales_payout_status_enum"`,
    );
  }
}
