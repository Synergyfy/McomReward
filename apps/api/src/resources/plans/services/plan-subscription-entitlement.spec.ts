import { PlanSubscriptionService } from "./plan-subscription.service";
import type { PlatformEntitlement } from "../../sso/interfaces/entitlement.interface";

function baseEntitlement(
  overrides: Partial<PlatformEntitlement> = {},
): PlatformEntitlement {
  return {
    version: "2026-10-01",
    targetPlatform: {
      clientId: "mcom-rewards",
      platformSlug: "rewards",
      name: "MCOM Rewards",
    },
    access: {
      hasAccess: true,
      accessType: "PAID_MEMBERSHIP",
      upgradeUrl: "https://central.test/dashboard/memberships",
    },
    plan: {
      planId: "rewards-plus",
      planName: "Merchant Plus",
      source: "membership",
      status: "active",
      expiresAt: null,
      quotas: {},
      limits: {},
      features: [],
    },
    membershipContext: {
      membershipPlanName: "Gold",
      membershipLevel: "Gold",
      membershipStatus: "active",
      isIncludedInMembership: true,
    },
    trialContext: {
      isInTrial: false,
      hasPaidVerificationFee: true,
      trialExpiresAt: null,
      daysRemaining: 0,
      programmeTasks: [],
    },
    ...overrides,
  };
}

function setup(
  options: {
    existing?: any[];
    subscription?: any;
    plan?: any;
    variant?: any;
  } = {},
) {
  const subscriptions = options.existing ?? [];

  const subscriptionRepository = {
    find: jest.fn(async () => subscriptions),
    findOne: jest.fn(async () => options.subscription ?? null),
    create: jest.fn((values: any) => ({ id: "created-sub", ...values })),
    save: jest.fn(async (value: any) => value),
  };
  const defaultPlan = {
    id: "plan-db-1",
    name: "Merchant Plus",
    variants: [
      {
        id: "variant-1",
        prices: [{ id: "price-1", isActive: true }],
        tierLevel: { id: "tier-1", name: "STANDARD" },
      },
    ],
  };
  const planRepository = {
    findOne: jest.fn(async () => options.plan ?? defaultPlan),
    find: jest.fn(async () => []),
  };
  const planVariantRepository = {
    findOne: jest.fn(async () => options.variant ?? null),
  };

  const service = new PlanSubscriptionService(
    subscriptionRepository as any,
    {} as any,
    planVariantRepository as any,
    planRepository as any,
    {} as any,
    {} as any,
    { get: jest.fn() } as any,
  );

  return {
    service,
    subscriptionRepository,
    planRepository,
    planVariantRepository,
  };
}

