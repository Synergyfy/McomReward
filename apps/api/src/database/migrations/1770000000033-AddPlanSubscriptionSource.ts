import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Access can come from several places at once:
 *   - a plan purchased directly from MCOM Rewards (local)
 *   - a direct plan provisioned by MCOM Central (central)
 *   - a plan bundled with a Central membership (membership)
 *   - a Central trial (trial)
 *
 * Keeping one row per source lets a locally purchased plan take priority while
 * a membership plan remains available as the fallback once it expires.
 *
 * The enum values are intentionally declared in priority order.
 */
export class AddPlanSubscriptionSource1770000000033 implements MigrationInterface {
  name = "AddPlanSubscriptionSource1770000000033";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'plan_subscriptions_source_enum'
        ) THEN
          CREATE TYPE "public"."plan_subscriptions_source_enum" AS ENUM(
            'local', 'central', 'membership', 'trial'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "plan_subscriptions"
        ADD COLUMN IF NOT EXISTS "source"
          "public"."plan_subscriptions_source_enum" NOT NULL DEFAULT 'local';
    `);

    await queryRunner.query(`
      UPDATE "plan_subscriptions"
      SET "source" = CASE
        WHEN "is_trial" = true
          OR "transaction_id" LIKE 'CENTRAL-ENTITLEMENT-TRIAL_PROGRAMME%'
          THEN 'trial'::"public"."plan_subscriptions_source_enum"
        WHEN "transaction_id" LIKE 'CENTRAL-APPPLAN-%'
          THEN 'central'::"public"."plan_subscriptions_source_enum"
        WHEN "transaction_id" LIKE 'CENTRAL-%'
          THEN 'membership'::"public"."plan_subscriptions_source_enum"
        ELSE 'local'::"public"."plan_subscriptions_source_enum"
      END
      WHERE "source" = 'local';
    `);

    // Central entitlements are not billed by this app. Older syncs could
    // overwrite a local row and leave its renewal schedule behind, so make
    // sure only local plans are picked up by the renewal cron.
    await queryRunner.query(`
      UPDATE "plan_subscriptions"
      SET "auto_renew" = false,
          "next_billing_at" = NULL
      WHERE "source" <> 'local';
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_plan_subscriptions_business_source" ON "plan_subscriptions" ("business_id", "source")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_plan_subscriptions_business_source"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_subscriptions" DROP COLUMN IF EXISTS "source"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."plan_subscriptions_source_enum"`,
    );
  }
}
