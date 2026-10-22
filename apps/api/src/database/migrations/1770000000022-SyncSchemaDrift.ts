import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Reconciles schema drift that the local/pre-existing databases accumulated
 * through TypeORM synchronize runs: migration-created index and constraint
 * names are replaced with the entity-generated names, the plaque payout column
 * is renamed to camelCase, and obsolete join tables are removed.
 *
 * Every statement is guarded, so this migration is a no-op on databases that
 * already have the target shape.
 */
export class SyncSchemaDrift1770000000022 implements MigrationInterface {
  name = "SyncSchemaDrift1770000000022";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "business_campaign_platform_rewards" CASCADE`,
    );

    await queryRunner.query(
      `DROP TABLE IF EXISTS "business_campaigns_business_rewards_business_reward" CASCADE`,
    );

    await queryRunner.query(
      `DROP TABLE IF EXISTS "business_campaigns_deals_deals" CASCADE`,
    );

    await queryRunner.query(
      `DROP TABLE IF EXISTS "group_circle_source_lists" CASCADE`,
    );

    await queryRunner.query(
      `DROP TABLE IF EXISTS "network_list_members" CASCADE`,
    );

    await queryRunner.query(`DROP TABLE IF EXISTS "network_lists" CASCADE`);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."membership_payment_provider_enum"`,
    );

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."membership_progression_level_enum"`,
    );

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."membership_variant_enum"`,
    );

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."network_lists_geography_enum"`,
    );

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."network_lists_status_enum"`,
    );

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."network_lists_type_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "plan_variants" DROP CONSTRAINT IF EXISTS "FK_plan_variants_plan"`,
    );

    await queryRunner.query(
      `ALTER TABLE "plan_variants" DROP CONSTRAINT IF EXISTS "FK_plan_variants_tier_level"`,
    );

    await queryRunner.query(
      `ALTER TABLE "reward_issuance" DROP CONSTRAINT IF EXISTS "FK_reward_issuance_reward"`,
    );

    await queryRunner.query(
      `ALTER TABLE "nfc_cards" DROP CONSTRAINT IF EXISTS "FK_nfc_cards_business"`,
    );

    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "FK_role_permissions_roles"`,
    );

    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "FK_role_permissions_permissions"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_point_histories_actionKey"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_audit_logs_action"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_plaque_scans_plaque_id"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_plaque_sales_plaque_name"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_reward_issuance_idempotency"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_reward_issuance_external_ref"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_reward_issuance_status_reserved"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_matching_point_history_business_created_at"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_matching_point_history_description"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_matching_point_history_business_activity_created_at"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_loyalty_setup_templates_sector_key"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_payout_requests_business_id"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_escrows_campaign_id"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_credit_transactions_user"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_credit_rules_event_type"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_credit_levels_level"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_nfc_cards_business"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_role_permissions_roles"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_role_permissions_permissions"`,
    );

    await queryRunner.query(`DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plaque_sales' AND column_name = 'payout_status') THEN
    ALTER TABLE "plaque_sales" RENAME COLUMN "payout_status" TO "payoutStatus";
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typname = 'plaque_sales_payout_status_enum') THEN
    ALTER TYPE "public"."plaque_sales_payout_status_enum" RENAME TO "plaque_sales_payoutstatus_enum";
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_079ca9432114424ce76ea554521') THEN
    ALTER TABLE "point_histories" ADD CONSTRAINT "UQ_079ca9432114424ce76ea554521" UNIQUE ("actionKey");
  END IF;
END $$`);

    await queryRunner.query(
      `COMMENT ON COLUMN "stamp_reward_templates"."stamp_validity_days" IS NULL`,
    );

    await queryRunner.query(
      `COMMENT ON COLUMN "stamp_reward_templates"."reward_claim_deadline_days" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "group_circles" ALTER COLUMN "interactionLevel" SET DEFAULT 'COLLABORATE'`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_ceef338522d185a8e27ecc17a3" ON "plaque_scans" ("plaque_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_ac804f75213337316e0c7191f5" ON "plaque_sales" ("plaque_name")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_1c8bd53ab36f10e2e740ce4cd3" ON "reward_issuance" ("issuer_client_id", "external_ref")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b05f3983c9247944b73e63c2c8" ON "reward_issuance" ("issuer_client_id", "idempotency_key")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_3919658a7561ad5c4a004fe168" ON "loyalty_setup_templates" ("sector_key")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_6e7966bf474efb0012252c5a16" ON "payout_requests" ("business_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_cec547c62a9c69fcce5b5cddaa" ON "escrows" ("campaign_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_eb56bb81f1690d875347b2b994" ON "credit_transactions" ("user_id", "created_at")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_2d5c1e1609c390f4f74f76c50f" ON "credit_rules" ("event_type")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_5b377383fc4de90c687f8a24a3" ON "credit_levels" ("level")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_0cb93c5877d37e954e2aa59e52" ON "role_permissions" ("rolesId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_d422dabc78ff74a8dab6583da0" ON "role_permissions" ("permissionsId")`,
    );

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_d27be70a5cecf5199cdbbd4c555') THEN
    ALTER TABLE "plan_prices" ADD CONSTRAINT "FK_d27be70a5cecf5199cdbbd4c555" FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_577c0c65bf8e679d8f8afbf4df9') THEN
    ALTER TABLE "plan_variants" ADD CONSTRAINT "FK_577c0c65bf8e679d8f8afbf4df9" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_04c03767eab833fba740129d3ed') THEN
    ALTER TABLE "plan_variants" ADD CONSTRAINT "FK_04c03767eab833fba740129d3ed" FOREIGN KEY ("tier_level_id") REFERENCES "plan_tier_levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_bc8b278bc3c71d0bf7564ad9174') THEN
    ALTER TABLE "plan_subscriptions" ADD CONSTRAINT "FK_bc8b278bc3c71d0bf7564ad9174" FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_58b08e5f4a4958ab8e4cadabe94') THEN
    ALTER TABLE "plan_subscriptions" ADD CONSTRAINT "FK_58b08e5f4a4958ab8e4cadabe94" FOREIGN KEY ("price_id") REFERENCES "plan_prices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_51f546e5130716debe4bd0a48ed') THEN
    ALTER TABLE "reward_issuance" ADD CONSTRAINT "FK_51f546e5130716debe4bd0a48ed" FOREIGN KEY ("reward_id") REFERENCES "reward"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_02a4a32368ed0666f9b34332f4e') THEN
    ALTER TABLE "nfc_cards" ADD CONSTRAINT "FK_02a4a32368ed0666f9b34332f4e" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_0cb93c5877d37e954e2aa59e52c') THEN
    ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$`);

    await queryRunner.query(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_d422dabc78ff74a8dab6583da02') THEN
    ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_d422dabc78ff74a8dab6583da02" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$`);

    await queryRunner.query(
      `ALTER TABLE "plan_prices" DROP CONSTRAINT IF EXISTS "FK_plan_prices_variant"`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Drift reconciliation is intentionally irreversible.
  }
}