describe("PlanSubscriptionService.syncFromEntitlement", () => {
  it("does not create a plan subscription for a Central access pass", async () => {
    const centralSubscription = {
      id: "sub-1",
      status: "active",
      isActive: true,
    };
    const { service, subscriptionRepository, planRepository } = setup({
      existing: [centralSubscription],
    });

    const entitlement = baseEntitlement({
      access: {
        hasAccess: true,
        accessType: "DIRECT_PACKAGE",
        upgradeUrl: "https://central.test/dashboard/memberships",
      },
      plan: {
        planId: "mall-7day-pass",
        planName: "7-Day Mall Pass",
        source: "direct",
        status: "active",
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        quotas: {},
        limits: {},
        features: [],
      },
    });

    const result = await service.syncFromEntitlement("business-1", entitlement);

    expect(result).toBeNull();
    expect(planRepository.findOne).not.toHaveBeenCalled();
    expect(subscriptionRepository.create).not.toHaveBeenCalled();
    // Only central-sourced records are expired.
    expect(subscriptionRepository.save).toHaveBeenCalledWith([
      centralSubscription,
    ]);
    expect(centralSubscription.status).toBe("expired");
    expect(centralSubscription.isActive).toBe(false);
  });

  it("resolves the membership plan by our catalogue plan id", async () => {
    const { service, subscriptionRepository, planRepository } = setup();

    const result = await service.syncFromEntitlement(
      "business-1",
      baseEntitlement(),
    );

    expect(planRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "rewards-plus" } }),
    );

    const values = subscriptionRepository.create.mock.calls[0][0] as any;
    expect(values.planVariantId).toBe("variant-1");
    expect(values.transaction_id).toBe(
      "CENTRAL-ENTITLEMENT-PAID_MEMBERSHIP-rewards-plus",
    );
    expect(values.is_trial).toBe(false);
    expect(result).not.toBeNull();
  });

  it("denies trial access when Central reports TRIAL_NO_TASKS", async () => {
    const { service, subscriptionRepository, planRepository } = setup();

    const entitlement = baseEntitlement({
      access: {
        hasAccess: false,
        accessType: "NONE",
        reason: "TRIAL_NO_TASKS",
        upgradeUrl: "https://central.test/admin/programme",
      },
      plan: null,
      trialContext: {
        isInTrial: true,
        hasPaidVerificationFee: true,
        trialExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        daysRemaining: 7,
        programmeTasks: [],
      },
    });

    const result = await service.syncFromEntitlement("business-1", entitlement);

    expect(result).toBeNull();
    expect(planRepository.findOne).not.toHaveBeenCalled();
    expect(subscriptionRepository.create).not.toHaveBeenCalled();
  });

  it("grants a trial window when Central allows the trial", async () => {
    const { service, subscriptionRepository } = setup();
    const trialExpiresAt = new Date(Date.now() + 14 * 86400000).toISOString();

    const entitlement = baseEntitlement({
      access: {
        hasAccess: true,
        accessType: "TRIAL_PROGRAMME",
        upgradeUrl: "https://central.test/dashboard/memberships",
      },
      plan: {
        planId: "trial_rewards",
        planName: "Programme Trial Access",
        source: "trial",
        status: "trial",
        expiresAt: trialExpiresAt,
        quotas: { trialAccess: true },
        limits: {},
        features: [],
      },
      trialContext: {
        isInTrial: true,
        hasPaidVerificationFee: true,
        trialExpiresAt,
        daysRemaining: 14,
        programmeTasks: [],
      },
    });

    const result = await service.syncFromEntitlement("business-1", entitlement);

    const values = subscriptionRepository.create.mock.calls[0][0] as any;
    expect(values.is_trial).toBe(true);
    expect(values.expires_at).toEqual(new Date(trialExpiresAt));
    expect(result).not.toBeNull();
  });

  it("maps a Central plan family + tier name to our plan variant", async () => {
    const goldPlan = {
      id: "plan-gold",
      name: "Gold",
      variants: [
        {
          id: "variant-gold-standard",
          prices: [{ id: "price-standard", isActive: true }],
          tierLevel: { id: "tier-standard", name: "STANDARD" },
        },
        {
          id: "variant-gold-pro",
          prices: [{ id: "price-pro", isActive: true }],
          tierLevel: { id: "tier-pro", name: "PRO" },
        },
      ],
    };
    const { service, subscriptionRepository } = setup({ plan: goldPlan });

    const entitlement = baseEntitlement({
      plan: {
        planId: "gold",
        planName: "Gold Pro",
        source: "membership",
        status: "active",
        expiresAt: null,
        quotas: {},
        limits: {},
        features: [],
      },
    });

    await service.syncFromEntitlement("business-1", entitlement);

    const values = subscriptionRepository.create.mock.calls[0][0] as any;
    expect(values.planVariantId).toBe("variant-gold-pro");
  });

  it("maps a Central plan id that is one of our plan-variant ids", async () => {
    const variantPro = {
      id: "11111111-1111-1111-1111-111111111111",
      plan: { id: "plan-gold", name: "Gold" },
      tierLevel: { id: "tier-pro", name: "PRO" },
      prices: [{ id: "price-pro", isActive: true }],
    };
    const { service, subscriptionRepository } = setup({ variant: variantPro });

    const entitlement = baseEntitlement({
      plan: {
        planId: "11111111-1111-1111-1111-111111111111",
        planName: "Gold Pro",
        source: "membership",
        status: "active",
        expiresAt: null,
        quotas: {},
        limits: {},
        features: [],
      },
    });

    await service.syncFromEntitlement("business-1", entitlement);

    const values = subscriptionRepository.create.mock.calls[0][0] as any;
    expect(values.planVariantId).toBe(variantPro.id);
  });
});
