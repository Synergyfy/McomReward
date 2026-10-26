import { AccessPassService } from "./access-pass.service";
import { AccessPassSubscriptionStatus } from "./entities/access-pass-subscription.entity";
import type { PlatformEntitlement } from "../sso/interfaces/entitlement.interface";

const future = (days = 7) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

function directPassEntitlement(
  overrides: Partial<PlatformEntitlement["plan"]> = {},
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
      accessType: "DIRECT_PACKAGE",
      upgradeUrl: "https://central.test/dashboard/memberships",
    },
    plan: {
      planId: "mall-7day-pass",
      planName: "7-Day Mall Pass",
      source: "direct",
      status: "active",
      expiresAt: future(7),
      quotas: {},
      limits: {},
      features: [],
      ...overrides,
    },
    membershipContext: {
      membershipPlanName: null,
      membershipLevel: "STANDARD",
      membershipStatus: "none",
      isIncludedInMembership: false,
    },
    trialContext: {
      isInTrial: false,
      hasPaidVerificationFee: false,
      trialExpiresAt: null,
      daysRemaining: 0,
      programmeTasks: [],
    },
  };
}

function setup(options: { plans?: any[]; passes?: any[] } = {}) {
  const plans = options.plans ?? [];
  const passes = options.passes ?? [];

  const planRepository = {
    findOne: jest.fn(async ({ where }: any) => {
      const condition = Array.isArray(where) ? where[0] : where;
      if (!condition) return null;
      if (condition.id) {
        return plans.find((plan) => plan.id === condition.id) ?? null;
      }
      if (condition.slug) {
        return plans.find((plan) => plan.slug === condition.slug) ?? null;
      }
      if (condition.name) {
        const value = condition.name?.value ?? condition.name;
        return (
          plans.find((plan) =>
            String(plan.name).toLowerCase() !== ""
              ? String(plan.name).toLowerCase() === String(value).toLowerCase()
              : false,
          ) ?? null
        );
      }
      return null;
    }),
    create: jest.fn((values: any) => ({ id: "created-plan", ...values })),
    save: jest.fn(async (value: any) => value),
  };

  const subscriptionRepository = {
    find: jest.fn(async () => passes),
    create: jest.fn((values: any) => ({ id: "created-sub", ...values })),
    save: jest.fn(async (value: any) => value),
  };

  const service = new AccessPassService(
    planRepository as any,
    {} as any,
    subscriptionRepository as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );

  return { service, planRepository, subscriptionRepository };
}

const localPlan = {
  id: "plan-1",
  name: "7-Day Mall Pass",
  slug: "mall-7day-pass",
  durationDays: 7,
  features: ["Local feature"],
  configuration: {
    quotas: { maxActiveCampaigns: 3, maxActiveRewards: 2 },
    featureFlags: { hasAccessToCRM: false },
  },
  price: 25,
  currency: "GBP",
};

describe("AccessPassService.syncFromEntitlement", () => {
  it("provisions a local pass from a Central DIRECT_PACKAGE entitlement", async () => {
    const { service, subscriptionRepository } = setup({ plans: [localPlan] });

    const entitlement = directPassEntitlement({
      quotas: { maxActiveCampaigns: 5 },
      limits: { hasAccessToCRM: true },
    });

    const result = await service.syncFromEntitlement("business-1", entitlement);

    expect(subscriptionRepository.create).toHaveBeenCalledTimes(1);
    const values = subscriptionRepository.create.mock.calls[0][0] as any;

    expect(values.planId).toBe("plan-1");
    expect(values.planName).toBe("7-Day Mall Pass");
    expect(values.status).toBe(AccessPassSubscriptionStatus.ACTIVE);
    expect(values.expiresAt).toEqual(new Date(entitlement.plan!.expiresAt!));
    expect(values.transactionId).toBe(
      "CENTRAL-ENTITLEMENT-DIRECT_PACKAGE-mall-7day-pass",
    );
    // Central values override the local catalogue snapshot.
    expect(values.configuration.quotas.maxActiveCampaigns).toBe(5);
    expect(values.configuration.quotas.maxActiveRewards).toBe(2);
    expect(values.configuration.featureFlags.hasAccessToCRM).toBe(true);
    expect(result).not.toBeNull();
  });

  it("revokes central passes when Central grants a membership instead", async () => {
    const centralPass = {
      id: "sub-central",
      transactionId: "CENTRAL-ENTITLEMENT-DIRECT_PACKAGE-mall-7day-pass",
      status: AccessPassSubscriptionStatus.ACTIVE,
      expiresAt: new Date(future(5)),
    };
    const { service, subscriptionRepository } = setup({
      plans: [localPlan],
      passes: [centralPass],
    });

    const entitlement = directPassEntitlement();
    entitlement.access = {
      hasAccess: true,
      accessType: "PAID_MEMBERSHIP",
      upgradeUrl: "https://central.test/dashboard/memberships",
    };
    entitlement.plan = {
      planId: "rewards-plus",
      planName: "Merchant Plus",
      source: "membership",
      status: "active",
      expiresAt: null,
      quotas: {},
      limits: {},
      features: [],
    };

    const result = await service.syncFromEntitlement("business-1", entitlement);

    expect(result).toBeNull();
    expect(subscriptionRepository.create).not.toHaveBeenCalled();
    expect(subscriptionRepository.save).toHaveBeenCalledWith([centralPass]);
    expect(centralPass.status).toBe(AccessPassSubscriptionStatus.EXPIRED);
  });

  it("does not provision an expired pass", async () => {
    const { service, subscriptionRepository } = setup({ plans: [localPlan] });

    const entitlement = directPassEntitlement({
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });

    const result = await service.syncFromEntitlement("business-1", entitlement);

    expect(result).toBeNull();
    expect(subscriptionRepository.create).not.toHaveBeenCalled();
  });

  it("creates a hidden snapshot plan when the catalogue entry is missing", async () => {
    const { service, planRepository, subscriptionRepository } = setup();

    const entitlement = directPassEntitlement({
      planId: "legacy-pass-id",
      planName: "Legacy Pass",
      quotas: { maxActiveCampaigns: 1 },
    });

    const result = await service.syncFromEntitlement("business-1", entitlement);

    expect(planRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Legacy Pass",
        isActive: false,
        purchaseEnabled: false,
        codeRedemptionEnabled: false,
      }),
    );
    expect(subscriptionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ planId: "created-plan" }),
    );
    expect(result).not.toBeNull();
  });

  it("never touches locally purchased passes when there is no Central access", async () => {
    const { service, subscriptionRepository } = setup({
      plans: [localPlan],
      passes: [],
    });

    const entitlement = directPassEntitlement();
    entitlement.access = {
      hasAccess: false,
      accessType: "NONE",
      reason: "NO_ACTIVE_ENTITLEMENT",
      upgradeUrl: "https://central.test/dashboard/memberships",
    };
    entitlement.plan = null;

    await service.syncFromEntitlement("business-1", entitlement);

    expect(subscriptionRepository.create).not.toHaveBeenCalled();
    expect(subscriptionRepository.save).not.toHaveBeenCalled();
  });
});
