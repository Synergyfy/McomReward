/**
 * Reseed prod DB plans — clears plans/plan_variants/plan_prices, inserts 3 new ones.
 * Uses raw pg client with .env.prod credentials. No TypeORM entity loading.
 * Run: pnpm ts-node -r tsconfig-paths/register src/reseed-plans-prod.ts
 */
import { Client } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({
  path: path.resolve(__dirname, "..", ".env.prod"),
  override: true,
});

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: +(process.env.POSTGRES_PORT || 6543),
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_NAME,
  ssl: { rejectUnauthorized: false },
});

async function upsertTierLevel(
  name: string,
  sortOrder: number,
  durationDays: number | null,
  isCalendarYear: boolean,
): Promise<string> {
  const existing = await client.query(
    `SELECT id FROM plan_tier_levels WHERE name = $1`,
    [name],
  );
  if (existing.rows.length) return existing.rows[0].id as string;
  const res = await client.query(
    `INSERT INTO plan_tier_levels (id, name, "sortOrder", "durationDays", "isCalendarYear", created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, now(), now()) RETURNING id`,
    [name, sortOrder, durationDays, isCalendarYear],
  );
  return res.rows[0].id as string;
}

async function createPlan(data: {
  name: string;
  slug: string;
  description: string;
  tierLevelId: string;
  monthlyPrice: number;
  features: string[];
  configuration: object;
}): Promise<string> {
  const planRes = await client.query(
    `INSERT INTO plans (id, name, slug, description, "isActive", created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, true, now(), now()) RETURNING id`,
    [data.name, data.slug, data.description],
  );
  const planId = planRes.rows[0].id as string;

  const varRes = await client.query(
    `INSERT INTO plan_variants (id, plan_id, tier_level_id, features, configuration, "isActive", created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, true, now(), now()) RETURNING id`,
    [
      planId,
      data.tierLevelId,
      JSON.stringify(data.features),
      JSON.stringify(data.configuration),
    ],
  );
  const variantId = varRes.rows[0].id as string;

  await client.query(
    `INSERT INTO plan_prices (id, plan_variant_id, amount, currency, "isActive", "effectiveFrom", created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, 'GBP', true, now(), now(), now())`,
    [variantId, data.monthlyPrice],
  );

  return planId;
}

async function run() {
  console.log(`Connecting to ${process.env.POSTGRES_HOST}...`);
  await client.connect();
  await client.query(`SET search_path TO public`);
  console.log("Connected!\n");

  try {
    // Show current state
    const before = await client.query(`SELECT name FROM plans ORDER BY name`);
    console.log(
      `Existing plans (${before.rows.length}):`,
      before.rows.map((r) => r.name).join(", ") || "none",
    );

    // Clear (FK order: prices → variants → plans)
    console.log("\nClearing...");
    await client
      .query(
        `UPDATE membership SET plan_variant_id = NULL WHERE plan_variant_id IS NOT NULL`,
      )
      .catch(() => {});
    await client.query(`DELETE FROM plan_prices`);
    await client.query(`DELETE FROM plan_variants`);
    await client.query(`DELETE FROM plans`);
    console.log("✓ Cleared\n");

    // Tier levels
    const stdId = await upsertTierLevel("STANDARD", 1, 90, false);
    const proId = await upsertTierLevel("PRO", 2, 180, false);
    const ppId = await upsertTierLevel("PRO_PLUS", 3, null, true);

    // Seed 3 plans
    const starterId = await createPlan({
      name: "Starter Plan",
      slug: "starter-plan",
      description:
        "Essential digital loyalty and QR stamp card system for local merchants.",
      tierLevelId: stdId,
      monthlyPrice: 29,
      features: [
        "Up to 3 Active Campaigns",
        "Digital Stamp Cards & QR Scans",
        "Standard Points Engine",
        "Basic Customer Analytics",
        "Email Support",
      ],
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
      },
    });
    console.log(`  ✓ Starter Plan    £29/mo  (ID: ${starterId})`);

    const growthId = await createPlan({
      name: "Growth Plan",
      slug: "growth-plan",
      description:
        "Advanced loyalty, custom rewards, CRM tools, and deeper analytics for growing businesses.",
      tierLevelId: proId,
      monthlyPrice: 59,
      features: [
        "Up to 10 Active Campaigns",
        "Custom Loyalty Stamps, Gift Cards & Coupons",
        "Advanced Analytics & CRM Dashboard",
        "Matching Points & Cashback Engine",
        "Priority Support",
      ],
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
      },
    });
    console.log(`  ✓ Growth Plan     £59/mo  (ID: ${growthId})`);

    const enterpriseId = await createPlan({
      name: "Enterprise Plan",
      slug: "enterprise-plan",
      description:
        "Unlimited campaigns, full CRM, multi-location support, and dedicated account manager.",
      tierLevelId: ppId,
      monthlyPrice: 129,
      features: [
        "Unlimited Active Campaigns & Rewards",
        "Full Multi-Tier Progression & Vault Access",
        "Enterprise CRM & Marketing Circle Integration",
        "Custom Storefront & Plaque Branding",
        "24/7 Dedicated Account Manager",
      ],
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
      },
    });
    console.log(`  ✓ Enterprise Plan £129/mo (ID: ${enterpriseId})`);

    // Verify
    const after = await client.query(
      `SELECT p.name, pp.amount, p."isActive"
       FROM plans p
       JOIN plan_variants pv ON pv.plan_id = p.id
       JOIN plan_prices pp ON pp.plan_variant_id = pv.id
       ORDER BY pp.amount`,
    );
    console.log("\n══════════════════════════════════════");
    console.log("  Plans seeded in prod DB:");
    after.rows.forEach((r) =>
      console.log(`  • ${r.name.padEnd(18)} £${r.amount}/mo`),
    );
    console.log("══════════════════════════════════════\n");
  } catch (err: any) {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
