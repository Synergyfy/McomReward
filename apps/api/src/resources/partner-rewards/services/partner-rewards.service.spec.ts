import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PartnerRewardsService } from "./partner-rewards.service";
import { RewardType } from "../../rewards/enums/reward-type.enum";

const rewardEntity = {
  id: "reward-1",
  title: "Amazon eGift Card",
  description: "Digital gift card",
  image: "img.png",
  gallery: [],
  reward_type: RewardType.GIFT_CARD,
  reward_source: "mcom vault",
  audience: "all business",
  status: "active",
  value: 50,
  max_points: 500,
  max_stamps_required: null,
  is_points_enabled: true,
  is_stamps_enabled: false,
  quantity: 100,
  expiry_datetime: null,
  updated_at: new Date(),
};

const businessRewardEntity = {
  id: "br-1",
  title: "Free Coffee",
  description: "A free coffee at the counter",
  image: "coffee.png",
  gallery: [],
  reward_type: RewardType.VOUCHER,
  reward_source: "business",
  audience: "all business",
  status: "active",
  quantity: 50,
  remaining_quantity: 42,
  points_required: 100,
  stamps_required: null,
  is_points_enabled: true,
  is_stamps_enabled: false,
  is_mall_integrated: false,
  mall_reward_value: 0,
  mall_reward_type: null,
  reward: { id: "reward-1" },
  expiry_datetime: null,
  created_at: new Date(),
  updated_at: new Date(),
};

describe("PartnerRewardsService", () => {
  const buildQb = (rows: any[] = [rewardEntity]) => {
    const qb: any = {};
    qb.where = jest.fn(() => qb);
    qb.andWhere = jest.fn(() => qb);
    qb.leftJoinAndSelect = jest.fn(() => qb);
    qb.orderBy = jest.fn(() => qb);
    qb.skip = jest.fn(() => qb);
    qb.take = jest.fn(() => qb);
    qb.getManyAndCount = jest.fn().mockResolvedValue([rows, rows.length]);
    return qb;
  };

  const buildService = (
    overrides: {
      rewardRepo?: any;
      businessRewardRepo?: any;
      businessRepo?: any;
    } = {},
  ) =>
    new PartnerRewardsService(
      overrides.rewardRepo ?? { createQueryBuilder: jest.fn(() => buildQb()) },
      overrides.businessRewardRepo ?? {
        createQueryBuilder: jest.fn(() => buildQb([businessRewardEntity])),
      },
      overrides.businessRepo ?? { findOne: jest.fn() },
    );

  it("maps catalogue rows to stable partner DTOs", async () => {
    const service = buildService();

    const result = await service.listCatalog({ page: 1, limit: 20 } as any);

    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.data[0]).toMatchObject({
      id: "reward-1",
      rewardType: RewardType.GIFT_CARD,
      value: 50,
      quantity: 100,
    });
  });

  it("throws 404 for an unknown reward", async () => {
    const service = buildService({
      rewardRepo: { findOne: jest.fn().mockResolvedValue(null) },
    });

    await expect(service.getCatalogReward("nope")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("throws 404 for a disabled reward", async () => {
    const service = buildService({
      rewardRepo: {
        findOne: jest
          .fn()
          .mockResolvedValue({ ...rewardEntity, disabled: true }),
      },
    });

    await expect(service.getCatalogReward("reward-1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe("business-owned rewards", () => {
    it("requires a business identifier", async () => {
      const service = buildService();

      await expect(
        service.listBusinessRewards({ page: 1, limit: 20 } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("throws 404 when the business cannot be resolved", async () => {
      const service = buildService({
        businessRepo: { findOne: jest.fn().mockResolvedValue(null) },
      });

      await expect(
        service.listBusinessRewards({ mcomUserId: "unknown" } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("lists the rewards owned by the resolved business", async () => {
      const businessRepo = {
        findOne: jest.fn().mockResolvedValue({
          id: "biz-1",
          name: "Acme",
          email: "shop@example.com",
          mcomUserId: "6f2c",
        }),
      };
      const service = buildService({ businessRepo });

      const result = await service.listBusinessRewards({
        mcomUserId: "6f2c",
        page: 1,
        limit: 20,
      } as any);

      expect(result.business).toMatchObject({
        id: "biz-1",
        mcomUserId: "6f2c",
      });
      expect(result.total).toBe(1);
      expect(result.data[0]).toMatchObject({
        id: "br-1",
        businessId: "biz-1",
        rewardType: RewardType.VOUCHER,
        remainingQuantity: 42,
        sourceRewardId: "reward-1",
      });
    });
  });
});
