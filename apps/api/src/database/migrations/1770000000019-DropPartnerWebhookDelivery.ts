import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * The HMAC webhook-key channel was replaced by direct app-to-app mesh calls.
 * The old `partner_webhook_delivery` table + enum may exist on databases that
 * ran the original 1770000000018 migration, so drop them.
 */
export class DropPartnerWebhookDelivery1770000000019
  implements MigrationInterface
{
  name = "DropPartnerWebhookDelivery1770000000019";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "partner_webhook_delivery"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."partner_webhook_delivery_status_enum"`,
    );
  }

  public async down(): Promise<void> {
    // Irreversible cleanup — the webhook-key channel is gone.
  }
}
