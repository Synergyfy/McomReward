import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tier } from "../tier/entities/tier.entity";
import { TierType } from "../tier/entities/tier-type.enum";
import { TierStatus } from "../tier/entities/tier-status.enum";
import { TierHistory } from "../tier/entities/tier-history.entity";
import { Season } from "../season/entities/season.entity";
import { CreateSystemPlanDto } from "./dto/create-system-plan.dto";
import { UpdateSystemPlanDto } from "./dto/update-system-plan.dto";

@Injectable()
export class SystemPlansService {
  constructor(
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
    @InjectRepository(TierHistory)
    private readonly tierHistoryRepository: Repository<TierHistory>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
  ) {}

  private mapTypeToInternal(type?: string): TierType | undefined {
    if (!type) return undefined;
    const map: Record<string, TierType> = {
      STANDARD: TierType.STANDARD,
      TRIAL: TierType.TRIAL,
      SEASONAL: TierType.SEASONAL,
    };
    return map[type.toUpperCase()];
  }

  private mapTypeToExternal(type: TierType): string {
    const map: Record<string, string> = {
      [TierType.STANDARD]: "STANDARD",
      [TierType.TRIAL]: "TRIAL",
      [TierType.SEASONAL]: "SEASONAL",
    };
    return map[type] || "STANDARD";
  }

  private mapStatusToActive(status: TierStatus): boolean {
    return status === TierStatus.PUBLISHED;
  }

  private mapActiveToStatus(isActive: boolean): TierStatus {
    return isActive ? TierStatus.PUBLISHED : TierStatus.DRAFT;
  }

  private toExternalResponse(tier: Tier) {
    return {
      id: tier.id,
      name: tier.name,
      description: tier.description || null,
      monthlyPrice: Number(tier.monthly_price),
      quarterlyPrice: Number(tier.quarterly_price),
      annualPrice: Number(tier.annual_price),
      features: tier.features || [],
      configuration: tier.configuration || null,
      isActive: this.mapStatusToActive(tier.status),
      isDefault: tier.is_default || false,
      type: this.mapTypeToExternal(tier.type),
      trialDuration:
        tier.type === TierType.TRIAL
          ? tier.configuration?.trial?.trialDuration || null
          : null,
      seasonId: tier.season_id || null,
      stripeMonthlyPriceId: tier.stripe_monthly_price_id || null,
      stripeQuarterlyPriceId: tier.stripe_quarterly_price_id || null,
      stripeAnnualPriceId: tier.stripe_annual_price_id || null,
      paypalMonthlyPlanId: tier.paypal_monthly_plan_id || null,
      paypalQuarterlyPlanId: tier.paypal_quarterly_plan_id || null,
      paypalAnnualPlanId: tier.paypal_annual_plan_id || null,
      created_at: tier.created_at,
      updated_at: tier.updated_at,
    };
  }

