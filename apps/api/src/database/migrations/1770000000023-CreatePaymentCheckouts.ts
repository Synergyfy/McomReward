import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Local mirror for MCOM Pay checkouts. Amounts are minor-unit strings so we
 * never persist a float for money that MCOM stores as exact integers.
 *
 * See MCOM Payments Partner Integration Guide, Part B and Part C.
 */
export class CreatePaymentCheckouts1770000000023 implements MigrationInterface {
  name = "CreatePaymentCheckouts1770000000023";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_checkouts_purpose_enum') THEN
          CREATE TYPE "public"."payment_checkouts_purpose_enum" AS ENUM(
            'PLAN', 'POINT_PACKAGE', 'STAMP_PACKAGE', 'EXTRA_POINTS', 'CIRCLE_CONTRIBUTION'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_checkouts_status_enum') THEN
          CREATE TYPE "public"."payment_checkouts_status_enum" AS ENUM(
            'pending', 'paid', 'failed', 'refunded', 'canceled'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_checkouts_method_enum') THEN
          CREATE TYPE "public"."payment_checkouts_method_enum" AS ENUM(
            'stripe', 'paypal', 'wallet'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_checkouts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "business_id" uuid,
        "purpose" "public"."payment_checkouts_purpose_enum" NOT NULL,
        "purpose_ref" character varying,
        "status" "public"."payment_checkouts_status_enum" NOT NULL DEFAULT 'pending',
        "amount_minor" character varying NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'GBP',
        "method" "public"."payment_checkouts_method_enum" NOT NULL,
        "charge_id" character varying,
        "provider_ref" character varying,
        "idempotency_key" character varying NOT NULL,
        "reference" character varying,
        "fee_minor" character varying,
        "net_minor" character varying,
        "metadata" jsonb,
        "paid_at" TIMESTAMP WITH TIME ZONE,
        "refunded_at" TIMESTAMP WITH TIME ZONE,
        "fulfilled_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_payment_checkouts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payment_checkouts_charge_id" UNIQUE ("charge_id"),
        CONSTRAINT "UQ_payment_checkouts_idempotency_key" UNIQUE ("idempotency_key")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_checkouts_business_id" ON "payment_checkouts" ("business_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_checkouts_purpose" ON "payment_checkouts" ("purpose")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_checkouts_status" ON "payment_checkouts" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_checkouts"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_checkouts_method_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_checkouts_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_checkouts_purpose_enum"`,
    );
  }
}
