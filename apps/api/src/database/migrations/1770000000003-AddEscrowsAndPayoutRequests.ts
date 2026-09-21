import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEscrowsAndPayoutRequests1770000000003 implements MigrationInterface {
  name = "AddEscrowsAndPayoutRequests1770000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."escrows_status_enum" AS ENUM('held', 'released', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "escrows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "campaign_id" uuid NOT NULL, "campaign_name" character varying NOT NULL, "business_id" uuid NOT NULL, "business_name" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "status" "public"."escrows_status_enum" NOT NULL DEFAULT 'held', "released_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_escrows" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_escrows_campaign_id" ON "escrows" ("campaign_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payout_requests_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payout_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "business_id" uuid NOT NULL, "business_name" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "status" "public"."payout_requests_status_enum" NOT NULL DEFAULT 'pending', "requested_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "processed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_payout_requests" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payout_requests_business_id" ON "payout_requests" ("business_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_payout_requests_business_id"`,
    );
    await queryRunner.query(`DROP TABLE "payout_requests"`);
    await queryRunner.query(`DROP TYPE "public"."payout_requests_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_escrows_campaign_id"`);
    await queryRunner.query(`DROP TABLE "escrows"`);
    await queryRunner.query(`DROP TYPE "public"."escrows_status_enum"`);
  }
}
