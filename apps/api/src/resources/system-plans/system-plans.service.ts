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
import { PlansService } from "../plans/plans.service";
import { Plan } from "../plans/entities/plan.entity";
import { PlanTierLevelEnum } from "../plans/entities/plan-tier-level.entity";
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
    private readonly plansService: PlansService,
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

  private toExternalUnifiedPlanResponse(plan: Plan) {
    const variants = (plan.variants || []).map((v) => {
      const activePrice = v.prices?.find((p) => p.isActive) || v.prices?.[0];
      const level = v.tierLevel?.name;
      const label =
        level === PlanTierLevelEnum.PRO_PLUS
          ? "Pro+"
          : level === PlanTierLevelEnum.PRO
          ? "Pro"
          : "Standard";
      const amount = activePrice?.amount != null ? Number(activePrice.amount) : undefined;

      return {
        id: v.id,
        planId: plan.id,
        tier: label,
        tierName: label,
        tierLevel: v.tierLevel,
        durationDays: v.tierLevel?.durationDays || (v.tierLevel?.isCalendarYear ? 365 : 90),
        isCalendarYear: v.tierLevel?.isCalendarYear || false,
        price: amount,
        features: v.features || [],
        configuration: v.configuration || {},
        isActive: v.isActive && plan.isActive,
        stripePriceId: activePrice?.stripePriceId || null,
        paypalPlanId: activePrice?.paypalPlanId || null,
        prices: v.prices || [],
        createdAt: v.created_at,
        updatedAt: v.updated_at,
        created_at: v.created_at,
        updated_at: v.updated_at,
      };
    });

    const standardVariant = variants.find((v) => v.tier === "Standard") || variants[0];
    const proVariant = variants.find((v) => v.tier === "Pro");
    const proPlusVariant = variants.find((v) => v.tier === "Pro+");

    const tierPrices: Record<string, number> = {};
    const tierFeatures: Record<string, string[]> = {};
    for (const v of variants) {
      if (v.price != null) tierPrices[v.tier] = v.price;
      if (v.features) tierFeatures[v.tier] = v.features;
    }

    const tierDurations: Record<string, number> = {
      Standard: standardVariant?.durationDays || 90,
      Pro: proVariant?.durationDays || 180,
      "Pro+": proPlusVariant?.durationDays || 365,
    };

    const standardPrice = standardVariant?.price ?? 0;
    const proPrice = proVariant?.price ?? standardPrice;
    const proPlusPrice = proPlusVariant?.price ?? proPrice;

    return {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description || null,
      variants,
      tierPrices,
      tierFeatures,
      tierDurations,
      monthlyPrice: standardPrice,
      quarterlyPrice: proPrice,
      annualPrice: proPlusPrice,
      features: standardVariant?.features || [],
      configuration: standardVariant?.configuration || {},
      isActive: plan.isActive,
      isDefault: false,
      type: "STANDARD",
      trialDuration: null,
      seasonId: null,
      stripeMonthlyPriceId: standardVariant?.stripePriceId || null,
      stripeQuarterlyPriceId: proVariant?.stripePriceId || null,
      stripeAnnualPriceId: proPlusVariant?.stripePriceId || null,
      paypalMonthlyPlanId: standardVariant?.paypalPlanId || null,
      paypalQuarterlyPlanId: proVariant?.paypalPlanId || null,
      paypalAnnualPlanId: proPlusVariant?.paypalPlanId || null,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    };
  }

  async findAll() {
    // 1. Fetch all unified Plans with nested variants
    const unifiedPlans = await this.plansService.findAll();
    if (unifiedPlans && unifiedPlans.length > 0) {
      return unifiedPlans.map((plan) => this.toExternalUnifiedPlanResponse(plan));
    }

    // Fallback to legacy tiers if no unified plans exist
    const tiers = await this.tierRepository.find({
      relations: ["season"],
      order: { created_at: "DESC" },
    });
    return tiers.map((tier) => this.toExternalResponse(tier));
  }

  async findOne(id: string) {
    // 1. Try unified Plan directly by plan ID
    try {
      const plan = await this.plansService.findOne(id);
      if (plan) {
        return this.toExternalUnifiedPlanResponse(plan);
      }
    } catch {
      // Not a plan ID, try variant resolution
    }

    // 2. Try variant ID
    try {
      const { variant } = await this.plansService.resolveActivePrice(id);
      if (variant?.plan) {
        const fullPlan = await this.plansService.findOne(variant.plan.id);
        return this.toExternalUnifiedPlanResponse(fullPlan);
      }
    } catch {
      // Not a variant ID, fallback to legacy tier
    }

    // 3. Fallback to legacy Tier lookup
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
    // Check if it's a unified plan
    try {
      const plan = await this.plansService.findOne(id);
      if (plan) {
        const updated = await this.plansService.update(id, {
          name: dto.name,
          description: dto.description,
          isActive: dto.isActive,
        });
        return this.toExternalUnifiedPlanResponse(updated);
      }
    } catch {
      // Fallback to legacy tier update
    }

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
    try {
      const plan = await this.plansService.findOne(id);
      if (plan) {
        return await this.plansService.remove(id);
      }
    } catch {
      // Fallback to legacy tier delete
    }

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

  async getPlanSchema() {
    return {
      quotas: [
        { key: "maxActiveCampaigns", label: "Max Active Campaigns", type: "number", unlimited: true },
        { key: "maxActiveRewards", label: "Max Active Rewards", type: "number", unlimited: true },
        { key: "maxRewardsPerCampaign", label: "Max Rewards Per Campaign", type: "number" },
        { key: "monthlyPointsAllowance", label: "Monthly Points Allowance", type: "number" },
        { key: "monthlyStampsAllowance", label: "Monthly Stamps Allowance", type: "number" },
        { key: "maxTeamMembers", label: "Max Team Members", type: "number" },
      ],
      featureFlags: [
        { key: "canCreateCampaignFromScratch", label: "Create Campaign From Scratch", type: "boolean" },
        { key: "canEditAdminTemplates", label: "Edit Admin Templates", type: "boolean" },
        { key: "hasAccessToAdvancedAnalytics", label: "Advanced Analytics", type: "boolean" },
        { key: "hasAccessToCRM", label: "CRM Access", type: "boolean" },
        { key: "canUpdateReward", label: "Update Reward", type: "boolean" },
      ],
    };
  }

  async getSeasons() {
    const seasons = await this.seasonRepository.find({
      order: { created_at: "DESC" },
    });
    const now = new Date();
    return seasons.map((s) => {
      const isActive = s.startDate <= now && s.endDate >= now;
      const status = isActive
        ? "ACTIVE"
        : s.endDate < now
        ? "EXPIRED"
        : "UPCOMING";
      return {
        id: s.id,
        name: s.name,
        startDate: s.startDate,
        endDate: s.endDate,
        isActive,
        status,
      };
    });
  }
}
