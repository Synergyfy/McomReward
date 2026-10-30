import { RewardFulfilmentService } from "./reward-fulfilment.service";
import {
  FulfilmentKind,
  FulfilmentProvider,
  FulfilmentStatus,
} from "./reward-fulfilment.enums";
import { RewardIssuanceStatus } from "../partner-rewards/enums/partner-reward.enums";

describe("RewardFulfilmentService", () => {
  let service: RewardFulfilmentService;
  let issuanceRepository: any;
  let rewardRepository: any;
  let businessRewardRepository: any;
  let outboxRepository: any;
  let mall: any;
  let central: any;
  let config: any;

  const baseIssuance = (overrides: Record<string, any> = {}): any => ({
    id: "issuance-1",
    issuer_client_id: "mcom-rewards",
    business_reward_id: "br-1",
    recipient_email: "jane@example.com",
    recipient_name: "Jane",
    recipient_mcom_user_id: "central-user-1",
    code: "MCOM-CODE1",
    status: RewardIssuanceStatus.ISSUED,
    value: 30,
    quantity: 1,
    metadata: {},
    fulfilment_status: FulfilmentStatus.PENDING,
    fulfilment_attempts: 0,
    ...overrides,
  });

  const businessReward = (overrides: Record<string, any> = {}) => ({
    id: "br-1",
    is_mall_integrated: false,
    mall_reward_value: 0,
    mall_reward_type: null,
    fulfilment_provider: FulfilmentProvider.MALL,
    fulfilment_kind: FulfilmentKind.MALL_GIFT_CARD,
    fulfilment_config: {
      value: { amount: 30 },
      templateRef: { system: "MALL", id: "template-1" },
      businessId: "mall-biz-1",
      scope: { mode: "ITEMS", productIds: ["prod-1"] },
    },
    fulfilment_template_id: "template-1",
    fulfilment_business_ref: "mall-biz-1",
    fulfilment_funding_source: "BUSINESS_WALLET",
    business: { id: "biz-1", name: "Acme Ltd", mcomUserId: "central-user-1" },
    ...overrides,
  });

  beforeEach(() => {
    issuanceRepository = {
      findOne: jest.fn(),
      save: jest.fn(async (value: any) => value),
      findAndCount: jest.fn(),
    };
    rewardRepository = { findOne: jest.fn() };
    businessRewardRepository = { findOne: jest.fn() };
    outboxRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value: any) => value),
      save: jest.fn(async (value: any) => value),
      find: jest.fn().mockResolvedValue([]),
    };
    mall = {
      createGiftCard: jest.fn(),
      createVoucher: jest.fn(),
      createCoupon: jest.fn(),
      revokeInstrument: jest.fn(),
      getMallFrontendUrl: jest.fn().mockReturnValue("https://mall.test"),
    };
    central = {
      grantMembership: jest.fn(),
      issueAccessPassCode: jest.fn(),
      createCoupon: jest.fn(),
      revokeGrant: jest.fn(),
      revokeCoupon: jest.fn(),
      resolveRecipient: jest.fn(),
    };
    config = { get: jest.fn().mockReturnValue(undefined) };

    service = new RewardFulfilmentService(
      issuanceRepository,
      rewardRepository,
      businessRewardRepository,
      outboxRepository,
      mall,
      central,
      config,
    );
  });

  it("delivers a Mall gift card with template, scope and issuance id", async () => {
    const issuance = baseIssuance();
    issuanceRepository.findOne.mockResolvedValue(issuance);
    businessRewardRepository.findOne.mockResolvedValue(businessReward());
    mall.createGiftCard.mockResolvedValue({
      type: "gift_card",
      id: "gc-1",
      code: "MCOM-CODE1",
      status: "active",
    });

    const result = await service.fulfil(issuance);

    expect(mall.createGiftCard).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 30,
        issuanceId: "issuance-1",
        templateId: "template-1",
        businessId: "mall-biz-1",
        scope: { mode: "ITEMS", productIds: ["prod-1"] },
      }),
    );
    expect(result.fulfilment_status).toBe(FulfilmentStatus.DELIVERED);
    expect(result.fulfilment_ref).toBe("gc-1");
    expect(result.fulfilment_code).toBe("MCOM-CODE1");
  });

  it("grants a Central membership and stores the grant reference", async () => {
    const issuance = baseIssuance({
      business_reward_id: null,
      reward: {
        id: "reward-1",
        reward_type: "Voucher",
        fulfilment_provider: FulfilmentProvider.CENTRAL,
        fulfilment_kind: FulfilmentKind.CENTRAL_MEMBERSHIP,
        fulfilment_config: {
          grant: { planId: "plan-1", tier: "Pro", durationDays: 365 },
        },
      },
    });
    issuanceRepository.findOne.mockResolvedValue(issuance);
    central.grantMembership.mockResolvedValue({
      grantId: "grant-1",
      businessId: "biz-1",
      planId: "plan-1",
      planName: "Gold",
      tier: "Pro",
      startsAt: "2026-10-30T00:00:00.000Z",
      expiresAt: "2027-10-30T00:00:00.000Z",
      replayed: false,
      recipientMcomUserId: "central-user-1",
    });

    const result = await service.fulfil(issuance);

    expect(central.grantMembership).toHaveBeenCalledWith(
      expect.objectContaining({
        issuanceId: "issuance-1",
        recipientMcomUserId: "central-user-1",
        planId: "plan-1",
        tier: "Pro",
        durationDays: 365,
      }),
    );
    expect(result.fulfilment_status).toBe(FulfilmentStatus.DELIVERED);
    expect(result.fulfilment_ref).toBe("grant-1");
    expect(result.code).toBeNull();
  });

  it("does not call the provider again when already delivered", async () => {
    const issuance = baseIssuance({
      fulfilment_status: FulfilmentStatus.DELIVERED,
      fulfilment_code: "MCOM-CODE1",
      fulfilment_ref: "gc-1",
    });
    issuanceRepository.findOne.mockResolvedValue(issuance);

    await service.fulfil(issuance);

    expect(mall.createGiftCard).not.toHaveBeenCalled();
    expect(businessRewardRepository.findOne).not.toHaveBeenCalled();
  });

  it("marks a failed delivery and enqueues a retry", async () => {
    const issuance = baseIssuance();
    issuanceRepository.findOne.mockResolvedValue(issuance);
    businessRewardRepository.findOne.mockResolvedValue(businessReward());
    mall.createGiftCard.mockRejectedValue(new Error("mall unavailable"));

    const result = await service.fulfil(issuance);

    expect(result.fulfilment_status).toBe(FulfilmentStatus.FAILED);
    expect(result.fulfilment_error).toContain("mall unavailable");
    expect(outboxRepository.save).toHaveBeenCalled();
  });

  it("marks a missing Central identity as pending identity", async () => {
    const issuance = baseIssuance({
      business_reward_id: null,
      recipient_mcom_user_id: null,
      reward: {
        id: "reward-1",
        reward_type: "Voucher",
        fulfilment_provider: FulfilmentProvider.CENTRAL,
        fulfilment_kind: FulfilmentKind.CENTRAL_MEMBERSHIP,
        fulfilment_config: { grant: { planId: "plan-1" } },
      },
    });
    issuanceRepository.findOne.mockResolvedValue(issuance);
    central.resolveRecipient.mockResolvedValue(null);

    const result = await service.fulfil(issuance);

    expect(result.fulfilment_status).toBe(FulfilmentStatus.PENDING_IDENTITY);
    expect(central.grantMembership).not.toHaveBeenCalled();
  });
});
