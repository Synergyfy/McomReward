import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProcessedWebhookEvents1770000000032 implements MigrationInterface {
  name = "CreateProcessedWebhookEvents1770000000032";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "processed_webhook_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "event_id" character varying NOT NULL,
        "event_type" character varying NOT NULL,
        "payload" jsonb,
        "processed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_processed_webhook_events" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_processed_webhook_events_event_id"
        ON "processed_webhook_events" ("event_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_processed_webhook_events_event_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "processed_webhook_events"`);
  }
}
