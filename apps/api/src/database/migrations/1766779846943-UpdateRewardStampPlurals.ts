import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Normalises the singular stamp/point column names introduced by
 * AddStampRequirementsToRewards to the plural names used by the entities and
 * by SeedGiftCardsAndMallRewards.
 *
 * The original drop/re-add statements were commented out, which left fresh
 * databases with `point_required` / `stamp_required` / `max_stamp_required`
 * while synchronize-created databases had the plural names. This version
 * performs safe renames instead of dropping data, and is idempotent so it also
 * works on databases that already have the plural columns.
 */
export class UpdateRewardStampPlurals1766779846943 implements MigrationInterface {
  name = "UpdateRewardStampPlurals1766779846943";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'business_reward' AND column_name = 'point_required'
        ) THEN
          ALTER TABLE "business_reward" RENAME COLUMN "point_required" TO "points_required";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'business_reward' AND column_name = 'stamp_required'
        ) THEN
          ALTER TABLE "business_reward" RENAME COLUMN "stamp_required" TO "stamps_required";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'reward' AND column_name = 'max_stamp_required'
        ) THEN
          ALTER TABLE "reward" RENAME COLUMN "max_stamp_required" TO "max_stamps_required";
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'business_reward' AND column_name = 'points_required'
        ) THEN
          ALTER TABLE "business_reward" RENAME COLUMN "points_required" TO "point_required";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'business_reward' AND column_name = 'stamps_required'
        ) THEN
          ALTER TABLE "business_reward" RENAME COLUMN "stamps_required" TO "stamp_required";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'reward' AND column_name = 'max_stamps_required'
        ) THEN
          ALTER TABLE "reward" RENAME COLUMN "max_stamps_required" TO "max_stamp_required";
        END IF;
      END $$;
    `);
  }
}
