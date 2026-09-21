import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBrandingPartnersAndNotificationAdmin1770000000000 implements MigrationInterface {
  name = "AddBrandingPartnersAndNotificationAdmin1770000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."branding_partners_type_enum" AS ENUM('Co-Brand', 'White-Label')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."branding_partners_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "branding_partners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "type" "public"."branding_partners_type_enum" NOT NULL DEFAULT 'Co-Brand', "status" "public"."branding_partners_status_enum" NOT NULL DEFAULT 'active', "branding_logo" boolean NOT NULL DEFAULT false, "branding_colors" boolean NOT NULL DEFAULT false, "branding_text_lock" boolean NOT NULL DEFAULT false, "subdomain" character varying NOT NULL, "domain_routing" character varying, "revenue_sharing" character varying NOT NULL, "performance_total_users" integer, "performance_total_rewards_claimed" integer, "performance_revenue_generated" numeric(12,2), CONSTRAINT "UQ_2b4f9a6e1b1a1e1f1a1e1f1a1e1f" UNIQUE ("subdomain"), CONSTRAINT "PK_branding_partners" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."notification_templates_type_enum" AS ENUM('email', 'push', 'in-app')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_templates_status_enum" AS ENUM('draft', 'active', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "type" "public"."notification_templates_type_enum" NOT NULL, "subject" character varying NOT NULL, "body" text NOT NULL, "target_audience" character varying NOT NULL, "status" "public"."notification_templates_status_enum" NOT NULL DEFAULT 'draft', CONSTRAINT "PK_notification_templates" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."announcements_status_enum" AS ENUM('draft', 'active', 'scheduled', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "announcements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "content" text NOT NULL, "target_audience" character varying NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE, "end_date" TIMESTAMP WITH TIME ZONE, "status" "public"."announcements_status_enum" NOT NULL DEFAULT 'draft', CONSTRAINT "PK_announcements" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "announcements"`);
    await queryRunner.query(`DROP TYPE "public"."announcements_status_enum"`);
    await queryRunner.query(`DROP TABLE "notification_templates"`);
    await queryRunner.query(
      `DROP TYPE "public"."notification_templates_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."notification_templates_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "branding_partners"`);
    await queryRunner.query(
      `DROP TYPE "public"."branding_partners_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."branding_partners_type_enum"`);
  }
}
