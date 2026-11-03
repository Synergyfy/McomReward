import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLoyaltySetupProgress1770000000031 implements MigrationInterface {
  name = "CreateLoyaltySetupProgress1770000000031";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "loyalty_setup_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "business_id" uuid NOT NULL, "has_seen_welcome" boolean NOT NULL DEFAULT false, "has_seen_ecosystem_intro" boolean NOT NULL DEFAULT false, "selected_template_id" uuid, "selected_campaigns" jsonb NOT NULL DEFAULT '[]', "reward_customizations" jsonb NOT NULL DEFAULT '{}', "campaign_descriptions" jsonb NOT NULL DEFAULT '{}', "enabled_engines" jsonb, "tier_config" jsonb, "has_completed_setup" boolean NOT NULL DEFAULT false, "has_skipped_onboarding" boolean NOT NULL DEFAULT false, "completed_at" TIMESTAMP, CONSTRAINT "PK_loyalty_setup_progress" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2f715b573fbe09f3e587eda95b" ON "loyalty_setup_progress" ("business_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_setup_progress" ADD CONSTRAINT "FK_2f715b573fbe09f3e587eda95b1" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loyalty_setup_progress" DROP CONSTRAINT "FK_2f715b573fbe09f3e587eda95b1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f715b573fbe09f3e587eda95b"`,
    );
    await queryRunner.query(`DROP TABLE "loyalty_setup_progress"`);
  }
}
