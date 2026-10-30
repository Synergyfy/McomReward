import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reward } from "../../rewards/entities/reward.entity";
import { RewardStatus } from "../../rewards/enums/reward-status.enum";
import { BusinessReward } from "../../rewards/entities/business-reward.entity";
import { Business } from "../../business/entities/business.entity";
import { ListPartnerRewardsDto } from "../dto/list-partner-rewards.dto";
import { ListBusinessRewardsDto } from "../dto/list-business-rewards.dto";
import { RewardFulfilmentService } from "../../reward-fulfilment/reward-fulfilment.service";
import { FulfilmentKind } from "../../reward-fulfilment/reward-fulfilment.enums";

/**
 * Read-only reward catalogue exposed to ecosystem partners. Returns a stable,
 * partner-friendly DTO rather than the internal entity shape.
 */
@Injectable()
export class PartnerRewardsService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(BusinessReward)
    private readonly businessRewardRepository: Repository<BusinessReward>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly fulfilment: RewardFulfilmentService,
  ) {}

  async listCatalog(query: ListPartnerRewardsDto): Promise<any> {
    const {
      page = 1,
      limit = 20,
      search,
      rewardType,
      audience,
      source,
    } = query;

    const qb = this.rewardRepository
      .createQueryBuilder("reward")
      .where("reward.disabled = :disabled", { disabled: false })
      .andWhere("reward.status = :status", { status: RewardStatus.ACTIVE });

    if (search) {
      qb.andWhere(
        "(reward.title ILIKE :search OR reward.description ILIKE :search)",
        { search: `%${search}%` },
      );
    }
    if (rewardType) {
      qb.andWhere("reward.reward_type = :rewardType", { rewardType });
    }
    if (audience) {
      qb.andWhere("reward.audience = :audience", { audience });
    }
    if (source) {
      qb.andWhere("reward.reward_source = :source", { source });
    }

    qb.orderBy("reward.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((reward) => this.toCatalogDto(reward)),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCatalogReward(id: string): Promise<any> {
    const reward = await this.rewardRepository.findOne({ where: { id } });
    if (!reward || reward.disabled) {
      throw new NotFoundException(`Reward ${id} not found`);
    }
    return this.toCatalogDto(reward);
  }

  /**
   * List the rewards a specific business owns (its `BusinessReward` set — the
   * rewards the business has added to itself). Identify the business by MCOM
   * user id (preferred) or email.
   */
  async listBusinessRewards(query: ListBusinessRewardsDto): Promise<any> {
    const { page = 1, limit = 20, search, status, rewardType } = query;

    if (!query.mcomUserId && !query.email) {
      throw new BadRequestException(
        "Provide either mcomUserId or email to identify the business",
      );
    }

    const business = await this.resolveBusiness(query);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    const qb = this.businessRewardRepository
      .createQueryBuilder("br")
      .leftJoinAndSelect("br.reward", "reward")
      .where("br.business_id = :businessId", { businessId: business.id });

    if (search) {
      qb.andWhere("(br.title ILIKE :search OR br.description ILIKE :search)", {
        search: `%${search}%`,
      });
    }
    if (status) {
      qb.andWhere("br.status = :status", { status });
    }
    if (rewardType) {
      qb.andWhere("br.reward_type = :rewardType", { rewardType });
    }

    qb.orderBy("br.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        mcomUserId: business.mcomUserId ?? null,
      },
      data: data.map((br) => this.toBusinessRewardDto(br, business.id)),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  private async resolveBusiness(query: {
    mcomUserId?: string;
    email?: string;
  }): Promise<Business | null> {
    if (query.mcomUserId) {
      const byMcom = await this.businessRepository.findOne({
        where: { mcomUserId: query.mcomUserId },
      });
      if (byMcom) return byMcom;
    }
    if (query.email) {
      const byEmail = await this.businessRepository.findOne({
        where: { email: query.email.toLowerCase().trim() },
      });
      if (byEmail) return byEmail;
    }
    return null;
  }

  private toCatalogDto(reward: Reward): Record<string, any> {
    return {
      id: reward.id,
      title: reward.title,
      description: reward.description,
      image: reward.image,
      gallery: reward.gallery,
      rewardType: reward.reward_type,
      source: reward.reward_source,
      audience: reward.audience,
      status: reward.status,
      value: Number(reward.value),
      maxPoints: reward.max_points,
      maxStampsRequired: reward.max_stamps_required,
      isPointsEnabled: reward.is_points_enabled,
      isStampsEnabled: reward.is_stamps_enabled,
      quantity: reward.quantity,
      expiresAt: reward.expiry_datetime,
      updatedAt: reward.updated_at,
      ...this.fulfilmentDescriptor(reward),
    };
  }

  private toBusinessRewardDto(
    br: BusinessReward,
    businessId: string,
  ): Record<string, any> {
    return {
      id: br.id,
      businessId,
      title: br.title,
      description: br.description,
      image: br.image,
      gallery: br.gallery,
      rewardType: br.reward_type,
      source: br.reward_source,
      audience: br.audience,
      status: br.status,
      quantity: br.quantity,
      remainingQuantity: br.remaining_quantity,
      pointsRequired: br.points_required,
      stampsRequired: br.stamps_required,
      isPointsEnabled: br.is_points_enabled,
      isStampsEnabled: br.is_stamps_enabled,
      isMallIntegrated: br.is_mall_integrated,
      mallRewardValue: Number(br.mall_reward_value) || 0,
      mallRewardType: br.mall_reward_type,
      sourceRewardId: br.reward?.id ?? null,
      expiresAt: br.expiry_datetime,
      createdAt: br.created_at,
      updatedAt: br.updated_at,
      ...this.fulfilmentDescriptor(br),
    };
  }

  /**
   * The single source of truth for "who delivers this reward and who may claim
   * it". Partners (FOD) use these fields to label the reward picker and to
   * reject invalid campaign/audience combinations before issuing anything.
   *
   * Eligibility is derived from the fulfilment *kind* — never the cosmetic
   * `rewardType` — and falls back to the legacy `audience` column for rewards
   * that predate the fulfilment taxonomy.
   */
  private fulfilmentDescriptor(source: {
    fulfilment_provider?: string | null;
    fulfilment_kind?: string | null;
    fulfilment_config?: Record<string, any> | null;
    audience?: string | null;
  }): Record<string, any> {
    const provider = source.fulfilment_provider ?? null;
    const kind = source.fulfilment_kind ?? null;
    const config = source.fulfilment_config ?? null;

    const central = this.isCentralKind(kind);
    const mall =
      kind === FulfilmentKind.MALL_DISCOUNT ||
      kind === FulfilmentKind.MALL_GIFT_CARD ||
      kind === FulfilmentKind.MALL_VOUCHER ||
      kind === FulfilmentKind.MALL_COUPON;
    const legacyAudience = (source.audience ?? "").toLowerCase();

    // Central rewards are business-only. Mall rewards can be claimed by either
    // audience, unless the legacy audience column narrows them.
    let consumerEligible: boolean;
    let businessEligible: boolean;
    if (central) {
      consumerEligible = false;
      businessEligible = true;
    } else if (mall) {
      consumerEligible = legacyAudience !== "business";
      businessEligible = legacyAudience !== "consumer";
    } else {
      consumerEligible = legacyAudience !== "business";
      businessEligible = legacyAudience !== "consumer";
    }

    return {
      fulfilmentProvider: provider,
      fulfilmentKind: kind,
      // Never echo internal funding/business-identity fields to partners.
      fulfilmentConfig: this.sanitiseFulfilmentConfig(config),
      consumerEligible,
      businessEligible,
      deepLink: kind
        ? this.fulfilment.getDeepLink({
            fulfilment_kind: kind,
            metadata: config ?? {},
          })
        : null,
    };
  }

  private isCentralKind(kind: string | null): boolean {
    return typeof kind === "string" && kind.startsWith("CENTRAL_");
  }

  private sanitiseFulfilmentConfig(
    config: Record<string, any> | null,
  ): Record<string, any> | null {
    if (!config || typeof config !== "object") return null;
    const {
      businessMcomUserId: _businessMcomUserId,
      metadata: _metadata,
      ...safe
    } = config as Record<string, any>;
    return safe;
  }
}
