import { Test, TestingModule } from "@nestjs/testing";
import { RewardsService } from "./rewards.service";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Reward } from "../entities/reward.entity";
import { BusinessReward } from "../entities/business-reward.entity";
import { Business } from "../../business/entities/business.entity";
import { PlanSubscription } from "../../plans/entities/plan-subscription.entity";
import { Sector } from "../../sector/entities/sector.entity";
import { Tier } from "../../tier/entities/tier.entity";
import { BusinessCampaign } from "../../campaign/entities/business-campaign.entity";
import { Category } from "../../category/entities/category.entity";
import { SubCategory } from "../../subcategory/entities/subcategory.entity";
import { LibraryAsset } from "../../library-assets/entities/library-asset.entity";
import { TierProgressionService } from "../../tier-progression/tier-progression.service";
import { PointHistory } from "../../participant-campaign-balance/entities/point-history.entity";
import { MallIntegrationService } from "../../mall-integration/mall-integration.service";
import { PartnerIssuanceMetricsService } from "../../partner-rewards/services/partner-issuance-metrics.service";
import { AccessPassService } from "../../access-passes/access-pass.service";
import { CreateRewardDto } from "../dto/create-reward.dto";
import { RewardType } from "../enums/reward-type.enum";
import { BadgeLevel } from "../enums/badge-level.enum";
import { RewardSource } from "../enums/reward-source.enum";
import { RewardAudience } from "../enums/reward-audience.enum";
import { RewardStatus } from "../enums/reward-status.enum";
import { NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";

describe("RewardsService", () => {
  let service: RewardsService;
  let rewardRepository: Repository<Reward>;
  let sectorRepository: Repository<Sector>;
  let tierRepository: Repository<Tier>;

  const mockRewardRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockBusinessRewardRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockBusinessRepository = {
    findOne: jest.fn(),
  };
  const mockPlanSubscriptionRepository = {
    findOne: jest.fn(),
  };

  const mockSectorRepository = {
    findBy: jest.fn(),
  };

  const mockTierRepository = {
    findBy: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockBusinessCampaignRepository = {
    findOne: jest.fn(),
  };

  const mockTierProgressionService = {
    checkAndPromote: jest.fn(),
  };
  const mockLibraryAssetRepository = {
    findOne: jest.fn(),
  };
  const mockCategoryRepository = {
    findOne: jest.fn(),
  };
  const mockSubCategoryRepository = {
    findOne: jest.fn(),
  };
  const mockPointHistoryRepository = {
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
    getMany: jest.fn(),
  };

  const mockPartnerIssuance = {
    getCountsByBusinessReward: jest.fn().mockResolvedValue(new Map()),
    getValueByBusinessReward: jest.fn().mockResolvedValue(new Map()),
    getGlobalSummary: jest.fn().mockResolvedValue({ count: 0, points: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        { provide: getRepositoryToken(Reward), useValue: mockRewardRepository },
        {
          provide: getRepositoryToken(BusinessReward),
          useValue: mockBusinessRewardRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        {
          provide: getRepositoryToken(PlanSubscription),
          useValue: mockPlanSubscriptionRepository,
        },
        { provide: getRepositoryToken(Sector), useValue: mockSectorRepository },
        { provide: getRepositoryToken(Tier), useValue: mockTierRepository },
        {
          provide: getRepositoryToken(BusinessCampaign),
          useValue: mockBusinessCampaignRepository,
        },
        {
          provide: TierProgressionService,
          useValue: mockTierProgressionService,
        },
        {
          provide: getRepositoryToken(LibraryAsset),
          useValue: mockLibraryAssetRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(SubCategory),
          useValue: mockSubCategoryRepository,
        },
        {
          provide: getRepositoryToken(PointHistory),
          useValue: mockPointHistoryRepository,
        },
        {
          provide: MallIntegrationService,
          useValue: { getBusiness: jest.fn(), listProducts: jest.fn(), listServices: jest.fn() },
        },
        {
          provide: PartnerIssuanceMetricsService,
          useValue: mockPartnerIssuance,
        },
        {
          provide: AccessPassService,
          useValue: { findActiveForBusiness: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
    rewardRepository = module.get<Repository<Reward>>(
      getRepositoryToken(Reward),
    );
    sectorRepository = module.get<Repository<Sector>>(
      getRepositoryToken(Sector),
    );
    tierRepository = module.get<Repository<Tier>>(getRepositoryToken(Tier));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createReward", () => {
    const createRewardDto: CreateRewardDto = {
      title: "Test Reward",
      max_points: 100,
      value: 10,
      description: "Test Description",
      image: "image-url",
      reward_type: RewardType.VOUCHER,
      audience: RewardAudience.ALL_BUSINESS,
      status: RewardStatus.ACTIVE,
    };

    it("should create a reward without sectors or tiers", async () => {
      mockRewardRepository.create.mockReturnValue(createRewardDto);
      mockRewardRepository.save.mockResolvedValue(createRewardDto);

      const result = await service.createReward(createRewardDto);
      expect(result).toEqual(createRewardDto);
      expect(mockRewardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createRewardDto,
          sectors: [],
          tiers: [],
        }),
      );
    });

    it("should create a reward with valid sectors", async () => {
      const sectors = [{ id: "s1", name: "Sector 1" }] as Sector[];
      mockSectorRepository.findBy.mockResolvedValue(sectors);
      mockRewardRepository.create.mockReturnValue({
        ...createRewardDto,
        sectors,
      });
      mockRewardRepository.save.mockResolvedValue({
        ...createRewardDto,
        sectors,
      });

      const dto = { ...createRewardDto, sector_ids: ["s1"] };
      const result = await service.createReward(dto);

      expect(mockSectorRepository.findBy).toHaveBeenCalledWith({
        id: expect.any(Object),
      }); // In(['s1'])
      expect(mockRewardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sectors: sectors,
        }),
      );
      expect(result).toBeDefined();
    });

    it("should throw NotFoundException if sector not found", async () => {
      mockSectorRepository.findBy.mockResolvedValue([]);
      const dto = { ...createRewardDto, sector_ids: ["s1"] };

      await expect(service.createReward(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should create a reward with valid tiers", async () => {
      const tiers = [{ id: "t1", name: "Tier 1" }] as Tier[];
      mockTierRepository.findBy.mockResolvedValue(tiers);
      mockRewardRepository.create.mockReturnValue({
        ...createRewardDto,
        tiers,
      });
      mockRewardRepository.save.mockResolvedValue({
        ...createRewardDto,
        tiers,
      });

      const dto = { ...createRewardDto, tier_ids: ["t1"] };
      const result = await service.createReward(dto);

      expect(mockTierRepository.findBy).toHaveBeenCalledWith({
        id: expect.any(Object),
      });
      expect(mockRewardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tiers: tiers,
        }),
      );
      expect(result).toBeDefined();
    });

    it("should throw NotFoundException if tier not found", async () => {
      mockTierRepository.findBy.mockResolvedValue([]);
      const dto = { ...createRewardDto, tier_ids: ["t1"] };

      await expect(service.createReward(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
    it("should throw ForbiddenException if neither points nor stamps are provided", async () => {
      const dto = {
        ...createRewardDto,
        max_points: undefined,
        max_stamps_required: undefined,
      };
      await expect(service.createReward(dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("updateBusinessReward", () => {
    const updateDto = { quantity: 50 };
    const businessId = "b1";
    const rewardId = "r1";
    const businessReward = {
      id: rewardId,
      business: { id: businessId },
      quantity: 100,
    } as BusinessReward;

    it("should update a business reward successfully", async () => {
      mockBusinessRewardRepository.findOne.mockResolvedValue(businessReward);
      mockBusinessRewardRepository.save.mockResolvedValue({
        ...businessReward,
        ...updateDto,
      });

      const result = await service.updateBusinessReward(
        businessId,
        rewardId,
        updateDto,
      );

      expect(mockBusinessRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: rewardId, business: { id: businessId } },
        relations: ["reward", "business"],
      });
      expect(mockBusinessRewardRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...businessReward,
          ...updateDto,
        }),
      );
      expect(result).toEqual(expect.objectContaining(updateDto));
    });

    it("should throw ForbiddenException if reward not found", async () => {
      mockBusinessRewardRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateBusinessReward(businessId, rewardId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if stamps requested exceed admin max", async () => {
      const reward = { max_stamps_required: 10 } as Reward;
      const br = {
        id: rewardId,
        business: { id: businessId, isSuperBusiness: false },
        reward,
      } as BusinessReward;
      mockBusinessRewardRepository.findOne.mockResolvedValue(br);

      await expect(
        service.updateBusinessReward(businessId, rewardId, {
          stamps_required: 11,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("mall fulfilment persistence", () => {
    const businessId = "b1";

    const createDto = (overrides: Record<string, any> = {}) =>
      ({
        title: "Reward",
        description: "Description",
        image: "image-url",
        reward_type: RewardType.GIFT_CARD,
        points_required: 100,
        is_points_enabled: true,
        is_stamps_enabled: false,
        mall_reward_value: 25,
        ...overrides,
      }) as any;

    beforeEach(() => {
      jest.clearAllMocks();
      mockBusinessRepository.findOne.mockResolvedValue({ id: businessId });
      mockPlanSubscriptionRepository.findOne.mockResolvedValue(null);
      mockBusinessRewardRepository.create.mockImplementation((value: any) => value);
      mockBusinessRewardRepository.save.mockImplementation((value: any) =>
        Promise.resolve(value),
      );
    });

    it("creates a gift card with the matching mall type and fulfilment attachment", async () => {
      await service.createBusinessReward(
        businessId,
        createDto({
          mall_reward_type: "GIFT_CARD",
          mall_target_scope: "SPECIFIC",
          mall_target_product_ids: ["p1"],
          fulfilment: {
            provider: "MALL",
            kind: "MALL_GIFT_CARD",
            delivery: "CODE",
            templateRef: { system: "MALL", id: "tpl-1" },
            scope: { mode: "ITEMS", productIds: ["p1"], serviceIds: [] },
            value: { amount: 25, currency: "GBP" },
          },
        }),
      );

      const created = mockBusinessRewardRepository.create.mock.calls[0][0];
      expect(created.mall_reward_type).toBe("GIFT_CARD");
      expect(created.mall_reward_value).toBe(25);
      expect(created.is_mall_integrated).toBe(true);
      expect(created.fulfilment_provider).toBe("MALL");
      expect(created.fulfilment_kind).toBe("MALL_GIFT_CARD");
      expect(created.fulfilment_template_id).toBe("tpl-1");
      expect(created.fulfilment_config.scope).toEqual({
        mode: "ITEMS",
        productIds: ["p1"],
        serviceIds: [],
      });
    });

    it("creates a mall discount without a mall instrument type", async () => {
      await service.createBusinessReward(
        businessId,
        createDto({
          reward_type: RewardType.MALL_DISCOUNT,
          mall_reward_value: 0,
          mall_reward_type: "GIFT_CARD",
          mall_target_scope: "SPECIFIC",
          mall_target_product_ids: ["p1"],
          mall_discount_type: "percentage",
          mall_discount_value: 20,
        }),
      );

      const created = mockBusinessRewardRepository.create.mock.calls[0][0];
      expect(created.mall_reward_type).toBeNull();
      expect(created.mall_reward_value).toBe(0);
      expect(created.is_mall_integrated).toBe(true);
      expect(created.mall_discount_type).toBe("percentage");
      expect(created.mall_discount_value).toBe(20);
      expect(created.fulfilment_kind).toBe("MALL_DISCOUNT");
    });

    it("rejects a mall discount with no products or services when scope is SPECIFIC", async () => {
      await expect(
        service.createBusinessReward(
          businessId,
          createDto({
            reward_type: RewardType.MALL_DISCOUNT,
            mall_reward_value: 0,
            mall_target_scope: "SPECIFIC",
            mall_target_product_ids: [],
            mall_target_service_ids: [],
            mall_discount_type: "fixed",
            mall_discount_value: 5,
          }),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("clears stale discount fields when switching from a mall discount to a voucher", async () => {
      const businessReward: any = {
        id: "r1",
        business: { id: businessId },
        reward_type: RewardType.MALL_DISCOUNT,
        is_mall_integrated: true,
        mall_reward_value: 0,
        mall_reward_type: null,
        mall_target_scope: "ALL",
        mall_target_product_ids: [],
        mall_target_service_ids: [],
        mall_discount_type: "percentage",
        mall_discount_value: 20,
        mall_max_discount: 10,
        mall_min_spend: 30,
        fulfilment_provider: "MALL",
        fulfilment_kind: "MALL_DISCOUNT",
      };
      mockBusinessRewardRepository.findOne.mockResolvedValue(businessReward);

      await service.updateBusinessReward(businessId, "r1", {
        reward_type: RewardType.VOUCHER,
        mall_reward_value: 12,
      } as any);

      expect(businessReward.mall_reward_type).toBe("VOUCHER");
      expect(businessReward.mall_reward_value).toBe(12);
      expect(businessReward.mall_discount_type).toBeNull();
      expect(businessReward.mall_discount_value).toBeNull();
      expect(businessReward.mall_max_discount).toBeNull();
      expect(businessReward.mall_min_spend).toBeNull();
      expect(businessReward.fulfilment_kind).toBe("MALL_VOUCHER");
    });

    it("does not wipe mall configuration on an unrelated partial update", async () => {
      const businessReward: any = {
        id: "r1",
        business: { id: businessId },
        reward_type: RewardType.GIFT_CARD,
        is_mall_integrated: true,
        mall_reward_value: 15,
        mall_reward_type: "GIFT_CARD",
        mall_target_scope: "SPECIFIC",
        mall_target_product_ids: ["p1"],
        mall_target_service_ids: [],
        mall_discount_type: null,
        mall_discount_value: null,
        fulfilment_provider: "MALL",
        fulfilment_kind: "MALL_GIFT_CARD",
        fulfilment_template_id: "tpl-1",
      };
      mockBusinessRewardRepository.findOne.mockResolvedValue(businessReward);

      await service.updateBusinessReward(businessId, "r1", {
        disabled: true,
      } as any);

      expect(businessReward.disabled).toBe(true);
      expect(businessReward.mall_reward_type).toBe("GIFT_CARD");
      expect(businessReward.mall_target_product_ids).toEqual(["p1"]);
      expect(businessReward.fulfilment_kind).toBe("MALL_GIFT_CARD");
      expect(businessReward.fulfilment_template_id).toBe("tpl-1");
    });
  });

  describe("getBusinessRewards", () => {
    it("merges partner-issued grants into per-reward redemption counts", async () => {
      mockBusinessRewardRepository.findAndCount.mockResolvedValue([
        [{ id: "br1" }],
        1,
      ]);
      mockPartnerIssuance.getCountsByBusinessReward.mockResolvedValue(
        new Map([["br1", { count: 2, points: 0 }]]),
      );

      const phQb: any = {
        select: jest.fn(() => phQb),
        addSelect: jest.fn(() => phQb),
        where: jest.fn(() => phQb),
        andWhere: jest.fn(() => phQb),
        groupBy: jest.fn(() => phQb),
        getRawMany: jest.fn().mockResolvedValue([
          { businessRewardId: "br1", count: "1", points: "10" },
        ]),
      };
      mockPointHistoryRepository.createQueryBuilder.mockReturnValue(phQb);

      const result = await service.getBusinessRewards("biz-1", 1, 10);

      // 1 in-app + 2 partner-issued = 3.
      expect(result.data[0].total_redemptions).toBe(3);
      expect(result.data[0].total_points_redeemed).toBe(10);
    });
  });
});
