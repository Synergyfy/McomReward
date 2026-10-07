import { MigrationInterface, QueryRunner } from "typeorm";

export class PointHistoryActionKeyUnique1770000000014 implements MigrationInterface {
  name = "PointHistoryActionKeyUnique1770000000014";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Partial unique index: concurrent idempotent redeems cannot double-insert.
    // NULLs are ignored so rows without an idempotency key are unaffected.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE indexname = 'UQ_point_histories_actionKey'
        ) THEN
          CREATE UNIQUE INDEX "UQ_point_histories_actionKey"
          ON "point_histories" ("actionKey")
          WHERE "actionKey" IS NOT NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_point_histories_actionKey"`);
  }
}