  private async clearDefaultFlag() {
    await this.tierRepository.update(
      { is_default: true },
      { is_default: false },
    );
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  async create(dto: CreateSystemPlanDto) {
    const existing = await this.tierRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException("Tier with this name already exists");
    }

    const planType = this.mapTypeToInternal(dto.type) || TierType.STANDARD;

    if (planType === TierType.TRIAL) {
      const existingTrial = await this.tierRepository.findOne({
        where: { type: TierType.TRIAL },
      });
      if (existingTrial) {
        throw new ConflictException(
          "A trial tier already exists. Only one trial tier is allowed.",
        );
      }
      if (!dto.trialDuration || dto.trialDuration <= 0) {
        throw new BadRequestException(
          "trialDuration is required and must be greater than 0 for trial plans",
        );
      }
    }

    if (planType === TierType.SEASONAL) {
      if (!dto.seasonId) {
        throw new BadRequestException(
          "seasonId is required for seasonal plans",
        );
      }
      const season = await this.seasonRepository.findOne({
        where: { id: dto.seasonId },
      });
      if (!season) {
        throw new BadRequestException("Invalid seasonId: season not found");
      }
    }

    if (dto.isDefault) {
      await this.clearDefaultFlag();
    }

    const configuration = this.deepMerge(
      {},
      dto.configuration || {},
    );
    if (planType === TierType.TRIAL && dto.trialDuration) {
      configuration.trial = {
        ...configuration.trial,
        trialDuration: dto.trialDuration,
      };
    }

    try {
      const tier = this.tierRepository.create({
        name: dto.name,
        description: dto.description,
        type: planType,
        monthly_price: dto.monthlyPrice,
        quarterly_price: dto.quarterlyPrice,
        annual_price: dto.annualPrice,
        features: dto.features,
        configuration,
        status: this.mapActiveToStatus(dto.isActive !== false),
        is_default: dto.isDefault || false,
        season_id: planType === TierType.SEASONAL ? dto.seasonId : null,
        stripe_monthly_price_id: dto.stripeMonthlyPriceId,
        stripe_quarterly_price_id: dto.stripeQuarterlyPriceId,
        stripe_annual_price_id: dto.stripeAnnualPriceId,
        paypal_monthly_plan_id: dto.paypalMonthlyPlanId,
        paypal_quarterly_plan_id: dto.paypalQuarterlyPlanId,
        paypal_annual_plan_id: dto.paypalAnnualPlanId,
      });

      const savedTier = await this.tierRepository.save(tier);

      const history = this.tierHistoryRepository.create({
        name: savedTier.name,
        monthly_price: savedTier.monthly_price,
        quarterly_price: savedTier.quarterly_price,
        annual_price: savedTier.annual_price,
        features: savedTier.features,
        status: savedTier.status,
        tier: savedTier,
        admin: null,
      });
      await this.tierHistoryRepository.save(history);

      return this.toExternalResponse(savedTier);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create plan: ${error.message}`,
      );
    }
  }

  async findAll() {
    const tiers = await this.tierRepository.find({
      relations: ["season"],
      order: { created_at: "DESC" },
    });
    return tiers.map((tier) => this.toExternalResponse(tier));
  }

  async findOne(id: string) {
    const tier = await this.tierRepository.findOne({
      where: { id },
      relations: ["season"],
    });
    if (!tier) {
      throw new NotFoundException("Plan not found");
    }
    return this.toExternalResponse(tier);
  }

  async update(id: string, dto: UpdateSystemPlanDto) {
    const tier = await this.tierRepository.findOne({
      where: { id },
      relations: ["season"],
    });
    if (!tier) {
      throw new NotFoundException("Plan not found");
    }

    if (dto.name && dto.name !== tier.name) {
      const existing = await this.tierRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException("Tier with this name already exists");
      }
    }

    const planType = dto.type
      ? this.mapTypeToInternal(dto.type)
      : tier.type;

    if (planType === TierType.TRIAL) {
      if (dto.trialDuration !== undefined && dto.trialDuration <= 0) {
        throw new BadRequestException(
          "trialDuration must be greater than 0 for trial plans",
        );
      }
      if (tier.type !== TierType.TRIAL) {
        const existingTrial = await this.tierRepository.findOne({
          where: { type: TierType.TRIAL },
        });
        if (existingTrial) {
          throw new ConflictException(
            "A trial tier already exists. Only one trial tier is allowed.",
          );
        }
      }
    }

    if (planType === TierType.SEASONAL && dto.seasonId) {
      const season = await this.seasonRepository.findOne({
        where: { id: dto.seasonId },
      });
      if (!season) {
        throw new BadRequestException("Invalid seasonId: season not found");
      }
    }

    if (dto.isDefault !== undefined && dto.isDefault) {
      await this.clearDefaultFlag();
    }

    const updateData: Partial<Tier> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.monthlyPrice !== undefined) updateData.monthly_price = dto.monthlyPrice;
    if (dto.quarterlyPrice !== undefined) updateData.quarterly_price = dto.quarterlyPrice;
    if (dto.annualPrice !== undefined) updateData.annual_price = dto.annualPrice;
    if (dto.features !== undefined) updateData.features = dto.features;
    if (dto.isActive !== undefined) updateData.status = this.mapActiveToStatus(dto.isActive);
    if (dto.isDefault !== undefined) updateData.is_default = dto.isDefault;
    if (dto.type !== undefined) updateData.type = planType;
    if (dto.stripeMonthlyPriceId !== undefined) updateData.stripe_monthly_price_id = dto.stripeMonthlyPriceId;
    if (dto.stripeQuarterlyPriceId !== undefined) updateData.stripe_quarterly_price_id = dto.stripeQuarterlyPriceId;
    if (dto.stripeAnnualPriceId !== undefined) updateData.stripe_annual_price_id = dto.stripeAnnualPriceId;
    if (dto.paypalMonthlyPlanId !== undefined) updateData.paypal_monthly_plan_id = dto.paypalMonthlyPlanId;
    if (dto.paypalQuarterlyPlanId !== undefined) updateData.paypal_quarterly_plan_id = dto.paypalQuarterlyPlanId;
    if (dto.paypalAnnualPlanId !== undefined) updateData.paypal_annual_plan_id = dto.paypalAnnualPlanId;
    if (dto.seasonId !== undefined) updateData.season_id = dto.seasonId;

    if (dto.configuration !== undefined || dto.trialDuration !== undefined) {
      const configuration: any = this.deepMerge(
        tier.configuration || {},
        dto.configuration || {},
      );
      if (planType === TierType.TRIAL && dto.trialDuration) {
        configuration.trial = {
          ...configuration.trial,
          trialDuration: dto.trialDuration,
        };
      }
      updateData.configuration = configuration;
    }

    try {
      await this.tierRepository.update(id, updateData);
      const updatedTier = await this.tierRepository.findOne({
        where: { id },
        relations: ["season"],
      });

      const history = this.tierHistoryRepository.create({
        name: updatedTier.name,
        monthly_price: updatedTier.monthly_price,
        quarterly_price: updatedTier.quarterly_price,
        annual_price: updatedTier.annual_price,
        features: updatedTier.features,
        status: updatedTier.status,
        tier: updatedTier,
        admin: null,
      });
      await this.tierHistoryRepository.save(history);

      return this.toExternalResponse(updatedTier);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update plan: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    const tier = await this.tierRepository.findOne({ where: { id } });
    if (!tier) {
      throw new NotFoundException("Plan not found");
    }

    await this.tierRepository.softDelete(id);

    const history = this.tierHistoryRepository.create({
      name: tier.name,
      monthly_price: tier.monthly_price,
      quarterly_price: tier.quarterly_price,
      annual_price: tier.annual_price,
      features: tier.features,
      status: tier.status,
      tier: tier,
      admin: null,
    });
    await this.tierHistoryRepository.save(history);

    return { message: "Plan deleted successfully" };
  }
}
