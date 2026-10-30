import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reward } from "../entities/reward.entity";
import { CreateRewardDto } from "../dto/create-reward.dto";
import { BusinessReward } from "../entities/business-reward.entity";
import {
  PointHistory,
  PointHistoryType,
} from "../../participant-campaign-balance/entities/point-history.entity";
import { CreateBusinessRewardDto } from "../dto/create-business-reward.dto";
import { UpdateBusinessRewardDto } from "../dto/update-business-reward.dto";
import { UpdateRewardDto } from "../dto/update-reward.dto";
import { Business } from "../../business/entities/business.entity";
import { RewardStatus } from "../enums/reward-status.enum";
import { RewardAudience } from "../enums/reward-audience.enum";
import { RewardType } from "../enums/reward-type.enum";
import { PlanSubscription } from "../../plans/entities/plan-subscription.entity";
import { Sector } from "../../sector/entities/sector.entity";
import { Tier } from "../../tier/entities/tier.entity";
import { In, Brackets } from "typeorm";
import { PaginationResult } from "../../../common/interfaces/pagination-result.interface";
import { TierProgressionService } from "../../tier-progression/tier-progression.service";
import { RewardSource } from "../enums/reward-source.enum";
import { BusinessCampaign } from "../../campaign/entities/business-campaign.entity";

