import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { RewardIssuanceService } from "./reward-issuance.service";
import { RewardType } from "../../rewards/enums/reward-type.enum";
import { RewardStatus } from "../../rewards/enums/reward-status.enum";
import { RewardSource } from "../../rewards/enums/reward-source.enum";
import {
  PartnerRewardEvent,
  RewardIssuanceStatus,
} from "../enums/partner-reward.enums";

const baseReward = (overrides: Record<string, any> = {}) => ({
  id: "reward-1",
  title: "Amazon eGift Card",
  description: "Digital gift card",
  reward_type: RewardType.GIFT_CARD,
  disabled: false,
  status: RewardStatus.ACTIVE,
  value: 50,
  max_points: 500,
  quantity: 100,
  expiry_datetime: null,
  ...overrides,
});

const buildStockQb = (consumed = 0) => {
  const qb: any = {};
  qb.select = jest.fn(() => qb);
  qb.where = jest.fn(() => qb);
  qb.andWhere = jest.fn(() => qb);
  qb.getRawOne = jest.fn(async () => ({ consumed: String(consumed) }));
  return qb;
};

describe("RewardIssuanceService", () => {
  let issuanceRepo: any;
  let rewardRepo: any;
  let businessRewardRepo: any;
  let recipientResolver: any;
  let pointsGateway: any;
  let mallIntegration: any;
  let partnerEntitlement: any;
  let notifier: any;
  let dataSource: any;
  let service: RewardIssuanceService;

  beforeEach(() => {
    issuanceRepo = {
      findOne: jest.fn(),
      create: jest.fn((entity: any) => ({ ...entity })),
      save: jest.fn(async (entity: any) => {
        if (!entity.id) entity.id = "issuance-1";
        entity.created_at = entity.created_at ?? new Date();
        entity.updated_at = new Date();
        return entity;
      }),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(() => buildStockQb()),
    };
    rewardRepo = {
      findOne: jest.fn(),
    };
    businessRewardRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => {
        const qb: any = {};
        qb.update = jest.fn(() => qb);
        qb.set = jest.fn(() => qb);
        qb.where = jest.fn(() => qb);
        qb.andWhere = jest.fn(() => qb);
        qb.setParameter = jest.fn(() => qb);
        qb.execute = jest.fn(async () => ({ affected: 1 }));
        return qb;
      }),
    };
    recipientResolver = {
      resolve: jest.fn().mockResolvedValue({
        userId: "user-1",
        userType: "Business",
        email: "donor@example.com",
        name: "Donor",
      }),
      // Default: echo back the local identity the caller logged in with.
      resolveIdentity: jest.fn(async ({ userId, email }: any) => ({
        userId,
        mcomUserId: undefined,
        email: email?.toLowerCase().trim(),
      })),
    };
    pointsGateway = { awardPoints: jest.fn() };
    mallIntegration = {
      createVoucher: jest.fn(),
      createGiftCard: jest.fn(),
      createCoupon: jest.fn(),
    };
    partnerEntitlement = {
      assertBusinessEntitled: jest.fn().mockResolvedValue({
        source: "local_subscription",
        accessType: "PAID_MEMBERSHIP",
        isTrial: false,
        planName: "Pro",
        membershipIncluded: false,
        expiresAt: null,
      }),
    };
    notifier = { notify: jest.fn() };
    dataSource = {
      transaction: jest.fn(async (cb: any) =>
        cb({ getRepository: () => issuanceRepo }),
      ),
    };

    service = new RewardIssuanceService(
      issuanceRepo,
      rewardRepo,
      businessRewardRepo,
      recipientResolver,
      pointsGateway,
      mallIntegration,
      partnerEntitlement,
      notifier,
      dataSource,
    );
  });

  const issueDto = {
    business: { email: "shop@example.com" },
    recipient: { email: "Donor@Example.com" },
    idempotencyKey: "key-1",
    externalRef: "campaign-9",
  };

  it("returns the existing issuance for a replayed idempotency key", async () => {
    rewardRepo.findOne.mockResolvedValue(baseReward());
    issuanceRepo.findOne.mockResolvedValue({
      id: "existing",
      issuer_client_id: "fundordonate",
      idempotency_key: "key-1",
      value: 50,
      reward: { id: "reward-1" },
    });

    const result = await service.issue(
      "fundordonate",
      "reward-1",
      issueDto as any,
    );

    expect(result.id).toBe("existing");
    expect(issuanceRepo.save).not.toHaveBeenCalled();
    expect(notifier.notify).not.toHaveBeenCalled();
  });

  it("issues a gift card, mints a code and dispatches reward.issued", async () => {
    rewardRepo.findOne.mockResolvedValue(baseReward());
    issuanceRepo.findOne.mockResolvedValue(null);
    mallIntegration.createGiftCard.mockResolvedValue({ id: "mall-123" });

    const result = await service.issue(
      "fundordonate",
      "reward-1",
      issueDto as any,
    );

    expect(result.code).toMatch(/^MCOM-/);
    expect(result.mallReference).toBe("mall-123");
    expect(result.recipient.email).toBe("donor@example.com");
    expect(notifier.notify).toHaveBeenCalledWith(
      "fundordonate",
      PartnerRewardEvent.ISSUED,
      expect.objectContaining({ id: "issuance-1" }),
    );
  });

  it("credits points for a POINT_OFFER reward", async () => {
    rewardRepo.findOne.mockResolvedValue(
      baseReward({ reward_type: RewardType.POINT_OFFER, value: 100 }),
    );
    issuanceRepo.findOne.mockResolvedValue(null);
    recipientResolver.resolve.mockResolvedValue({
      userId: "participant-1",
      userType: "Participant",
      email: "donor@example.com",
    });
    pointsGateway.awardPoints.mockResolvedValue({ awarded: true, points: 100 });

    const result = await service.issue(
      "fundordonate",
      "reward-1",
      issueDto as any,
    );

    expect(pointsGateway.awardPoints).toHaveBeenCalledWith(
      expect.objectContaining({ participantId: "participant-1", points: 100 }),
    );
    expect(result.pointsAwarded).toBe(100);
  });

  it("rejects a POINT_OFFER reward when the recipient is not a participant", async () => {
    rewardRepo.findOne.mockResolvedValue(
      baseReward({ reward_type: RewardType.POINT_OFFER, value: 100 }),
    );
    issuanceRepo.findOne.mockResolvedValue(null);
    recipientResolver.resolve.mockResolvedValue({
      userId: "business-1",
      userType: "Business",
      email: "donor@example.com",
    });

    await expect(
      service.issue("fundordonate", "reward-1", issueDto as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects issuing a disabled or inactive reward", async () => {
    rewardRepo.findOne.mockResolvedValue(baseReward({ disabled: true }));
    await expect(
      service.issue("fundordonate", "reward-1", issueDto as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws 404 for an unknown reward", async () => {
    rewardRepo.findOne.mockResolvedValue(null);
    await expect(
      service.issue("fundordonate", "nope", issueDto as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("redeems an issued reward and dispatches reward.redeemed", async () => {
    issuanceRepo.findOne.mockResolvedValue({
      id: "issuance-1",
      issuer_client_id: "fundordonate",
      status: RewardIssuanceStatus.ISSUED,
      code: "MCOM-ABC",
      value: 50,
      reward: { id: "reward-1" },
    });

    const result = await service.redeem("fundordonate", "issuance-1", {
      code: "MCOM-ABC",
    } as any);

    expect(result.status).toBe(RewardIssuanceStatus.REDEEMED);
    expect(result.redeemedAt).toBeInstanceOf(Date);
    expect(notifier.notify).toHaveBeenCalledWith(
      "fundordonate",
      PartnerRewardEvent.REDEEMED,
      expect.any(Object),
    );
  });

  it("refuses to redeem an already redeemed issuance", async () => {
    issuanceRepo.findOne.mockResolvedValue({
      id: "issuance-1",
      issuer_client_id: "fundordonate",
      status: RewardIssuanceStatus.REDEEMED,
      reward: { id: "reward-1" },
    });

    await expect(
      service.redeem("fundordonate", "issuance-1", {} as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("revokes an issued reward and dispatches reward.revoked", async () => {
    issuanceRepo.findOne.mockResolvedValue({
      id: "issuance-1",
      issuer_client_id: "fundordonate",
      status: RewardIssuanceStatus.ISSUED,
      value: 50,
      reward: { id: "reward-1" },
    });

    const result = await service.revoke("fundordonate", "issuance-1", {
      reason: "fraud",
    } as any);

    expect(result.status).toBe(RewardIssuanceStatus.REVOKED);
    expect(notifier.notify).toHaveBeenCalledWith(
      "fundordonate",
      PartnerRewardEvent.REVOKED,
      expect.any(Object),
    );
  });

  it("expires due issuances and dispatches reward.expired", async () => {
    const qb: any = {};
    qb.where = jest.fn(() => qb);
    qb.andWhere = jest.fn(() => qb);
    qb.take = jest.fn(() => qb);
    qb.getMany = jest.fn().mockResolvedValue([
      {
        id: "issuance-1",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.ISSUED,
        value: 50,
        reward: { id: "reward-1" },
      },
    ]);
    issuanceRepo.createQueryBuilder.mockReturnValue(qb);

    const count = await service.expireDue();

    expect(count).toBe(1);
    expect(notifier.notify).toHaveBeenCalledWith(
      "fundordonate",
      PartnerRewardEvent.EXPIRED,
      expect.any(Object),
    );
  });

  describe("business entitlement", () => {
    it("blocks issuance when the sponsoring business is not entitled", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward());
      issuanceRepo.findOne.mockResolvedValue(null);
      partnerEntitlement.assertBusinessEntitled.mockRejectedValue(
        new ForbiddenException({ code: "BUSINESS_NOT_ENTITLED" }),
      );

      await expect(
        service.issue("fundordonate", "reward-1", issueDto as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(issuanceRepo.save).not.toHaveBeenCalled();
    });

    it("records the entitlement snapshot in the issuance metadata", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward());
      issuanceRepo.findOne.mockResolvedValue(null);
      mallIntegration.createGiftCard.mockResolvedValue({ id: "mall-1" });

      const result = await service.issue(
        "fundordonate",
        "reward-1",
        issueDto as any,
      );

      expect(partnerEntitlement.assertBusinessEntitled).toHaveBeenCalledWith(
        issueDto.business,
      );
      expect(result.metadata.business.email).toBe("shop@example.com");
      expect(result.metadata.entitlement.source).toBe("local_subscription");
    });

    it("does not re-check entitlement on an idempotent replay", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward());
      issuanceRepo.findOne.mockResolvedValue({
        id: "existing",
        issuer_client_id: "fundordonate",
        idempotency_key: "key-1",
        value: 50,
        reward: { id: "reward-1" },
      });

      await service.issue("fundordonate", "reward-1", issueDto as any);

      expect(partnerEntitlement.assertBusinessEntitled).not.toHaveBeenCalled();
    });
  });

  describe("end-user isolation (delegated tokens)", () => {
    const delegated = (over: Record<string, any> = {}): any => ({
      callerAppId: "fundordonate",
      isDelegated: true,
      userId: "user-me",
      email: "me@example.com",
      scopes: ["rewards:read"],
      payload: {},
      ...over,
    });

    const appToken = (): any => ({
      callerAppId: "fundordonate",
      isDelegated: false,
      scopes: ["rewards:read"],
      payload: {},
    });

    it("blocks a delegated user from reading another user's issuance", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        recipient_email: "someone-else@example.com",
        recipient_mcom_user_id: "user-other",
        value: 5,
        reward: { id: "reward-1" },
      });

      await expect(
        service.findOne("fundordonate", "i1", delegated()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("allows a delegated user to read their own issuance (email match)", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        recipient_email: "Me@Example.com",
        value: 5,
        reward: { id: "reward-1" },
      });

      await expect(
        service.findOne("fundordonate", "i1", delegated()),
      ).resolves.toMatchObject({ id: "i1" });
    });

    it("allows a delegated user to read their own issuance (mcomUserId match)", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        recipient_email: "irrelevant@example.com",
        recipient_mcom_user_id: "user-me",
        value: 5,
        reward: { id: "reward-1" },
      });

      await expect(
        service.findOne("fundordonate", "i1", delegated({ email: undefined })),
      ).resolves.toMatchObject({ id: "i1" });
    });

    it("blocks a delegated user from redeeming another user's issuance", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.ISSUED,
        recipient_email: "someone-else@example.com",
        value: 5,
        reward: { id: "reward-1" },
      });

      await expect(
        service.redeem("fundordonate", "i1", {} as any, delegated()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("still lets an app-level token read any of its own issuances", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        recipient_email: "anyone@example.com",
        value: 5,
        reward: { id: "reward-1" },
      });

      await expect(
        service.findOne("fundordonate", "i1", appToken()),
      ).resolves.toMatchObject({ id: "i1" });
    });

    it("requires a delegated token for GET /me", async () => {
      await expect(
        service.listMine("fundordonate", appToken(), {
          page: 1,
          limit: 20,
        } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("filters the list to the delegated user's own issuances", async () => {
      const qb: any = {};
      qb.leftJoinAndSelect = jest.fn(() => qb);
      qb.where = jest.fn(() => qb);
      qb.andWhere = jest.fn(() => qb);
      qb.orderBy = jest.fn(() => qb);
      qb.skip = jest.fn(() => qb);
      qb.take = jest.fn(() => qb);
      qb.getManyAndCount = jest
        .fn()
        .mockResolvedValue([
          [{ id: "i1", value: 5, reward: { id: "reward-1" } }],
          1,
        ]);
      issuanceRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.listMine("fundordonate", delegated(), {
        page: 1,
        limit: 20,
      } as any);

      expect(result.total).toBe(1);
      // Two filters: revoked-hiding + the delegated recipient-scope bracket.
      expect(qb.andWhere).toHaveBeenCalledTimes(2);
      expect(qb.andWhere).toHaveBeenCalledWith(
        "issuance.status != :revoked",
        expect.objectContaining({ revoked: RewardIssuanceStatus.REVOKED }),
      );
    });

    it("allows a delegated user to issue a reward to themselves (email match)", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward());
      issuanceRepo.findOne.mockResolvedValue(null);
      mallIntegration.createGiftCard.mockResolvedValue({ id: "mall-1" });

      const result = await service.issue(
        "fundordonate",
        "reward-1",
        {
          business: { email: "shop@example.com" },
          recipient: { email: "Me@Example.com" },
          idempotencyKey: "self-1",
        } as any,
        delegated(),
      );

      expect(result.id).toBeTruthy();
      expect(result.recipient.email).toBe("me@example.com");
    });

    it("allows a delegated user to issue by matching mcomUserId", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward());
      issuanceRepo.findOne.mockResolvedValue(null);
      mallIntegration.createGiftCard.mockResolvedValue({ id: "mall-1" });

      const result = await service.issue(
        "fundordonate",
        "reward-1",
        {
          business: { email: "shop@example.com" },
          recipient: { email: "whatever@example.com", mcomUserId: "user-me" },
          idempotencyKey: "self-2",
        } as any,
        delegated({ email: undefined }),
      );

      expect(result.id).toBeTruthy();
    });

    it("blocks a delegated user from issuing a reward to someone else", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward());

      await expect(
        service.issue(
          "fundordonate",
          "reward-1",
          {
            business: { email: "shop@example.com" },
            recipient: { email: "someone-else@example.com" },
            idempotencyKey: "other-1",
          } as any,
          delegated(),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(issuanceRepo.save).not.toHaveBeenCalled();
    });

    it("still lets an app-level token issue to any recipient", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward());
      issuanceRepo.findOne.mockResolvedValue(null);
      mallIntegration.createGiftCard.mockResolvedValue({ id: "mall-1" });

      const result = await service.issue(
        "fundordonate",
        "reward-1",
        {
          business: { email: "shop@example.com" },
          recipient: { email: "anyone@example.com" },
          idempotencyKey: "app-1",
        } as any,
        appToken(),
      );

      expect(result.id).toBeTruthy();
    });
  });

  describe("first-party participant surface", () => {
    const user = { id: "participant-1", email: "Me@Example.com" };

    it("lists a user's own rewards across all issuers", async () => {
      const qb: any = {};
      qb.leftJoinAndSelect = jest.fn(() => qb);
      qb.where = jest.fn(() => qb);
      qb.andWhere = jest.fn(() => qb);
      qb.orderBy = jest.fn(() => qb);
      qb.skip = jest.fn(() => qb);
      qb.take = jest.fn(() => qb);
      qb.getManyAndCount = jest.fn().mockResolvedValue([
        [
          {
            id: "i1",
            issuer_client_id: "fundordonate",
            recipient_email: "me@example.com",
            value: 5,
            reward: { id: "reward-1" },
          },
        ],
        1,
      ]);
      issuanceRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.listForUser(user, {
        page: 1,
        limit: 20,
      } as any);

      expect(result.total).toBe(1);
      expect(result.data[0]).toMatchObject({ id: "i1" });
      // Recipient-identity scoping is always applied.
      expect(qb.andWhere).toHaveBeenCalledTimes(1);
      // Revoked rewards are always hidden from the participant dashboard.
      expect(qb.where).toHaveBeenCalledWith(
        "issuance.status != :revoked",
        expect.objectContaining({ revoked: RewardIssuanceStatus.REVOKED }),
      );
    });

    it("claims a reward issued to the logged-in user and notifies the issuer", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "issuance-1",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.ISSUED,
        recipient_email: "me@example.com",
        recipient_user_id: "participant-1",
        code: "MCOM-ABC",
        value: 50,
        reward: { id: "reward-1" },
      });

      const result = await service.claimForUser(user, "issuance-1", {
        code: "MCOM-ABC",
      } as any);

      expect(result.status).toBe(RewardIssuanceStatus.REDEEMED);
      expect(notifier.notify).toHaveBeenCalledWith(
        "fundordonate",
        PartnerRewardEvent.REDEEMED,
        expect.any(Object),
      );
    });

    it("fails closed (404) when claiming someone else's reward", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "issuance-1",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.ISSUED,
        recipient_email: "someone-else@example.com",
        recipient_user_id: "participant-999",
        value: 50,
        reward: { id: "reward-1" },
      });

      await expect(
        service.claimForUser(user, "issuance-1", {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(notifier.notify).not.toHaveBeenCalled();
    });

    it("claims a reward stored against the user's central MCOM id (cross-app identity)", async () => {
      // The reward was issued on a partner app (FundOrDonate) against the
      // central user id only — the local id and email differ.
      recipientResolver.resolveIdentity.mockResolvedValueOnce({
        userId: "business-1",
        mcomUserId: "central-1",
        email: "owner@example.com",
      });
      issuanceRepo.findOne.mockResolvedValue({
        id: "issuance-2",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.ISSUED,
        recipient_email: "different-donor@example.com",
        recipient_mcom_user_id: "central-1",
        recipient_user_id: null,
        code: null,
        value: 20,
        reward: null,
      });

      const result = await service.claimForUser(
        { id: "business-1", email: "owner@example.com" },
        "issuance-2",
        {} as any,
      );

      expect(result.status).toBe(RewardIssuanceStatus.REDEEMED);
      expect(notifier.notify).toHaveBeenCalledWith(
        "fundordonate",
        PartnerRewardEvent.REDEEMED,
        expect.any(Object),
      );
    });
  });

  describe("maximum unit cap", () => {
    it("blocks issuing once the cap is reached", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward({ quantity: 3 }));
      issuanceRepo.findOne.mockResolvedValue(null);
      const stockQb = buildStockQb(3);
      issuanceRepo.createQueryBuilder.mockReturnValue(stockQb);

      await expect(
        service.issue("fundordonate", "reward-1", issueDto as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(issuanceRepo.save).not.toHaveBeenCalled();
      // The cap counts every issuance regardless of status — no status filter.
      expect(stockQb.andWhere).not.toHaveBeenCalled();
    });

    it("blocks an issuance that would overshoot the remaining units", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward({ quantity: 5 }));
      issuanceRepo.findOne.mockResolvedValue(null);
      issuanceRepo.createQueryBuilder.mockReturnValue(buildStockQb(4));

      await expect(
        service.issue("fundordonate", "reward-1", {
          ...issueDto,
          quantity: 2,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("allows issuing while units remain", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward({ quantity: 3 }));
      issuanceRepo.findOne.mockResolvedValue(null);
      issuanceRepo.createQueryBuilder.mockReturnValue(buildStockQb(1));
      mallIntegration.createGiftCard.mockResolvedValue({ id: "mall-1" });

      const result = await service.issue(
        "fundordonate",
        "reward-1",
        issueDto as any,
      );

      expect(result.id).toBeTruthy();
    });

    it("treats quantity 0 as unlimited (no cap query)", async () => {
      rewardRepo.findOne.mockResolvedValue(baseReward({ quantity: 0 }));
      issuanceRepo.findOne.mockResolvedValue(null);
      mallIntegration.createGiftCard.mockResolvedValue({ id: "mall-1" });

      const result = await service.issue(
        "fundordonate",
        "reward-1",
        issueDto as any,
      );

      expect(result.id).toBeTruthy();
      expect(issuanceRepo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe("revocation guards", () => {
    it("refuses to revoke a reward the recipient already used", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.REDEEMED,
        reward: { id: "reward-1" },
      });

      await expect(
        service.revoke("fundordonate", "i1", {} as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(notifier.notify).not.toHaveBeenCalled();
    });

    it("refuses to revoke a point reward (points already credited)", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.ISSUED,
        reward_type: RewardType.POINT_OFFER,
        reward: { id: "reward-1" },
      });

      await expect(
        service.revoke("fundordonate", "i1", {} as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(notifier.notify).not.toHaveBeenCalled();
    });

    it("revokes an unused reward and notifies the issuer", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.ISSUED,
        reward_type: RewardType.VOUCHER,
        reward: { id: "reward-1" },
      });

      const result = await service.revoke("fundordonate", "i1", {
        reason: "requested by donor",
      } as any);

      expect(result.status).toBe(RewardIssuanceStatus.REVOKED);
      expect(result.metadata.revokeReason).toBe("requested by donor");
      expect(notifier.notify).toHaveBeenCalledWith(
        "fundordonate",
        PartnerRewardEvent.REVOKED,
        expect.any(Object),
      );
    });
  });

  describe("platform-sponsored gift", () => {
    const giftDto = {
      recipient: { email: "Donor@Example.com", mcomUserId: "6f2c" },
      idempotencyKey: "gift-1",
      externalRef: "qualification-9",
    };

    const participant = {
      userId: "participant-1",
      userType: "Participant",
      email: "donor@example.com",
      name: "Donor",
    };

    it("gifts an MCOM catalogue reward to an MCOM participant without a business sponsor", async () => {
      rewardRepo.findOne.mockResolvedValue(
        baseReward({ reward_source: RewardSource.MCOM_VAULT }),
      );
      issuanceRepo.findOne.mockResolvedValue(null);
      recipientResolver.resolve.mockResolvedValue(participant);
      mallIntegration.createGiftCard.mockResolvedValue({ id: "mall-1" });

      const result = await service.gift(
        "fundordonate",
        "reward-1",
        giftDto as any,
      );

      expect(result.id).toBeTruthy();
      expect(result.recipient.userType).toBe("Participant");
      // Platform gifts are not business-sponsored, so no entitlement check runs.
      expect(partnerEntitlement.assertBusinessEntitled).not.toHaveBeenCalled();
      expect(result.metadata.sponsor).toMatchObject({
        type: "platform",
        app: "fundordonate",
      });
      expect(notifier.notify).toHaveBeenCalledWith(
        "fundordonate",
        PartnerRewardEvent.ISSUED,
        expect.any(Object),
      );
    });

    it("rejects gifting a non-MCOM (business/partner) catalogue reward", async () => {
      rewardRepo.findOne.mockResolvedValue(
        baseReward({ reward_source: RewardSource.BUSINESS }),
      );

      await expect(
        service.gift("fundordonate", "reward-1", giftDto as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(issuanceRepo.save).not.toHaveBeenCalled();
    });

    it("requires the recipient to resolve to an MCOM participant", async () => {
      rewardRepo.findOne.mockResolvedValue(
        baseReward({ reward_source: RewardSource.MCOM_VAULT }),
      );
      issuanceRepo.findOne.mockResolvedValue(null);
      recipientResolver.resolve.mockResolvedValue(null);

      await expect(
        service.gift("fundordonate", "reward-1", giftDto as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(issuanceRepo.save).not.toHaveBeenCalled();
    });

    it("returns the existing issuance for a replayed gift idempotency key", async () => {
      rewardRepo.findOne.mockResolvedValue(
        baseReward({ reward_source: RewardSource.MCOM_VAULT }),
      );
      issuanceRepo.findOne.mockResolvedValue({
        id: "existing",
        issuer_client_id: "fundordonate",
        idempotency_key: "gift-1",
        value: 50,
        reward: { id: "reward-1" },
      });

      const result = await service.gift(
        "fundordonate",
        "reward-1",
        giftDto as any,
      );

      expect(result.id).toBe("existing");
      expect(issuanceRepo.save).not.toHaveBeenCalled();
    });

    it("enforces the catalogue unit cap for gifts", async () => {
      rewardRepo.findOne.mockResolvedValue(
        baseReward({ reward_source: RewardSource.MCOM_VAULT, quantity: 2 }),
      );
      issuanceRepo.findOne.mockResolvedValue(null);
      recipientResolver.resolve.mockResolvedValue(participant);
      issuanceRepo.createQueryBuilder.mockReturnValue(buildStockQb(2));

      await expect(
        service.gift("fundordonate", "reward-1", giftDto as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(issuanceRepo.save).not.toHaveBeenCalled();
    });

    it("credits points when gifting a POINT_OFFER to a participant", async () => {
      rewardRepo.findOne.mockResolvedValue(
        baseReward({
          reward_source: RewardSource.MCOM_VAULT,
          reward_type: RewardType.POINT_OFFER,
          value: 100,
        }),
      );
      issuanceRepo.findOne.mockResolvedValue(null);
      recipientResolver.resolve.mockResolvedValue(participant);
      pointsGateway.awardPoints.mockResolvedValue({
        awarded: true,
        points: 100,
      });

      const result = await service.gift(
        "fundordonate",
        "reward-1",
        giftDto as any,
      );

      expect(pointsGateway.awardPoints).toHaveBeenCalledWith(
        expect.objectContaining({
          participantId: "participant-1",
          points: 100,
        }),
      );
      expect(result.pointsAwarded).toBe(100);
    });

    it("rejects a disabled platform reward", async () => {
      rewardRepo.findOne.mockResolvedValue(
        baseReward({ reward_source: RewardSource.MCOM_VAULT, disabled: true }),
      );

      await expect(
        service.gift("fundordonate", "reward-1", giftDto as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("business reward issuance", () => {
    const businessReward = {
      id: "br-1",
      title: "Free Coffee",
      description: "At the counter",
      image: "coffee.png",
      reward_type: RewardType.VOUCHER,
      status: "active",
      disabled: false,
      quantity: 50,
      remaining_quantity: 10,
      points_required: 0,
      mall_reward_value: 0,
      reward: null,
      business: { id: "biz-1", mcomUserId: "6f2c", email: "shop@example.com" },
    };

    it("issues a business's own reward and links it to the business reward", async () => {
      businessRewardRepo.findOne.mockResolvedValue(businessReward);
      issuanceRepo.findOne.mockResolvedValue(null);
      mallIntegration.createVoucher.mockResolvedValue({ id: "mall-9" });

      const result = await service.issueBusinessReward("fundordonate", "br-1", {
        recipient: { email: "Donor@Example.com" },
        idempotencyKey: "br-k1",
      } as any);

      expect(result.businessRewardId).toBe("br-1");
      expect(result.rewardTitle).toBe("Free Coffee");
      expect(result.code).toMatch(/^MCOM-/);
      expect(partnerEntitlement.assertBusinessEntitled).toHaveBeenCalledWith({
        mcomUserId: "6f2c",
        email: "shop@example.com",
      });
      expect(notifier.notify).toHaveBeenCalledWith(
        "fundordonate",
        PartnerRewardEvent.ISSUED,
        expect.any(Object),
      );
    });

    it("consumes the business reward's remaining stock", async () => {
      businessRewardRepo.findOne.mockResolvedValue(businessReward);
      issuanceRepo.findOne.mockResolvedValue(null);
      mallIntegration.createVoucher.mockResolvedValue({ id: "mall-9" });

      await service.issueBusinessReward("fundordonate", "br-1", {
        recipient: { email: "donor@example.com" },
      } as any);

      const qb = businessRewardRepo.createQueryBuilder.mock.results[0].value;
      expect(qb.execute).toHaveBeenCalled();
      expect(qb.setParameter).toHaveBeenCalledWith("amt", 1);
    });

    it("rejects issuance when the business reward is out of stock", async () => {
      businessRewardRepo.findOne.mockResolvedValue(businessReward);
      issuanceRepo.findOne.mockResolvedValue(null);
      businessRewardRepo.createQueryBuilder.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      });

      await expect(
        service.issueBusinessReward("fundordonate", "br-1", {
          recipient: { email: "donor@example.com" },
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(issuanceRepo.save).not.toHaveBeenCalled();
    });

    it("rejects a disabled business reward", async () => {
      businessRewardRepo.findOne.mockResolvedValue({
        ...businessReward,
        disabled: true,
      });

      await expect(
        service.issueBusinessReward("fundordonate", "br-1", {
          recipient: { email: "donor@example.com" },
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("returns the existing issuance for a replayed business-reward issue", async () => {
      businessRewardRepo.findOne.mockResolvedValue(businessReward);
      issuanceRepo.findOne.mockResolvedValue({
        id: "existing",
        issuer_client_id: "fundordonate",
        business_reward_id: "br-1",
        idempotency_key: "br-k1",
        value: 0,
        reward: null,
      });

      const result = await service.issueBusinessReward("fundordonate", "br-1", {
        recipient: { email: "donor@example.com" },
        idempotencyKey: "br-k1",
      } as any);

      expect(result.id).toBe("existing");
      expect(issuanceRepo.save).not.toHaveBeenCalled();
      expect(businessRewardRepo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe("business reward revocation", () => {
    it("returns stock to the business reward when an unused gift is revoked", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.ISSUED,
        reward_type: RewardType.VOUCHER,
        business_reward_id: "br-1",
        quantity: 2,
        reward: null,
      });
      businessRewardRepo.findOne.mockResolvedValue({
        id: "br-1",
        remaining_quantity: 8,
      });

      const result = await service.revoke("fundordonate", "i1", {
        reason: "donor cancelled",
      } as any);

      expect(result.status).toBe(RewardIssuanceStatus.REVOKED);
      const qb = businessRewardRepo.createQueryBuilder.mock.results[0].value;
      expect(qb.setParameter).toHaveBeenCalledWith("amt", 2);
      expect(qb.execute).toHaveBeenCalled();
    });

    it("does not touch business stock for catalogue-reward issuances", async () => {
      issuanceRepo.findOne.mockResolvedValue({
        id: "i1",
        issuer_client_id: "fundordonate",
        status: RewardIssuanceStatus.ISSUED,
        reward_type: RewardType.VOUCHER,
        business_reward_id: null,
        quantity: 1,
        reward: { id: "reward-1" },
      });

      await service.revoke("fundordonate", "i1", {} as any);

      expect(businessRewardRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it("returns stock to the business reward when a gift expires", async () => {
      const sweepQb: any = {};
      sweepQb.where = jest.fn(() => sweepQb);
      sweepQb.andWhere = jest.fn(() => sweepQb);
      sweepQb.take = jest.fn(() => sweepQb);
      sweepQb.getMany = jest.fn().mockResolvedValue([
        {
          id: "i1",
          issuer_client_id: "fundordonate",
          status: RewardIssuanceStatus.ISSUED,
          business_reward_id: "br-1",
          quantity: 3,
          reward: null,
        },
      ]);
      issuanceRepo.createQueryBuilder.mockReturnValue(sweepQb);
      businessRewardRepo.findOne.mockResolvedValue({
        id: "br-1",
        remaining_quantity: 5,
      });

      const count = await service.expireDue();

      expect(count).toBe(1);
      const stockQb =
        businessRewardRepo.createQueryBuilder.mock.results[0].value;
      expect(stockQb.setParameter).toHaveBeenCalledWith("amt", 3);
      expect(stockQb.execute).toHaveBeenCalled();
    });
  });
});

describe("RewardIssuanceService — reservation lifecycle & peer access", () => {
  let issuanceRepo: any;
  let service: RewardIssuanceService;
  let notifier: any;

  const makeIssuance = (overrides: Record<string, any> = {}) => ({
    id: "issuance-1",
    issuer_client_id: "fundordonate",
    status: RewardIssuanceStatus.ISSUED,
    reward: { id: "reward-1" },
    metadata: {},
    ...overrides,
  });

  beforeEach(() => {
    issuanceRepo = {
      findOne: jest.fn(),
      save: jest.fn(async (entity: any) => entity),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    notifier = { notify: jest.fn().mockResolvedValue(true) };
    const dataSource: any = {
      transaction: jest.fn(async (cb: any) =>
        cb({ getRepository: () => issuanceRepo }),
      ),
    };
    service = new RewardIssuanceService(
      issuanceRepo,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      notifier,
      dataSource,
    );
  });

  it("reserves an ISSUED issuance and records the order ref", async () => {
    issuanceRepo.findOne.mockResolvedValue(makeIssuance());

    const result = await service.reserve("mcom-mall", "issuance-1", {
      orderRef: "mall-order-1",
      idempotencyKey: "mall-order-1:issuance-1",
    } as any);

    expect(result.status).toBe(RewardIssuanceStatus.RESERVED);
    expect(issuanceRepo.save).toHaveBeenCalled();
    const saved = issuanceRepo.save.mock.calls[0][0];
    expect(saved.reservation_ref).toBe("mall-order-1");
    expect(saved.reserved_at).toBeInstanceOf(Date);
  });

  it("is idempotent on replay for the same orderRef", async () => {
    issuanceRepo.findOne.mockResolvedValue(
      makeIssuance({
        status: RewardIssuanceStatus.RESERVED,
        reservation_ref: "mall-order-1",
      }),
    );

    const result = await service.reserve("mcom-mall", "issuance-1", {
      orderRef: "mall-order-1",
      idempotencyKey: "mall-order-1:issuance-1",
    } as any);

    expect(result.status).toBe(RewardIssuanceStatus.RESERVED);
    expect(issuanceRepo.save).not.toHaveBeenCalled();
  });

  it("rejects reserving an issuance held for a different order (double-spend)", async () => {
    issuanceRepo.findOne.mockResolvedValue(
      makeIssuance({
        status: RewardIssuanceStatus.RESERVED,
        reservation_ref: "mall-order-OTHER",
      }),
    );

    await expect(
      service.reserve("mcom-mall", "issuance-1", {
        orderRef: "mall-order-1",
        idempotencyKey: "mall-order-1:issuance-1",
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("marks an expired issuance EXPIRED and rejects the reservation", async () => {
    issuanceRepo.findOne.mockResolvedValue(
      makeIssuance({ expires_at: new Date(Date.now() - 1000) }),
    );

    await expect(
      service.reserve("mcom-mall", "issuance-1", {
        orderRef: "mall-order-1",
        idempotencyKey: "mall-order-1:issuance-1",
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    const saved = issuanceRepo.save.mock.calls[0][0];
    expect(saved.status).toBe(RewardIssuanceStatus.EXPIRED);
  });

  it("commits a reservation to REDEEMED and emits reward.redeemed", async () => {
    issuanceRepo.findOne.mockResolvedValue(
      makeIssuance({
        status: RewardIssuanceStatus.RESERVED,
        reservation_ref: "mall-order-1",
      }),
    );

    const result = await service.commit("mcom-mall", "issuance-1", {
      orderRef: "mall-order-1",
    } as any);

    expect(result.status).toBe(RewardIssuanceStatus.REDEEMED);
    expect(notifier.notify).toHaveBeenCalledWith(
      "mcom-mall",
      PartnerRewardEvent.REDEEMED,
      expect.objectContaining({ id: "issuance-1" }),
    );
  });

  it("treats a commit on an already-REDEEMED issuance as an idempotent no-op", async () => {
    issuanceRepo.findOne.mockResolvedValue(
      makeIssuance({ status: RewardIssuanceStatus.REDEEMED }),
    );

    const result = await service.commit("mcom-mall", "issuance-1", {} as any);

    expect(result.status).toBe(RewardIssuanceStatus.REDEEMED);
    expect(issuanceRepo.save).not.toHaveBeenCalled();
    expect(notifier.notify).not.toHaveBeenCalled();
  });

  it("releases a reservation back to ISSUED", async () => {
    issuanceRepo.findOne.mockResolvedValue(
      makeIssuance({
        status: RewardIssuanceStatus.RESERVED,
        reservation_ref: "mall-order-1",
        reserved_at: new Date(),
      }),
    );

    const result = await service.release("mcom-mall", "issuance-1", {
      orderRef: "mall-order-1",
      reason: "payment_failed",
    } as any);

    expect(result.status).toBe(RewardIssuanceStatus.ISSUED);
    const saved = issuanceRepo.save.mock.calls[0][0];
    expect(saved.reservation_ref).toBeNull();
    expect(saved.reserved_at).toBeNull();
  });

  it("never releases a REDEEMED issuance", async () => {
    issuanceRepo.findOne.mockResolvedValue(
      makeIssuance({ status: RewardIssuanceStatus.REDEEMED }),
    );

    await expect(
      service.release("mcom-mall", "issuance-1", {
        orderRef: "mall-order-1",
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("lets a permitted peer read an issuance it did not issue", async () => {
    issuanceRepo.findOne.mockResolvedValue(makeIssuance());

    const result = await service.findOne("mcom-mall", "issuance-1", {
      callerAppId: "mcom-mall",
      isDelegated: false,
      scopes: ["rewards:read"],
      payload: {},
    } as any);

    expect(result.id).toBe("issuance-1");
  });

  it("keeps delegated-token isolation (fails closed with 404)", async () => {
    issuanceRepo.findOne.mockResolvedValue(
      makeIssuance({ recipient_email: "owner@example.com" }),
    );

    await expect(
      service.findOne("mcom-mall", "issuance-1", {
        callerAppId: "mcom-mall",
        isDelegated: true,
        userId: "someone-else",
        email: "intruder@example.com",
        scopes: ["rewards:read"],
        payload: {},
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("sweeps stale reservations back to ISSUED", async () => {
    issuanceRepo.find.mockResolvedValue([
      makeIssuance({ status: RewardIssuanceStatus.RESERVED, reserved_at: new Date(0) }),
    ]);

    const released = await service.releaseStaleReservations();

    expect(released).toBe(1);
    const saved = issuanceRepo.save.mock.calls[0][0];
    expect(saved.status).toBe(RewardIssuanceStatus.ISSUED);
    expect(saved.reservation_ref).toBeNull();
  });

  it("refuses to commit an issuance that expired while reserved", async () => {
    issuanceRepo.findOne.mockResolvedValue(
      makeIssuance({
        status: RewardIssuanceStatus.RESERVED,
        reservation_ref: "mall-order-1",
        expires_at: new Date(Date.now() - 1000),
      }),
    );

    await expect(
      service.commit("mcom-mall", "issuance-1", {
        orderRef: "mall-order-1",
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    const saved = issuanceRepo.save.mock.calls[0][0];
    expect(saved.status).toBe(RewardIssuanceStatus.EXPIRED);
  });
});
