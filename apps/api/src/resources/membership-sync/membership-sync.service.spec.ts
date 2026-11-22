import { MembershipSyncService } from "./membership-sync.service";

describe("MembershipSyncService", () => {
  let service: MembershipSyncService;
  let businessRepository: any;
  let accessPassPlanRepository: any;
  let processedEventRepository: any;
  let planSubscriptionService: any;
  let entitlementSyncService: any;
  let mcomCentralService: any;
  let configService: any;

  const business: any = {
    id: "biz-1",
    mcomUserId: "usr_1",
    hasPaidVerificationFee: false,
    trialTasks: [],
  };

  const variant: any = {
    id: "variant-1",
    features: ["Loyalty dashboard"],
    plan: { name: "Gold" },
    tierLevel: { name: "PRO" },
  };

  beforeEach(() => {
    businessRepository = {
      findOne: jest.fn().mockResolvedValue(business),
      save: jest.fn().mockResolvedValue(business),
    };
    accessPassPlanRepository = { findOne: jest.fn() };
    processedEventRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      insert: jest.fn().mockResolvedValue({}),
    };
    planSubscriptionService = { resolveEntitlementVariant: jest.fn() };
    entitlementSyncService = { apply: jest.fn().mockResolvedValue(undefined) };
    mcomCentralService = {
      getIntrospectionEntitlementByUserId: jest.fn().mockResolvedValue(null),
    };
    configService = {
      get: jest.fn((key: string) => {
        if (key === "MCOM_CENTRAL_WEB_URL") return "https://central.test";
        return undefined;
      }),
    };

    service = new MembershipSyncService(
      businessRepository,
      accessPassPlanRepository,
      processedEventRepository,
      planSubscriptionService,
      entitlementSyncService,
      mcomCentralService,
      configService,
    );
  });

  const activeEvent = () => ({
    eventId: "evt-1",
    userId: "usr_1",
    businessId: "biz_central",
    membership: {
      planId: "plan_gold",
      planName: "Gold",
      tier: "Pro",
      level: "Gold",
      status: "active",
      expiresAt: "2027-11-22T00:00:00.000Z",
    },
    package: {
      packageName: "Gold Pro",
      externalPlanId: "gold",
      status: "active",
      limits: { listings: 500 },
    },
  });

  it("provisions the matching plan variant until the membership expiry", async () => {
    planSubscriptionService.resolveEntitlementVariant.mockResolvedValue(
      variant,
    );

    const result = await service.handleMembershipUpdated(activeEvent());

    expect(result.processed).toBe(true);
    expect(
      planSubscriptionService.resolveEntitlementVariant,
    ).toHaveBeenCalledWith("gold", "Gold Pro");
    expect(entitlementSyncService.apply).toHaveBeenCalledTimes(1);

    const [businessId, entitlement] =
      entitlementSyncService.apply.mock.calls[0];
    expect(businessId).toBe("biz-1");
    expect(entitlement.access.hasAccess).toBe(true);
    expect(entitlement.access.accessType).toBe("PAID_MEMBERSHIP");
    expect(entitlement.plan.planId).toBe("variant-1");
    expect(entitlement.plan.expiresAt).toBe("2027-11-22T00:00:00.000Z");
    expect(entitlement.plan.limits).toEqual({ listings: 500 });
    expect(processedEventRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: "evt-1" }),
    );
  });

  it("falls back to an access pass when the bundled plan is not a subscription", async () => {
    planSubscriptionService.resolveEntitlementVariant.mockResolvedValue(null);
    accessPassPlanRepository.findOne.mockResolvedValue({
      id: "pass-1",
      slug: "gold-pass",
      name: "Gold Pass",
      features: ["Priority support"],
    });

    const result = await service.handleMembershipUpdated(activeEvent());

    expect(result.processed).toBe(true);
    const [, entitlement] = entitlementSyncService.apply.mock.calls[0];
    expect(entitlement.access.accessType).toBe("DIRECT_PACKAGE");
    expect(entitlement.plan.planId).toBe("gold-pass");
  });

  it("revokes Central-provisioned access when the membership is cancelled", async () => {
    const event = activeEvent();
    event.membership.status = "cancelled";

    const result = await service.handleMembershipUpdated(event);

    expect(result.processed).toBe(true);
    const [, entitlement] = entitlementSyncService.apply.mock.calls[0];
    expect(entitlement.access.hasAccess).toBe(false);
    expect(entitlement.access.accessType).toBe("NONE");
    expect(
      planSubscriptionService.resolveEntitlementVariant,
    ).not.toHaveBeenCalled();
  });

  it("treats an elapsed expiry as a revocation even when status says active", async () => {
    const event = activeEvent();
    event.membership.expiresAt = "2020-01-01T00:00:00.000Z";

    const result = await service.handleMembershipUpdated(event);

    expect(result.reason).toBe("EXPIRED");
    const [, entitlement] = entitlementSyncService.apply.mock.calls[0];
    expect(entitlement.access.hasAccess).toBe(false);
  });

  it("is idempotent for a repeated event id", async () => {
    processedEventRepository.findOne.mockResolvedValue({ id: "processed-1" });

    const result = await service.handleMembershipUpdated(activeEvent());

    expect(result).toEqual({ processed: false, duplicate: true });
    expect(entitlementSyncService.apply).not.toHaveBeenCalled();
    expect(processedEventRepository.insert).not.toHaveBeenCalled();
  });

  it("does not grant an arbitrary plan when nothing matches, and asks Central", async () => {
    planSubscriptionService.resolveEntitlementVariant.mockResolvedValue(null);
    accessPassPlanRepository.findOne.mockResolvedValue(null);

    const result = await service.handleMembershipUpdated(activeEvent());

    expect(result.processed).toBe(false);
    expect(result.reason).toBe("PLAN_NOT_MATCHED");
    expect(
      mcomCentralService.getIntrospectionEntitlementByUserId,
    ).toHaveBeenCalledWith("usr_1");
    expect(entitlementSyncService.apply).not.toHaveBeenCalled();
  });
});
