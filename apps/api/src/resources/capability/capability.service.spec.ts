import { ForbiddenException } from "@nestjs/common";
import { CapabilityService, ActionType } from "./capability.service";

type CreateOptions = {
  subscriptions?: any[];
  accessPass?: any | null;
};

function createService(options: CreateOptions = {}) {
  const planSubscriptionService = {
    findActiveSubscriptions: jest
      .fn()
      .mockResolvedValue(options.subscriptions ?? []),
  };
  const campaignService = {
    countActiveCampaigns: jest.fn().mockResolvedValue(0),
    countRewards: jest.fn().mockResolvedValue(0),
  };
  const rewardsService = {
    countActiveBusinessRewards: jest.fn().mockResolvedValue(0),
  };
  const businessService = {
    findById: jest.fn().mockResolvedValue({ isSuperBusiness: false }),
  };
  const accessPassService = {
    findActiveForBusiness: jest
      .fn()
      .mockResolvedValue(options.accessPass ?? null),
  };

  const service = new CapabilityService(
    planSubscriptionService as any,
    campaignService as any,
    rewardsService as any,
    {} as any,
    { count: jest.fn() } as any,
    businessService as any,
    accessPassService as any,
  );

  return { service };
}

const planWithConfig = (configuration: any) => ({
  plan_type: "monthly",
  planVariant: { configuration },
});

describe("CapabilityService access pass entitlements", () => {
  it("denies when neither a plan nor an access pass is active", async () => {
    const { service } = createService();
    await expect(
      service.checkPermission("business-1", ActionType.ACCESS_CRM),
    ).rejects.toThrow("Active plan subscription required.");
  });

  it("enforces feature flags from an access pass when there is no plan", async () => {
    const { service } = createService({
      accessPass: {
        configuration: { featureFlags: { hasAccessToCRM: false } },
      },
    });

    await expect(
      service.checkPermission("business-1", ActionType.ACCESS_CRM),
    ).rejects.toThrow(ForbiddenException);
  });

  it("lets access pass values fill gaps in the plan configuration", async () => {
    const { service } = createService({
      subscriptions: [
        planWithConfig({
          quotas: { maxActiveCampaigns: 5 },
          featureFlags: {},
        }),
      ],
      accessPass: {
        configuration: { featureFlags: { hasAccessToCRM: false } },
      },
    });

    // The plan does not define hasAccessToCRM, so the pass value applies.
    await expect(
      service.checkPermission("business-1", ActionType.ACCESS_CRM),
    ).rejects.toThrow(ForbiddenException);
  });

  it("lets explicit plan values win over access pass values", async () => {
    const { service } = createService({
      subscriptions: [
        planWithConfig({
          quotas: { maxActiveCampaigns: 5 },
          featureFlags: { hasAccessToCRM: true },
        }),
      ],
      accessPass: {
        configuration: { featureFlags: { hasAccessToCRM: false } },
      },
    });

    await expect(
      service.checkPermission("business-1", ActionType.ACCESS_CRM),
    ).resolves.toBeUndefined();
  });
});

describe("CapabilityService reward quotas", () => {
  it("treats -1 as unlimited when checking the reward count", () => {
    const { service } = createService();
    const config: any = { quotas: { maxRewardsPerCampaign: -1 } };

    expect(() =>
      (service as any).checkRewardCountLimit(50, config),
    ).not.toThrow();
  });

  it("still enforces a finite reward count limit", () => {
    const { service } = createService();
    const config: any = { quotas: { maxRewardsPerCampaign: 2 } };

    expect(() => (service as any).checkRewardCountLimit(3, config)).toThrow(
      ForbiddenException,
    );
  });

  it("treats -1 as unlimited when checking existing rewards", async () => {
    const { service } = createService();
    const config: any = { quotas: { maxRewardsPerCampaign: -1 } };

    await expect(
      (service as any).checkRewardLimit("campaign-1", config),
    ).resolves.toBeUndefined();
  });
});
