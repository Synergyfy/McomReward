import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerTiersToLoyaltySetupTemplates1770000000023
  implements MigrationInterface
{
  name = "AddCustomerTiersToLoyaltySetupTemplates1770000000023";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loyalty_setup_templates" ADD COLUMN "tier_config" json`,
    );
    await queryRunner.query(
      `UPDATE "loyalty_setup_templates" SET "tier_config" = '{"enabled":false,"tiers":[{"name":"Bronze","requirementType":"points","requirementValue":0,"benefits":["Earn 1x points","Birthday reward"]},{"name":"Silver","requirementType":"points","requirementValue":500,"benefits":["Earn 1.5x points","Early access to offers"]},{"name":"Gold","requirementType":"points","requirementValue":1500,"benefits":["Earn 2x points","VIP offers","Free delivery"]},{"name":"Platinum","requirementType":"points","requirementValue":5000,"benefits":["Earn 3x points","Personal manager","Exclusive events"]}]}'::json WHERE "tier_config" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loyalty_setup_templates" DROP COLUMN "tier_config"`,
    );
  }
}
