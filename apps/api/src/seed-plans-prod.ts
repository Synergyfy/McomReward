import * as dotenv from "dotenv";
import * as path from "path";
import { DataSource } from "typeorm";
import { Tier } from "./resources/tier/entities/tier.entity";
import { TierType } from "./resources/tier/entities/tier-type.enum";
import { TierStatus } from "./resources/tier/entities/tier-status.enum";
import { TierHistory } from "./resources/tier/entities/tier-history.entity";
import { Plan } from "./resources/plans/entities/plan.entity";
import { PlanVariant } from "./resources/plans/entities/plan-variant.entity";
import { PlanPrice } from "./resources/plans/entities/plan-price.entity";
import {
  PlanTierLevel,
  PlanTierLevelEnum,
} from "./resources/plans/entities/plan-tier-level.entity";
import { PlanSubscription } from "./resources/plans/entities/plan-subscription.entity";
import { PlanPayment } from "./resources/plans/entities/plan-payment.entity";

// Load environment from .env.prod
dotenv.config({
  path: path.resolve(__dirname, "..", ".env.prod"),
  override: true,
});

const dataSource = new DataSource({
  type: "postgres",
  port: +process.env.POSTGRES_PORT || 6543,
  username: process.env.POSTGRES_USERNAME || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_NAME || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  entities: [
    Tier,
    TierHistory,
    Plan,
    PlanVariant,
    PlanPrice,
    PlanTierLevel,
    PlanSubscription,
    PlanPayment,
    path.resolve(__dirname, "..") + "/src/**/*.entity{.ts,.js}",
  ],
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log("Connecting to database:", process.env.POSTGRES_HOST);
  await dataSource.initialize();
  console.log("Connected successfully!");

  const queryRunner = dataSource.createQueryRunner();

  try {
    console.log("Clearing existing plans and tiers...");

    // Clear existing data — wrap each in exception handlers since tables may not exist yet
    for (const sql of [
      `DELETE FROM "tier_history"`,
      `DELETE FROM "plan_prices"`,
      `DELETE FROM "plan_variants"`,
      `DELETE FROM "plans"`,
      `DELETE FROM "tier"`,
    ]) {
      await queryRunner.query(`
        DO $$ BEGIN
          ${sql};
        EXCEPTION WHEN undefined_table THEN
          -- table doesn't exist yet, skip
        END $$;
      `);
    }

    console.log("Ensuring PlanTierLevels exist...");
    const tierLevelRepo = dataSource.getRepository(PlanTierLevel);
    const existingLevels = await tierLevelRepo.find();

    let standardLvl = existingLevels.find(
      (l) => l.name === PlanTierLevelEnum.STANDARD,
    );
    if (!standardLvl) {
      standardLvl = await tierLevelRepo.save({
        name: PlanTierLevelEnum.STANDARD,
        sortOrder: 1,
        durationDays: 90,
        isCalendarYear: false,
      });
    }

    let proLvl = existingLevels.find((l) => l.name === PlanTierLevelEnum.PRO);
    if (!proLvl) {
      proLvl = await tierLevelRepo.save({
        name: PlanTierLevelEnum.PRO,
        sortOrder: 2,
        durationDays: 180,
        isCalendarYear: false,
      });
    }

    let proPlusLvl = existingLevels.find(
      (l) => l.name === PlanTierLevelEnum.PRO_PLUS,
    );
    if (!proPlusLvl) {
      proPlusLvl = await tierLevelRepo.save({
        name: PlanTierLevelEnum.PRO_PLUS,
        sortOrder: 3,
        durationDays: null,
        isCalendarYear: true,
      });
    }

    console.log("Seeding 3 new production plans...");

    const tierRepo = dataSource.getRepository(Tier);
    const planRepo = dataSource.getRepository(Plan);
    const variantRepo = dataSource.getRepository(PlanVariant);
    const priceRepo = dataSource.getRepository(PlanPrice);

    // 1. Starter Plan
    const starterTier = await tierRepo.save({
      name: "Starter Plan",
      description:
        "Essential digital loyalty and QR stamp card system for local merchants.",
      is_default: true,
      type: TierType.STANDARD,
      status: TierStatus.PUBLISHED,
      color_code: "#3B82F6",
      monthly_price: 29.0,
      quarterly_price: 79.0,
      annual_price: 290.0,
      features: [
        "Up to 3 Active Campaigns",
        "Digital Stamp Cards & QR Scans",
        "Standard Points Engine",
        "Basic Customer Analytics",
        "Email Support",
      ],
      qrCodeCount: 5,
      configuration: {
        quotas: {
          maxActiveCampaigns: 3,
          maxActiveRewards: 5,
          maxRewardsPerCampaign: 2,
          monthlyPointsAllowance: 1000,
          monthlyStampsAllowance: 500,
          maxTeamMembers: 2,
          maxGiftCardTemplates: 2,
          maxCouponTemplates: 3,
        },
        featureFlags: {
          canCreateCampaignFromScratch: true,
          canEditAdminTemplates: false,
          hasAccessToAdvancedAnalytics: false,
          hasAccessToCRM: false,
          canUpdateReward: true,
          priorityInSearch: false,
          allowCustomBranding: false,
        },
      } as any,
    });

    const starterPlan = await planRepo.save({
      name: "Starter Plan",
      slug: "starter-plan",
      description:
        "Essential digital loyalty and QR stamp card system for local merchants.",
      isActive: true,
    });

    const starterVariant = await variantRepo.save({
      plan: starterPlan,
      tierLevel: standardLvl,
      configuration: starterTier.configuration,
      features: starterTier.features,
    });

    await priceRepo.save({
      planVariantId: starterVariant.id,
      amount: 29.0,
      currency: "GBP",
      isActive: true,
      effectiveFrom: new Date(),
    });

    console.log("✓ Seeded Starter Plan (ID:", starterTier.id, ")");

    // 2. Growth Plan
    const growthTier = await tierRepo.save({
      name: "Growth Plan",
      description:
        "Advanced loyalty, custom rewards, CRM tools, and deeper analytics for growing businesses.",
      is_default: false,
      type: TierType.STANDARD,
      status: TierStatus.PUBLISHED,
      color_code: "#8B5CF6",
      monthly_price: 59.0,
      quarterly_price: 159.0,
      annual_price: 590.0,
      features: [
        "Up to 10 Active Campaigns",
        "Custom Loyalty Stamps, Gift Cards & Coupons",
        "Advanced Analytics & CRM Dashboard",
        "Matching Points & Cashback Engine",
        "Priority Support",
      ],
      qrCodeCount: 15,
      configuration: {
        quotas: {
          maxActiveCampaigns: 10,
          maxActiveRewards: 20,
          maxRewardsPerCampaign: 5,
          monthlyPointsAllowance: 5000,
          monthlyStampsAllowance: 2500,
          maxTeamMembers: 5,
          maxGiftCardTemplates: 10,
          maxCouponTemplates: 10,
        },
        featureFlags: {
          canCreateCampaignFromScratch: true,
          canEditAdminTemplates: true,
          hasAccessToAdvancedAnalytics: true,
          hasAccessToCRM: true,
          canUpdateReward: true,
          priorityInSearch: true,
          allowCustomBranding: true,
        },
      } as any,
    });

    const growthPlan = await planRepo.save({
      name: "Growth Plan",
      slug: "growth-plan",
      description:
        "Advanced loyalty, custom rewards, CRM tools, and deeper analytics for growing businesses.",
      isActive: true,
    });

    const growthVariant = await variantRepo.save({
      plan: growthPlan,
      tierLevel: proLvl,
      configuration: growthTier.configuration,
      features: growthTier.features,
    });

    await priceRepo.save({
      planVariantId: growthVariant.id,
      amount: 59.0,
      currency: "GBP",
      isActive: true,
      effectiveFrom: new Date(),
    });

    console.log("✓ Seeded Growth Plan (ID:", growthTier.id, ")");

    // 3. Enterprise Plan
    const enterpriseTier = await tierRepo.save({
      name: "Enterprise Plan",
      description:
        "Unlimited campaigns, full CRM, multi-location support, and dedicated account manager.",
      is_default: false,
      type: TierType.STANDARD,
      status: TierStatus.PUBLISHED,
      color_code: "#EC4899",
      monthly_price: 129.0,
      quarterly_price: 349.0,
      annual_price: 1290.0,
      features: [
        "Unlimited Active Campaigns & Rewards",
        "Full Multi-Tier Progression & Vault Access",
        "Enterprise CRM & Marketing Circle Integration",
        "Custom Storefront & Plaque Branding",
        "24/7 Dedicated Account Manager",
      ],
      qrCodeCount: 50,
      configuration: {
        quotas: {
          maxActiveCampaigns: -1,
          maxActiveRewards: -1,
          maxRewardsPerCampaign: -1,
          monthlyPointsAllowance: 25000,
          monthlyStampsAllowance: 15000,
          maxTeamMembers: 20,
          maxGiftCardTemplates: 50,
          maxCouponTemplates: 50,
        },
        featureFlags: {
          canCreateCampaignFromScratch: true,
          canEditAdminTemplates: true,
          hasAccessToAdvancedAnalytics: true,
          hasAccessToCRM: true,
          canUpdateReward: true,
          priorityInSearch: true,
          allowCustomBranding: true,
        },
      } as any,
    });

    const enterprisePlan = await planRepo.save({
      name: "Enterprise Plan",
      slug: "enterprise-plan",
      description:
        "Unlimited campaigns, full CRM, multi-location support, and dedicated account manager.",
      isActive: true,
    });

    const enterpriseVariant = await variantRepo.save({
      plan: enterprisePlan,
      tierLevel: proPlusLvl,
      configuration: enterpriseTier.configuration,
      features: enterpriseTier.features,
    });

    await priceRepo.save({
      planVariantId: enterpriseVariant.id,
      amount: 129.0,
      currency: "GBP",
      isActive: true,
      effectiveFrom: new Date(),
    });

    console.log("✓ Seeded Enterprise Plan (ID:", enterpriseTier.id, ")");

    console.log("\n==========================================");
    console.log("All 3 plans successfully created in DB!");
    console.log("==========================================");
  } catch (error) {
    console.error("Error during plan seeding:", error);
  } finally {
    await dataSource.destroy();
    console.log("Database connection closed.");
  }
}

run().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
