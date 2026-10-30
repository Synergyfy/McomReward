import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * One-off repair for issuances that were fulfilled successfully before the
 * fulfilment orchestrator started marking provider-backed rewards DELIVERED.
 *
 * The `fulfilment_status` column defaulted to NOT_REQUIRED; successful Mall
 * instrument and Central grant fulfilments were therefore left at that value
 * even though `fulfilment_ref` / `fulfilment_code` were populated.
 *
 * Additive and idempotent: only rows with a provider reference and the legacy
 * default are touched.
 */
export class BackfillDeliveredFulfilmentStatus1770000000030
  implements MigrationInterface
{
  name = "BackfillDeliveredFulfilmentStatus1770000000030";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "reward_issuance"
      SET "fulfilment_status" = 'DELIVERED',
          "fulfilled_at" = COALESCE("fulfilled_at", "updated_at")
      WHERE "fulfilment_status" = 'NOT_REQUIRED'
        AND (
          "fulfilment_provider" IN ('MALL', 'CENTRAL')
          OR "fulfilment_ref" IS NOT NULL
          OR "fulfilment_code" IS NOT NULL
        );
    `);
  }

  public async down(): Promise<void> {
    // Irreversible on purpose: restoring NOT_REQUIRED would re-introduce the
    // reporting bug. No schema change is made, so down() is a no-op.
  }
}
