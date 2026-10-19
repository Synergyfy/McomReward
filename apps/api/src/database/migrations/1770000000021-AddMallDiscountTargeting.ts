import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds mall discount targeting to business rewards and the MallDiscount reward
 * type. Targeting is mirrored into `reward_issuance.metadata.mallTargets` at
 * issue time and evaluated server-side by MCOM Mall.
 *
 * See the MCOM Rewards ⇄ MCOM Mall integration handbook v3 §7, §10.3, §12.
 */
export class AddMallDiscountTargeting1770000000021
  implements MigrationInterface
{
  name = "AddMallDiscountTargeting1770000000021";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'MallDiscount' to every enum type that currently carries the reward
    // type labels (reward + business_reward), whatever TypeORM named them.
    await queryRunner.query(`
      DO $$
      DECLARE
        t record;
      BEGIN
        FOR t IN
          SELECT n.nspname AS schema_name, typ.typname AS type_name
          FROM pg_type typ
          JOIN pg_enum e ON e.enumtypid = typ.oid
          JOIN pg_namespace n ON n.oid = typ.typnamespace
          WHERE e.enumlabel = 'physical product'
        LOOP
          EXECUTE format(
            'ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS %L',
            t.schema_name, t.type_name, 'MallDiscount'
          );
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "business_reward" ADD COLUMN IF NOT EXISTS "mall_target_scope" character varying;
      ALTER TABLE "business_reward" ADD COLUMN IF NOT EXISTS "mall_target_product_ids" jsonb;
      ALTER TABLE "business_reward" ADD COLUMN IF NOT EXISTS "mall_target_service_ids" jsonb;
      ALTER TABLE "business_reward" ADD COLUMN IF NOT EXISTS "mall_discount_type" character varying;
      ALTER TABLE "business_reward" ADD COLUMN IF NOT EXISTS "mall_discount_value" numeric(12,2);
      ALTER TABLE "business_reward" ADD COLUMN IF NOT EXISTS "mall_max_discount" numeric(12,2);
      ALTER TABLE "business_reward" ADD COLUMN IF NOT EXISTS "mall_min_spend" numeric(12,2);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "business_reward" DROP COLUMN IF EXISTS "mall_min_spend";
      ALTER TABLE "business_reward" DROP COLUMN IF EXISTS "mall_max_discount";
      ALTER TABLE "business_reward" DROP COLUMN IF EXISTS "mall_discount_value";
      ALTER TABLE "business_reward" DROP COLUMN IF EXISTS "mall_discount_type";
      ALTER TABLE "business_reward" DROP COLUMN IF EXISTS "mall_target_service_ids";
      ALTER TABLE "business_reward" DROP COLUMN IF EXISTS "mall_target_product_ids";
      ALTER TABLE "business_reward" DROP COLUMN IF EXISTS "mall_target_scope";
    `);
    // Postgres cannot remove a value from an enum type.
  }
}
