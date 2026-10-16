import { ForbiddenException } from "@nestjs/common";
import { PartnerEntitlementService } from "./partner-entitlement.service";

describe("PartnerEntitlementService", () => {
  let businessRepo: any;
  let planSubscriptionService: any;
  let mcomCentralService: any;
  let service: PartnerEntitlementService;

  beforeEach(() => {
    businessRepo = { findOne: jest.fn().mockResolvedValue(null) };
    planSubscriptionService = { findActiveSubscription: jest.fn() };
    mcomCentralService = { introspectEntitlementByUserIdStrict: jest.fn() };
    service = new PartnerEntitlementService(
      businessRepo,
      planSubscriptionService,
      mcomCentralService,
    );
  });

  const identity = { mcomUserId: "biz-1", email: "shop@example.com" };
  const central = (data: any) =>
    mcomCentralService.introspectEntitlementByUserIdStrict.mockResolvedValue({
      found: true,
      data,
    });

  it("allows when a local active subscription exists", async () => {
    businessRepo.findOne.mockResolvedValue({
      id: "biz-1",
      mcomUserId: "biz-1",
    });
    planSubscriptionService.findActiveSubscription.mockResolvedValue({
      is_trial: false,
      expires_at: new Date(Date.now() + 86400000),
      planVariant: { plan: { name: "Pro" } },
    });

    const snapshot = await service.assertBusinessEntitled(identity);

    expect(snapshot.source).toBe("local_subscription");
    expect(snapshot.planName).toBe("Pro");
    expect(
      mcomCentralService.introspectEntitlementByUserIdStrict,
    ).not.toHaveBeenCalled();
  });

  it("allows an active local trial", async () => {
    businessRepo.findOne.mockResolvedValue({ id: "biz-1" });
    planSubscriptionService.findActiveSubscription.mockResolvedValue({
      is_trial: true,
      expires_at: new Date(Date.now() + 86400000),
      planVariant: null,
    });

    const snapshot = await service.assertBusinessEntitled(identity);

    expect(snapshot.source).toBe("local_subscription");
    expect(snapshot.isTrial).toBe(true);
    expect(snapshot.accessType).toBe("TRIAL_PROGRAMME");
  });

  it("allows when MCOM Rewards is included in the MCOM membership (central hasAccess)", async () => {
    central({
      entitlement: {
        access: { hasAccess: true, accessType: "PAID_MEMBERSHIP" },
        plan: { planName: "MCOM Pro Bundle", expiresAt: null },
        membershipContext: { isIncludedInMembership: true },
        trialContext: { isInTrial: false },
      },
    });

    const snapshot = await service.assertBusinessEntitled(identity);

    expect(snapshot.source).toBe("central_entitlement");
    expect(snapshot.membershipIncluded).toBe(true);
  });

  it("allows an active central trial even when Central withheld access", async () => {
    central({
      entitlement: {
        access: { hasAccess: false, accessType: "NONE" },
        plan: null,
        membershipContext: { isIncludedInMembership: false },
        trialContext: {
          isInTrial: true,
          trialExpiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
        },
      },
    });

    const snapshot = await service.assertBusinessEntitled(identity);

    expect(snapshot.source).toBe("central_trial");
    expect(snapshot.isTrial).toBe(true);
  });

  it("allows via the Central business-profile trial expiry", async () => {
    central({
      entitlement: {
        access: { hasAccess: false, accessType: "NONE" },
        membershipContext: { isIncludedInMembership: false },
        trialContext: { isInTrial: false, trialExpiresAt: null },
      },
      user: {
        businessProfile: {
          trialAccessExpiresAt: new Date(
            Date.now() + 3 * 86400000,
          ).toISOString(),
        },
      },
    });

    const snapshot = await service.assertBusinessEntitled(identity);

    expect(snapshot.source).toBe("central_trial_profile");
  });

  it("denies (NOT_ENTITLED) when Central confirms no access", async () => {
    central({
      entitlement: {
        access: { hasAccess: false, accessType: "NONE" },
        membershipContext: { isIncludedInMembership: false },
        trialContext: { isInTrial: false, trialExpiresAt: null },
      },
    });

    try {
      await service.assertBusinessEntitled(identity);
      fail("expected rejection");
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenException);
      expect((err as ForbiddenException).getResponse()).toMatchObject({
        code: "BUSINESS_NOT_ENTITLED",
      });
    }
  });

  it("denies (NOT_ENTITLED) when the business is unknown to Central", async () => {
    mcomCentralService.introspectEntitlementByUserIdStrict.mockResolvedValue({
      found: false,
      data: null,
    });

    try {
      await service.assertBusinessEntitled(identity);
      fail("expected rejection");
    } catch (err) {
      expect((err as ForbiddenException).getResponse()).toMatchObject({
        code: "BUSINESS_NOT_ENTITLED",
      });
    }
  });

  it("denies (ENTITLEMENT_UNAVAILABLE) when Central is down and there is no local sub", async () => {
    mcomCentralService.introspectEntitlementByUserIdStrict.mockRejectedValue(
      new Error("ECONNREFUSED"),
    );

    try {
      await service.assertBusinessEntitled(identity);
      fail("expected rejection");
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenException);
      expect((err as ForbiddenException).getResponse()).toMatchObject({
        code: "ENTITLEMENT_UNAVAILABLE",
      });
    }
  });

  it("allows a local subscription even when Central is down", async () => {
    businessRepo.findOne.mockResolvedValue({ id: "biz-1" });
    planSubscriptionService.findActiveSubscription.mockResolvedValue({
      is_trial: false,
      expires_at: new Date(Date.now() + 86400000),
      planVariant: null,
    });
    mcomCentralService.introspectEntitlementByUserIdStrict.mockRejectedValue(
      new Error("ECONNREFUSED"),
    );

    const snapshot = await service.assertBusinessEntitled(identity);
    expect(snapshot.source).toBe("local_subscription");
  });

  it("caches allow results to avoid repeated Central lookups", async () => {
    central({
      entitlement: {
        access: { hasAccess: true, accessType: "PAID_MEMBERSHIP" },
        membershipContext: { isIncludedInMembership: false },
        trialContext: { isInTrial: false },
      },
    });

    await service.assertBusinessEntitled(identity);
    await service.assertBusinessEntitled(identity);

    expect(
      mcomCentralService.introspectEntitlementByUserIdStrict,
    ).toHaveBeenCalledTimes(1);
  });
});