import { AddRewardToBusinessDto } from "../dto/add-reward-to-business.dto";
import { GetRewardsFilterDto, SortBy } from "../dto/get-rewards-filter.dto";
import { LibraryAsset } from "../../library-assets/entities/library-asset.entity";
import { ImageSourceType } from "../enums/image-source-type.enum";
import { Category } from "../../category/entities/category.entity";
import { SubCategory } from "../../subcategory/entities/subcategory.entity";
import { MallIntegrationService } from "../../mall-integration/mall-integration.service";
import { PartnerIssuanceMetricsService } from "../../partner-rewards/services/partner-issuance-metrics.service";
import { AccessPassService } from "../../access-passes/access-pass.service";
import {
  FulfilmentKind,
  FulfilmentProvider,
} from "../../reward-fulfilment/reward-fulfilment.enums";

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(BusinessReward)
    private readonly businessRewardRepository: Repository<BusinessReward>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(PlanSubscription)
    private readonly planSubscriptionRepository: Repository<PlanSubscription>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    @Inject(forwardRef(() => TierProgressionService))
    private readonly tierProgressionService: TierProgressionService,
    @InjectRepository(LibraryAsset)
    private readonly libraryAssetRepository: Repository<LibraryAsset>,
    @InjectRepository(BusinessCampaign)
    private readonly businessCampaignRepository: Repository<BusinessCampaign>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    private readonly mallIntegration: MallIntegrationService,
    private readonly partnerIssuance: PartnerIssuanceMetricsService,
    private readonly accessPassService: AccessPassService,
  ) {}

  /**
   * Resolve the admin-configured max points for a reward. The active plan tier
   * takes precedence, but an active access pass fills in the value when the
   * business has no plan-level limit (access passes are standalone entitlements).
   */
  private async resolveMaxRewardPoints(
    businessId: string,
    subscription: PlanSubscription | null,
  ): Promise<number> {
    const planMax =
      subscription?.planVariant?.configuration?.quotas?.maxRewardPoints ??
      (subscription?.planVariant?.tierLevel as any)?.configuration?.quotas
        ?.maxRewardPoints;

    if (planMax !== undefined && planMax !== null) {
      return planMax;
    }

    const accessPass =
      await this.accessPassService.findActiveForBusiness(businessId);
    return accessPass?.configuration?.quotas?.maxRewardPoints ?? 0;
  }

  async createReward(createRewardDto: CreateRewardDto): Promise<Reward> {
    const {
      image_source_type,
      library_asset_id,
      sector_id,
      category_id,
      sub_category_id,
      emoji,
      fulfilment,
      ...rest
    } = createRewardDto as CreateRewardDto & { fulfilment?: any };

    let imageToUse = createRewardDto.image;

    if (image_source_type === ImageSourceType.SECTOR_LOGO && sector_id) {
      const sector = await this.sectorRepository.findOne({
        where: { id: sector_id },
      });
      if (sector) imageToUse = sector.imageUrl;
    } else if (
      image_source_type === ImageSourceType.CATEGORY_LOGO &&
      category_id
    ) {
      const category = await this.categoryRepository.findOne({
        where: { id: category_id },
      });
      if (category) imageToUse = category.imageUrl;
    } else if (
      image_source_type === ImageSourceType.SUB_CATEGORY_LOGO &&
      sub_category_id
    ) {
      const subCategory = await this.subCategoryRepository.findOne({
        where: { id: sub_category_id },
      });
      if (subCategory) imageToUse = subCategory.imageUrl;
    } else if (image_source_type === ImageSourceType.LIBRARY_ASSET) {
      if (library_asset_id) {
        const asset = await this.libraryAssetRepository.findOne({
          where: { id: library_asset_id },
        });
        if (asset) imageToUse = asset.url;
      }
    } else if (image_source_type === ImageSourceType.EMOJI) {
      imageToUse = emoji || "🎁";
    }

    if (!rest.max_points && !rest.max_stamps_required) {
      throw new ForbiddenException(
        "At least one of max_points or max_stamps_required must be provided",
      );
    }

    const sectors = rest.sector_ids
      ? await this.sectorRepository.findBy({ id: In(rest.sector_ids) })
      : [];
    if (rest.sector_ids && sectors.length !== rest.sector_ids.length) {
      throw new NotFoundException("One or more sectors not found");
    }

    const tiers = rest.tier_ids
      ? await this.tierRepository.findBy({ id: In(rest.tier_ids) })
      : [];
    if (rest.tier_ids && tiers.length !== rest.tier_ids.length) {
      throw new NotFoundException("One or more tiers not found");
    }

    const reward = this.rewardRepository.create({
      ...rest,
      ...this.mapFulfilmentColumns(fulfilment),
      image: imageToUse,
      sectors,
      tiers,
    });
    return this.rewardRepository.save(reward);
  }

  async getRewards(
    filterDto: GetRewardsFilterDto,
  ): Promise<PaginationResult<Reward>> {
    return this.getGlobalRewards(filterDto);
  }

  async findOne(id: string): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({
      where: { id },
      relations: ["sectors", "tiers", "businessRewards", "businessRewards.business"],
    });
    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }
    return reward;
  }

  async updateReward(
    id: string,
    updateRewardDto: UpdateRewardDto,
  ): Promise<Reward> {
    await this.findOne(id);
    const { fulfilment, ...rest } = updateRewardDto as UpdateRewardDto & {
      fulfilment?: any;
    };
    await this.rewardRepository.update(id, {
      ...rest,
      ...this.mapFulfilmentColumns(fulfilment),
    });
    return this.findOne(id);
  }

  async deleteReward(id: string): Promise<void> {
    await this.findOne(id);
    await this.rewardRepository.delete(id);
  }

  async disableReward(id: string): Promise<Reward> {
    const reward = await this.findOne(id);
    reward.disabled = true;
    return this.rewardRepository.save(reward);
  }

  async enableReward(id: string): Promise<Reward> {
    const reward = await this.findOne(id);
    reward.disabled = false;
    return this.rewardRepository.save(reward);
  }

  async addRewardToBusiness(
    rewardId: string,
    businessId: string,
    addRewardToBusinessDto: AddRewardToBusinessDto,
  ): Promise<BusinessReward> {
    const { fulfilment, ...rest } = addRewardToBusinessDto as
      AddRewardToBusinessDto & { fulfilment?: any };
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });
    if (!reward) {
      throw new NotFoundException(`Reward with ID ${rewardId} not found`);
    }

    const isPointsEnabled =
      rest.is_points_enabled !== undefined
        ? rest.is_points_enabled
        : reward.is_points_enabled;
    const isStampsEnabled =
      rest.is_stamps_enabled !== undefined
        ? rest.is_stamps_enabled
        : reward.is_stamps_enabled;

    if (!isPointsEnabled && !isStampsEnabled) {
      throw new BadRequestException(
        "At least one of points or stamps must be enabled",
      );
    }

    if (isPointsEnabled && !reward.is_points_enabled) {
      throw new BadRequestException(
        "Points are not enabled for this base reward",
      );
    }

    if (isStampsEnabled && !reward.is_stamps_enabled) {
      throw new BadRequestException(
        "Stamps are not enabled for this base reward",
      );
    }

    const pointRequired = isPointsEnabled
      ? rest.points_required || reward.max_points
      : null;

    const stampsRequired = isStampsEnabled
      ? rest.stamps_required || reward.max_stamps_required
      : null;

    if (isPointsEnabled && !pointRequired) {
      throw new BadRequestException(
        "Points required must be specified if points are enabled",
      );
    }

    if (isStampsEnabled && !stampsRequired) {
      throw new BadRequestException(
        "Stamps required must be specified if stamps are enabled",
      );
    }

    // Check points Required against Plan Max Points
    const subscription = await this.planSubscriptionRepository.findOne({
      where: { business: { id: businessId } },
      relations: ["planVariant"],
    });

    const maxPoints = await this.resolveMaxRewardPoints(
      businessId,
      subscription,
    );

    if (maxPoints > 0 && pointRequired && pointRequired > maxPoints) {
      throw new BadRequestException(
        `Points required cannot exceed the maximum points set by admin (${maxPoints} points).`,
      );
    }

    const businessReward = this.businessRewardRepository.create({
      ...rest,
      business,
      reward,
      points_required: pointRequired,
      stamps_required: stampsRequired,
      is_points_enabled: isPointsEnabled,
      is_stamps_enabled: isStampsEnabled,
      status: (rest as any).status || RewardStatus.ACTIVE,
      reward_type: (rest as any).reward_type || reward.reward_type,
      reward_source: (rest as any).reward_source || reward.reward_source,
      audience: (rest as any).audience || reward.audience,
      description: (rest as any).description || reward.description,
      image: (rest as any).image || reward.image,
      gallery: (rest as any).gallery || reward.gallery,
      ...(fulfilment
        ? this.mapFulfilmentColumns(fulfilment)
        : {
            fulfilment_provider: reward.fulfilment_provider,
            fulfilment_kind: reward.fulfilment_kind,
            fulfilment_config: reward.fulfilment_config,
            fulfilment_template_id: reward.fulfilment_template_id,
            fulfilment_business_ref: reward.fulfilment_business_ref,
            fulfilment_funding_source: reward.fulfilment_funding_source,
          }),
    });

    return this.businessRewardRepository.save(businessReward);
  }

  async createBusinessReward(
    businessId: string,
    createBusinessRewardDto: CreateBusinessRewardDto,
  ): Promise<BusinessReward> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    // 1. Check points Required against Plan Max Points
    const subscription = await this.planSubscriptionRepository.findOne({
      where: { business: { id: businessId } },
      relations: ["planVariant"],
    });

    const isPointsEnabled = createBusinessRewardDto.is_points_enabled ?? true;
    const isStampsEnabled = createBusinessRewardDto.is_stamps_enabled ?? false;

    const maxPoints = await this.resolveMaxRewardPoints(
      businessId,
      subscription,
    );

    if (isPointsEnabled && maxPoints > 0) {
      const pointRequired = createBusinessRewardDto.points_required;
      if (pointRequired && pointRequired > maxPoints) {
        throw new BadRequestException(
          `Points required cannot exceed the maximum points set by admin (${maxPoints} points).`,
        );
      }
    }

    const {
      reward_type,
      reward_source = RewardSource.BUSINESS,
      audience = RewardAudience.ALL_BUSINESS,
      description,
      image,
      gallery,
      points_required,
      stamps_required,
    } = createBusinessRewardDto;

    // Determine Image
    let imageToUse = createBusinessRewardDto.image;
    const { image_source_type, library_asset_id, emoji, stamp_emoji } =
      createBusinessRewardDto;

    if (image_source_type === ImageSourceType.BUSINESS_LOGO) {
      imageToUse = business.profile_image;
    } else if (image_source_type === ImageSourceType.LIBRARY_ASSET) {
      if (library_asset_id) {
        const asset = await this.libraryAssetRepository.findOne({
          where: { id: library_asset_id },
        });
        if (asset) imageToUse = asset.url;
      }
    } else if (image_source_type === ImageSourceType.EMOJI) {
      // Emojis are strings, but we need a URL for 'image' field if UI expects it.
      // Or UI handles emoji separately. Usually we might store emoji in description or a new field.
      // If we must use 'image', we can store the emoji character directly or a transparent placeholder.
      imageToUse = emoji || "🎁";
    }

    createBusinessRewardDto.image = imageToUse;

    // Keep the mall columns and the fulfilment attachment in sync with the
    // selected reward type. This is also what stops a gift card from being
    // persisted/fulfilled as a mall discount (or vice versa).
    Object.assign(
      createBusinessRewardDto,
      this.resolveMallRewardFields(
        createBusinessRewardDto as unknown as Record<string, any>,
      ),
    );

    const { fulfilment: fulfilmentAttachment, ...rewardFields } =
      createBusinessRewardDto as CreateBusinessRewardDto & {
        fulfilment?: any;
      };

    const businessReward = this.businessRewardRepository.create({
      ...rewardFields,
      ...this.resolveFulfilmentColumns(
        createBusinessRewardDto as unknown as Record<string, any>,
        fulfilmentAttachment,
      ),
      business,
      reward_source,
      audience,
      points_required,
      stamps_required,
      is_points_enabled: isPointsEnabled,
      is_stamps_enabled: isStampsEnabled,
      remaining_quantity: createBusinessRewardDto.quantity,
    });

    const saved = await this.businessRewardRepository.save(businessReward);

    // Trigger promotion check after adding reward
    await this.tierProgressionService.checkAndPromote(businessId);

    return saved;
  }

  /**
   * Resolve the logged-in business in MCOM Mall and return its products and
   * services for the mall-discount targeting picker. The mall business is
   * keyed on the owner's Central user id.
   */
  async getMallCatalogForBusiness(businessId: string): Promise<any> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    if (!business.mcomUserId) {
      throw new BadRequestException(
        "Business is not linked to an MCOM Central user, so it cannot be resolved in MCOM Mall",
      );
    }
    return this.mallIntegration.getBusiness({
      mcomUserId: business.mcomUserId,
    });
  }

  async updateBusinessReward(
    businessId: string,
    rewardId: string,
    updateBusinessRewardDto: UpdateBusinessRewardDto,
  ): Promise<BusinessReward> {
    const businessReward = await this.businessRewardRepository.findOne({
      where: { id: rewardId, business: { id: businessId } },
      relations: ["reward", "business"],
    });
    if (!businessReward) {
      throw new NotFoundException(
        `BusinessReward with ID ${rewardId} not found`,
      );
    }

    if (
      updateBusinessRewardDto.stamps_required &&
      businessReward.reward &&
      updateBusinessRewardDto.stamps_required >
        businessReward.reward.max_stamps_required
    ) {
      throw new ForbiddenException(
        `Stamps required cannot exceed the maximum stamps set by admin (${businessReward.reward.max_stamps_required} stamps).`,
      );
    }

    // Check points Required against Plan Max Points
    if (updateBusinessRewardDto.points_required) {
      const subscription = await this.planSubscriptionRepository.findOne({
        where: { business: { id: businessId } },
        relations: ["planVariant"],
      });

      const maxPoints = await this.resolveMaxRewardPoints(
        businessId,
        subscription,
      );

      if (
        maxPoints > 0 &&
        updateBusinessRewardDto.points_required > maxPoints
      ) {
        throw new BadRequestException(
          `Points required cannot exceed the maximum points set by admin (${maxPoints} points).`,
        );
      }
    }

    const { fulfilment, ...rewardFields } = updateBusinessRewardDto as
      UpdateBusinessRewardDto & { fulfilment?: any };

    // Normalise mall columns + fulfilment attachment before persisting so
    // switching reward types cannot leave stale mall/discount configuration.
    const mallFields = this.resolveMallRewardFields(
      updateBusinessRewardDto as unknown as Record<string, any>,
      businessReward,
    );

    Object.assign(
      businessReward,
      rewardFields,
      mallFields,
      this.resolveFulfilmentColumns(
        updateBusinessRewardDto as unknown as Record<string, any>,
        fulfilment,
        businessReward,
      ),
    );
    return this.businessRewardRepository.save(businessReward);
  }

  async getBusinessRewards(
    businessId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<BusinessReward>> {
    const [data, total] = await this.businessRewardRepository.findAndCount({
      where: { business: { id: businessId } },
      relations: ["reward"],
      order: { created_at: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    await this.attachRedemptionCounts(data);

    const totalPages = Math.ceil(total / limit);
    const next = page < totalPages ? Number(page) + 1 : null;
    const previous = page > 1 ? Number(page) - 1 : null;

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      next,
      previous,
    };
  }

  /**
   * Attach per-reward redemption totals, merging in-app `point_history`
   * redemptions with reward grants delivered through an ecosystem partner
   * (e.g. FundOrDonate), which are recorded in `reward_issuance` only.
   */
  private async attachRedemptionCounts(
    rewards: BusinessReward[],
  ): Promise<void> {
    if (!rewards || rewards.length === 0) return;

    const ids = rewards.map((r) => r.id);
    const [partnerCounts, inAppRows] = await Promise.all([
      this.partnerIssuance.getCountsByBusinessReward(ids),
      this.pointHistoryRepository
        .createQueryBuilder("ph")
        .select("ph.business_reward_id", "businessRewardId")
        .addSelect("COUNT(ph.id)", "count")
        .addSelect("COALESCE(SUM(ph.points), 0)", "points")
        .where("ph.business_reward_id IN (:...ids)", { ids })
        .andWhere("ph.type IN (:...types)", {
          types: [PointHistoryType.REDEEM, PointHistoryType.STAMP_REDEEM],
        })
        .groupBy("ph.business_reward_id")
        .getRawMany<{ businessRewardId: string; count: string; points: string }>(),
    ]);

    const inAppMap = new Map(
      inAppRows.map((row) => [
        row.businessRewardId,
        {
          count: parseInt(row.count, 10) || 0,
          points: parseInt(row.points, 10) || 0,
        },
      ]),
    );

    for (const reward of rewards) {
      const partner = partnerCounts.get(reward.id) ?? { count: 0, points: 0 };
      const inApp = inAppMap.get(reward.id) ?? { count: 0, points: 0 };
      reward.total_redemptions = partner.count + inApp.count;
      reward.total_points_redeemed = partner.points + inApp.points;
    }
  }

  async getMallRewardHistory(
    businessId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<PointHistory>> {
    const query = this.pointHistoryRepository
      .createQueryBuilder("ph")
      .leftJoinAndSelect("ph.participant", "participant")
      .leftJoinAndSelect("ph.businessReward", "businessReward")
      .leftJoin("businessReward.reward", "reward")
      .addSelect([
        "reward.id",
        "reward.title",
        "reward.image",
        "reward.description",
        "reward.reward_type",
        "reward.value",
      ])
      .where("ph.business_id = :businessId", { businessId })
      .andWhere("(ph.type = :redeem OR ph.type = :stampRedeem)", {
        redeem: PointHistoryType.REDEEM,
        stampRedeem: PointHistoryType.STAMP_REDEEM,
      })
      .andWhere("businessReward.is_mall_integrated = :isIntegrated", {
        isIntegrated: true,
      })
      .orderBy("ph.created_at", "DESC");

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const next = page < totalPages ? Number(page) + 1 : null;
    const previous = page > 1 ? Number(page) - 1 : null;

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      next,
      previous,
    };
  }

  async getUnaddedRewards(
    businessId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<PaginationResult<Reward>> {
    const businessRewards = await this.businessRewardRepository.find({
      where: { business: { id: businessId } },
      relations: ["reward"],
    });

    const addedRewardIds = businessRewards
      .map((br) => br.reward?.id)
      .filter((id) => !!id);

    const queryBuilder = this.rewardRepository.createQueryBuilder("reward");

    queryBuilder.where(
      new Brackets((qb) => {
        qb.where("reward.audience = :aud1", {
          aud1: RewardAudience.ALL_BUSINESS,
        });
      }),
    );

    if (addedRewardIds.length > 0) {
      queryBuilder.andWhere("reward.id NOT IN (:...addedRewardIds)", {
        addedRewardIds,
      });
    }

    if (search) {
      queryBuilder.andWhere("reward.title ILIKE :search", {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy("reward.created_at", "DESC");

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      next: page * limit < total ? Number(page) + 1 : null,
      previous: page > 1 ? Number(page) - 1 : null,
    };
  }

  async getGlobalRewards(
    filterDto: GetRewardsFilterDto,
  ): Promise<PaginationResult<Reward>> {
    const {
      page = 1,
      limit = 10,
      search,
      sectorId,
      rewardType,
      audience,
      sortBy = SortBy.NEWEST,
      includeStats,
    } = filterDto;

    const queryBuilder = this.rewardRepository
      .createQueryBuilder("reward")
      .leftJoinAndSelect("reward.sectors", "sectors")
      .leftJoinAndSelect("reward.tiers", "tiers")
      .leftJoinAndSelect("reward.businessRewards", "businessRewards")
      .leftJoinAndSelect("businessRewards.business", "business");

    if (includeStats) {
      // 1. Business Claim Count
      queryBuilder.addSelect((subQuery) => {
        return subQuery
          .select("COUNT(br.id)", "count")
          .from(BusinessReward, "br")
          .where("br.reward_id = reward.id");
      }, "business_claimed_count");

      // 2. Redemption Count
      queryBuilder.addSelect((subQuery) => {
        return subQuery
          .select("COUNT(ph.id)", "count")
          .from(PointHistory, "ph")
          .innerJoin("ph.businessReward", "br")
          .where("br.reward_id = reward.id")
          .andWhere("ph.type IN (:...types)", {
            types: [PointHistoryType.REDEEM, PointHistoryType.STAMP_REDEEM],
          });
      }, "total_redemptions_count");

      // 3. Points Redeemed
      queryBuilder.addSelect((subQuery) => {
        return subQuery
          .select("COALESCE(SUM(ph.points), 0)", "sum")
          .from(PointHistory, "ph")
          .innerJoin("ph.businessReward", "br")
          .where("br.reward_id = reward.id")
          .andWhere("ph.type IN (:...types)", {
            types: [PointHistoryType.REDEEM, PointHistoryType.STAMP_REDEEM],
          });
      }, "total_points_redeemed");

      // 4. Stamps Redeemed
      queryBuilder.addSelect((subQuery) => {
        return subQuery
          .select("COALESCE(SUM(ph.stamps), 0)", "sum")
          .from(PointHistory, "ph")
          .innerJoin("ph.businessReward", "br")
          .where("br.reward_id = reward.id")
          .andWhere("ph.type IN (:...types)", {
            types: [PointHistoryType.REDEEM, PointHistoryType.STAMP_REDEEM],
          });
      }, "total_stamps_redeemed");
    }

    if (filterDto.disabled !== undefined) {
      queryBuilder.andWhere("reward.disabled = :disabled", {
        disabled: filterDto.disabled,
      });
    }

    if (filterDto.status) {
      queryBuilder.andWhere("reward.status = :status", {
        status: filterDto.status,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("reward.title ILIKE :search", {
            search: `%${search}%`,
          }).orWhere("reward.description ILIKE :search", {
            search: `%${search}%`,
          });
        }),
      );
    }

    if (sectorId) {
      queryBuilder.andWhere("sectors.id = :sectorId", { sectorId });
    }

    if (rewardType) {
      queryBuilder.andWhere("reward.reward_type = :rewardType", { rewardType });
    }

    if (audience) {
      queryBuilder.andWhere("reward.audience = :audience", { audience });
    }

    // Sorting
    if (sortBy === SortBy.NEWEST) {
      queryBuilder.orderBy("reward.created_at", "DESC");
    } else if (sortBy === SortBy.OLDEST) {
      queryBuilder.orderBy("reward.created_at", "ASC");
    } else if (sortBy === SortBy.POINTS_LOW) {
      queryBuilder.orderBy("reward.max_points", "ASC");
    } else if (sortBy === SortBy.POINTS_HIGH) {
      queryBuilder.orderBy("reward.max_points", "DESC");
    }

    let data: Reward[];
    let total: number;

    if (includeStats) {
      const { entities, raw } = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getRawAndEntities();

      total = await queryBuilder.getCount();

      data = entities.map((entity) => {
        const rawResult = raw.find((r) => r.reward_id === entity.id);
        if (rawResult) {
          entity.business_claimed_count = Number(
            rawResult.business_claimed_count || 0,
          );
          entity.total_redemptions_count = Number(
            rawResult.total_redemptions_count || 0,
          );
          entity.total_points_redeemed = Number(
            rawResult.total_points_redeemed || 0,
          );
          entity.total_stamps_redeemed = Number(
            rawResult.total_stamps_redeemed || 0,
          );
        }
        return entity;
      });
    } else {
      [data, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
    }

    // Fold partner-issued grants (e.g. FundOrDonate) into the per-reward
    // redemption totals — they live only in `reward_issuance`.
    if (includeStats && data.length > 0) {
      await this.attachGlobalRewardPartnerCounts(data);
    }

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      next: page * limit < total ? Number(page) + 1 : null,
      previous: page > 1 ? Number(page) - 1 : null,
    };
  }

  /** Add live partner-issuance counts to global catalogue reward stats. */
  private async attachGlobalRewardPartnerCounts(
    rewards: Reward[],
  ): Promise<void> {
    const businessRewardIds = rewards.flatMap(
      (reward) => reward.businessRewards?.map((br) => br.id) ?? [],
    );
    if (businessRewardIds.length === 0) return;

    const partnerCounts =
      await this.partnerIssuance.getCountsByBusinessReward(businessRewardIds);

    for (const reward of rewards) {
      let count = 0;
      let points = 0;
      for (const br of reward.businessRewards ?? []) {
        const c = partnerCounts.get(br.id);
        if (c) {
          count += c.count;
          points += c.points;
        }
      }
      if (count > 0 || points > 0) {
        reward.total_redemptions_count =
          Number(reward.total_redemptions_count || 0) + count;
        reward.total_points_redeemed =
          Number(reward.total_points_redeemed || 0) + points;
      }
    }
  }

  async removeRewardFromBusiness(
    rewardId: string,
    businessId: string,
  ): Promise<void> {
    const businessReward = await this.businessRewardRepository.findOne({
      where: { id: rewardId, business: { id: businessId } },
      relations: ["businessCampaigns"],
    });

    if (!businessReward) {
      throw new NotFoundException(`Business Reward not found`);
    }

    // Check if it's linked to any active campaigns
    if (
      businessReward.businessCampaigns &&
      businessReward.businessCampaigns.length > 0
    ) {
      const activeCampaigns = businessReward.businessCampaigns.filter(
        (bc) => !bc.disabled,
      );
      if (activeCampaigns.length > 0) {
        throw new BadRequestException(
          "Cannot remove reward that is currently linked to active campaigns. Disable the campaigns first.",
        );
      }
    }

    await this.businessRewardRepository.remove(businessReward);
  }

  async getMallRewardStats(businessId: string) {
    const [history, mallRewards] = await Promise.all([
      this.pointHistoryRepository
        .createQueryBuilder("ph")
        .leftJoinAndSelect("ph.businessReward", "businessReward")
        .where("ph.business_id = :businessId", { businessId })
        .andWhere("(ph.type = :redeem OR ph.type = :stampRedeem)", {
          redeem: PointHistoryType.REDEEM,
          stampRedeem: PointHistoryType.STAMP_REDEEM,
        })
        .andWhere("businessReward.is_mall_integrated = :isIntegrated", {
          isIntegrated: true,
        })
        .getMany(),
      this.businessRewardRepository.find({
        where: { business: { id: businessId }, is_mall_integrated: true },
      }),
    ]);

    // Partner-issued grants (e.g. FundOrDonate) are not in `point_history`.
    const partnerValues = await this.partnerIssuance.getValueByBusinessReward(
      mallRewards.map((r) => r.id),
    );

    const stats = history.reduce(
      (acc, item) => {
        const value = Number(item.businessReward.mall_reward_value || 0);
        acc.totalValue += value;
        acc.totalCount += 1;

        if (item.businessReward.mall_reward_type === "GIFT_CARD") {
          acc.giftCardsCount += 1;
          acc.giftCardsValue += value;
        } else if (item.businessReward.mall_reward_type === "VOUCHER") {
          acc.vouchersCount += 1;
          acc.vouchersValue += value;
        } else if (item.businessReward.mall_reward_type === "COUPON") {
          acc.couponsCount += 1;
          acc.couponsValue += value;
        }

        return acc;
      },
      {
        totalValue: 0,
        totalCount: 0,
        giftCardsCount: 0,
        giftCardsValue: 0,
        vouchersCount: 0,
        vouchersValue: 0,
        couponsCount: 0,
        couponsValue: 0,
      },
    );

    for (const reward of mallRewards) {
      const partner = partnerValues.get(reward.id);
      if (!partner) continue;

      const value =
        Number(partner.value) || Number(reward.mall_reward_value || 0);
      stats.totalValue += value;
      stats.totalCount += partner.count;

      if (reward.mall_reward_type === "GIFT_CARD") {
        stats.giftCardsCount += partner.count;
        stats.giftCardsValue += value;
      } else if (reward.mall_reward_type === "VOUCHER") {
        stats.vouchersCount += partner.count;
        stats.vouchersValue += value;
      } else if (reward.mall_reward_type === "COUPON") {
        stats.couponsCount += partner.count;
        stats.couponsValue += value;
      }
    }

    return stats;
  }

  async getParticipantMallRewardHistory(
    participantId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<PointHistory>> {
    const query = this.pointHistoryRepository
      .createQueryBuilder("ph")
      .leftJoinAndSelect("ph.business", "business")
      .leftJoinAndSelect("ph.businessReward", "businessReward")
      .leftJoin("businessReward.reward", "reward")
      .addSelect([
        "reward.id",
        "reward.title",
        "reward.image",
        "reward.description",
        "reward.reward_type",
        "reward.value",
      ])
      .where("ph.participant_id = :participantId", { participantId })
      .andWhere("(ph.type = :redeem OR ph.type = :stampRedeem)", {
        redeem: PointHistoryType.REDEEM,
        stampRedeem: PointHistoryType.STAMP_REDEEM,
      })
      .andWhere("businessReward.is_mall_integrated = :isIntegrated", {
        isIntegrated: true,
      })
      .orderBy("ph.created_at", "DESC");

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const next = page < totalPages ? Number(page) + 1 : null;
    const previous = page > 1 ? Number(page) - 1 : null;

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      next,
      previous,
    };
  }

  async getRewardsStats() {
    // Real aggregate stats across ALL rewards (not just the current page).
    const [statusRows, redemptionRow, partnerSummary] = await Promise.all([
      this.rewardRepository
        .createQueryBuilder("reward")
        .select("reward.status", "status")
        .addSelect("COUNT(reward.id)", "count")
        .groupBy("reward.status")
        .getRawMany<{ status: string; count: string }>(),
      this.pointHistoryRepository
        .createQueryBuilder("ph")
        .select("COUNT(ph.id)", "count")
        .where("ph.type IN (:...types)", {
          types: [PointHistoryType.REDEEM, PointHistoryType.STAMP_REDEEM],
        })
        .getRawOne<{ count: string }>(),
      this.partnerIssuance.getGlobalSummary(),
    ]);

    const byStatus = new Map(
      (statusRows ?? []).map((r) => [r.status, parseInt(r.count, 10) || 0]),
    );
    const active = byStatus.get("active") ?? 0;
    const draft = byStatus.get("draft") ?? 0;
    const archived = byStatus.get("archived") ?? 0;
    const total = [...byStatus.values()].reduce((s, c) => s + c, 0);

    return {
      active,
      draft,
      archived,
      total,
      totalRedemptions:
        (parseInt(redemptionRow?.count, 10) || 0) + partnerSummary.count,
    };
  }

  async countTotalRewards(businessId: string): Promise<number> {
    return this.businessRewardRepository.count({
      where: { business: { id: businessId } },
    });
  }

  async countActiveBusinessRewards(businessId: string): Promise<number> {
    return this.businessRewardRepository.count({
      where: { business: { id: businessId }, disabled: false },
    });
  }

  /**
   * Map the fulfilment DTO onto the entity's flattened columns. Keeping the
   * attachment in dedicated columns makes reconciliation/filtering queryable.
   */
  private mapFulfilmentColumns(fulfilment: any): Record<string, any> {
    if (!fulfilment) return {};
    const { provider, kind, fundingSource, templateRef, ...config } =
      fulfilment;
    return {
      fulfilment_provider: provider ?? null,
      fulfilment_kind: kind ?? null,
      fulfilment_config: config,
      fulfilment_template_id: templateRef?.id ?? null,
      fulfilment_business_ref: fulfilment.businessId ?? null,
      fulfilment_funding_source: fundingSource ?? null,
    };
  }

  /** Fields that indicate the caller is changing mall configuration. */
  private static readonly MALL_PAYLOAD_KEYS = [
    "reward_type",
    "is_mall_integrated",
    "mall_reward_type",
    "mall_reward_value",
    "mall_target_scope",
    "mall_target_product_ids",
    "mall_target_service_ids",
    "mall_discount_type",
    "mall_discount_value",
    "mall_max_discount",
    "mall_min_spend",
  ];

  private touchesMallPayload(payload: Record<string, any>): boolean {
    return RewardsService.MALL_PAYLOAD_KEYS.some(
      (key) => payload?.[key] !== undefined,
    );
  }

  private mallRewardTypeFor(
    rewardType?: RewardType | string,
  ): "VOUCHER" | "GIFT_CARD" | "COUPON" | null {
    switch (rewardType) {
      case RewardType.VOUCHER:
        return "VOUCHER";
      case RewardType.GIFT_CARD:
        return "GIFT_CARD";
      case RewardType.COUPON:
        return "COUPON";
      default:
        return null;
    }
  }

  private fulfilmentKindFor(
    rewardType?: RewardType | string,
  ): FulfilmentKind | null {
    switch (rewardType) {
      case RewardType.VOUCHER:
        return FulfilmentKind.MALL_VOUCHER;
      case RewardType.GIFT_CARD:
        return FulfilmentKind.MALL_GIFT_CARD;
      case RewardType.COUPON:
        return FulfilmentKind.MALL_COUPON;
      case RewardType.MALL_DISCOUNT:
        return FulfilmentKind.MALL_DISCOUNT;
      default:
        return null;
    }
  }

  /**
   * Derive the `mall_*` columns from the selected reward type so that a gift
   * card can never be stored/fulfilled as a mall discount (and stale values
   * from a previous type are cleared).
   */
  private resolveMallRewardFields(
    dto: Record<string, any>,
    current?: Partial<BusinessReward> | null,
  ): Record<string, any> {
    if (!this.touchesMallPayload(dto)) return {};

    const rewardType = (dto.reward_type ?? current?.reward_type) as
      | RewardType
      | undefined;
    if (!rewardType) return {};

    const pick = <T>(value: T | undefined, fallback: T): T =>
      value !== undefined ? value : fallback;
    const currentValue = (current ?? {}) as Partial<BusinessReward>;

    switch (rewardType) {
      case RewardType.VOUCHER:
      case RewardType.GIFT_CARD:
      case RewardType.COUPON: {
        const value =
          Number(pick(dto.mall_reward_value, currentValue.mall_reward_value)) ||
          0;
        const targetScope = pick(
          dto.mall_target_scope,
          currentValue.mall_target_scope ?? null,
        );
        return {
          is_mall_integrated: value > 0,
          mall_reward_type: this.mallRewardTypeFor(rewardType),
          mall_reward_value: value,
          mall_target_scope: targetScope,
          mall_target_product_ids:
            targetScope === "SPECIFIC"
              ? pick(
                  dto.mall_target_product_ids,
                  currentValue.mall_target_product_ids ?? [],
                )
              : [],
          mall_target_service_ids:
            targetScope === "SPECIFIC"
              ? pick(
                  dto.mall_target_service_ids,
                  currentValue.mall_target_service_ids ?? [],
                )
              : [],
          // These belong to mall discounts only.
          mall_discount_type: null,
          mall_discount_value: null,
          mall_max_discount: null,
          mall_min_spend: null,
        };
      }
      case RewardType.MALL_DISCOUNT: {
        const discountValue =
          Number(
            pick(dto.mall_discount_value, currentValue.mall_discount_value),
          ) || 0;
        if (discountValue <= 0) {
          throw new BadRequestException(
            "A discount value greater than 0 is required for Mall Discount rewards.",
          );
        }

        const discountType = pick(
          dto.mall_discount_type,
          currentValue.mall_discount_type ?? "percentage",
        );
        if (!["percentage", "fixed"].includes(discountType)) {
          throw new BadRequestException(
            'Mall Discount type must be either "percentage" or "fixed".',
          );
        }
        if (discountType === "percentage" && discountValue > 100) {
          throw new BadRequestException(
            "Mall Discount percentage cannot exceed 100.",
          );
        }

        const scope = pick(
          dto.mall_target_scope,
          currentValue.mall_target_scope ?? "ALL",
        );
        if (!["SPECIFIC", "ALL"].includes(scope)) {
          throw new BadRequestException(
            'Mall Discount scope must be either "SPECIFIC" or "ALL".',
          );
        }

        const productIds =
          scope === "SPECIFIC"
            ? pick(
                dto.mall_target_product_ids,
                currentValue.mall_target_product_ids ?? [],
              )
            : [];
        const serviceIds =
          scope === "SPECIFIC"
            ? pick(
                dto.mall_target_service_ids,
                currentValue.mall_target_service_ids ?? [],
              )
            : [];
        if (
          scope === "SPECIFIC" &&
          productIds.length === 0 &&
          serviceIds.length === 0
        ) {
          throw new BadRequestException(
            "Select at least one product or service for a Mall Discount reward.",
          );
        }

        return {
          is_mall_integrated: true,
          mall_reward_type: null,
          mall_reward_value: 0,
          mall_target_scope: scope,
          mall_target_product_ids: productIds,
          mall_target_service_ids: serviceIds,
          mall_discount_type: discountType,
          mall_discount_value: discountValue,
          mall_max_discount: pick(
            dto.mall_max_discount,
            currentValue.mall_max_discount ?? null,
          ),
          mall_min_spend: pick(
            dto.mall_min_spend,
            currentValue.mall_min_spend ?? null,
          ),
        };
      }
      default:
        // Point offers, physical products, etc. are not mall rewards.
        return {
          is_mall_integrated: false,
          mall_reward_type: null,
          mall_reward_value: 0,
          mall_target_scope: null,
          mall_target_product_ids: [],
          mall_target_service_ids: [],
          mall_discount_type: null,
          mall_discount_value: null,
          mall_max_discount: null,
          mall_min_spend: null,
        };
    }
  }

  /**
   * Resolve the flattened fulfilment columns. When the caller sends an explicit
   * attachment it is always used. Otherwise the columns are derived from the
   * reward type (and only when the payload touches mall configuration), so
   * partial updates never wipe an existing attachment.
   */
  private resolveFulfilmentColumns(
    dto: Record<string, any>,
    attachment?: any,
    current?: Partial<BusinessReward> | null,
  ): Record<string, any> {
    if (attachment) {
      return this.mapFulfilmentColumns(attachment);
    }

    if (!this.touchesMallPayload(dto)) return {};

    const rewardType = (dto.reward_type ?? current?.reward_type) as
      | RewardType
      | undefined;
    const kind = this.fulfilmentKindFor(rewardType);
    const isMallDiscount = rewardType === RewardType.MALL_DISCOUNT;
    const rewardValue = Number(
      dto.mall_reward_value ?? current?.mall_reward_value ?? 0,
    );
    const isMallIntegrated =
      isMallDiscount ||
      ((dto.is_mall_integrated ?? current?.is_mall_integrated) === true &&
        rewardValue > 0);

    if (!kind || !isMallIntegrated) {
      return {
        fulfilment_provider: null,
        fulfilment_kind: null,
        fulfilment_config: null,
        fulfilment_template_id: null,
        fulfilment_business_ref: null,
        fulfilment_funding_source: null,
      };
    }

    return {
      fulfilment_provider: FulfilmentProvider.MALL,
      fulfilment_kind: kind,
    };
  }
}
