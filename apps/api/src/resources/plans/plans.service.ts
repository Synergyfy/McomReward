import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Plan } from "./entities/plan.entity";
import { PlanTierLevel, PlanTierLevelEnum } from "./entities/plan-tier-level.entity";
import { PlanVariant } from "./entities/plan-variant.entity";
import { PlanPrice } from "./entities/plan-price.entity";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";
import { AddPlanPriceDto } from "./dto/add-plan-price.dto";

@Injectable()
export class PlansService implements OnModuleInit {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(PlanTierLevel)
    private readonly tierLevelRepository: Repository<PlanTierLevel>,
    @InjectRepository(PlanVariant)
    private readonly variantRepository: Repository<PlanVariant>,
    @InjectRepository(PlanPrice)
    private readonly priceRepository: Repository<PlanPrice>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      await this.seedTierLevels();
      await this.seedDefaultPlans();
    } catch (err) {
      this.logger.warn(`Deferred plan seeding (database may be pending migrations): ${err?.message}`);
    }
  }

  private async seedTierLevels() {
    const existingCount = await this.tierLevelRepository.count();
    if (existingCount > 0) return;

    this.logger.log("Seeding default PlanTierLevels (STANDARD, PRO, PRO_PLUS)...");
    const levels = [
      {
        name: PlanTierLevelEnum.STANDARD,
        sortOrder: 1,
        durationDays: 90,
        isCalendarYear: false,
      },
      {
        name: PlanTierLevelEnum.PRO,
        sortOrder: 2,
        durationDays: 180,
        isCalendarYear: false,
      },
      {
        name: PlanTierLevelEnum.PRO_PLUS,
        sortOrder: 3,
        durationDays: null,
        isCalendarYear: true,
      },
    ];

    for (const lvl of levels) {
      const entity = this.tierLevelRepository.create(lvl);
      await this.tierLevelRepository.save(entity);
    }
  }

  private async seedDefaultPlans() {
    const planCount = await this.planRepository.count();
    if (planCount > 0) return;

    this.logger.log("Seeding default MCOM Rewards Plans...");

    const defaultPlans: CreatePlanDto[] = [
      {
        name: "Starter Plan",
        slug: "starter-plan",
        description: "Ideal for small businesses initiating their digital loyalty and stamp programs.",
        isActive: true,
        variants: [
          {
            tier: PlanTierLevelEnum.STANDARD,
            price: 29.99,
            features: [
              "Up to 3 Active Campaigns",
              "Standard Digital Stamp Cards",
              "Basic Customer Analytics",
              "Email Support",
            ],
            configuration: {
              quotas: {
                maxActiveCampaigns: 3,
                maxActiveRewards: 5,
                maxRewardsPerCampaign: 2,
                monthlyPointsAllowance: 1000,
                monthlyStampsAllowance: 500,
                maxTeamMembers: 2,
                maxGiftCardTemplates: 2,
                maxCouponTemplates: 3,
              },
              featureFlags: {
                canCreateCampaignFromScratch: true,
                canEditAdminTemplates: false,
                hasAccessToAdvancedAnalytics: false,
                hasAccessToCRM: false,
                canUpdateReward: true,
                priorityInSearch: false,
                allowCustomBranding: false,
              },
            },
          },
          {
            tier: PlanTierLevelEnum.PRO,
            price: 49.99,
            features: [
              "Up to 5 Active Campaigns",
              "Custom Stamp Cards & Coupons",
              "Enhanced Analytics Dashboard",
              "Priority Support",
            ],
            configuration: {
              quotas: {
                maxActiveCampaigns: 5,
                maxActiveRewards: 10,
                maxRewardsPerCampaign: 4,
                monthlyPointsAllowance: 3000,
                monthlyStampsAllowance: 1500,
                maxTeamMembers: 4,
                maxGiftCardTemplates: 5,
                maxCouponTemplates: 6,
              },
              featureFlags: {
                canCreateCampaignFromScratch: true,
                canEditAdminTemplates: true,
                hasAccessToAdvancedAnalytics: true,
                hasAccessToCRM: false,
                canUpdateReward: true,
                priorityInSearch: true,
                allowCustomBranding: true,
              },
            },
          },
          {
            tier: PlanTierLevelEnum.PRO_PLUS,
            price: 89.99,
            features: [
              "Unlimited Campaigns & Rewards",
              "Full CRM Integration",
              "1 Year VIP Coverage & Account Manager",
              "Custom Storefront Branding",
            ],
            configuration: {
              quotas: {
                maxActiveCampaigns: -1,
                maxActiveRewards: -1,
                maxRewardsPerCampaign: -1,
                monthlyPointsAllowance: 10000,
                monthlyStampsAllowance: 5000,
                maxTeamMembers: 10,
                maxGiftCardTemplates: 20,
                maxCouponTemplates: 20,
              },
              featureFlags: {
                canCreateCampaignFromScratch: true,
                canEditAdminTemplates: true,
                hasAccessToAdvancedAnalytics: true,
                hasAccessToCRM: true,
                canUpdateReward: true,
                priorityInSearch: true,
                allowCustomBranding: true,
              },
            },
          },
        ],
      },
      {
        name: "Growth Plan",
        slug: "growth-plan",
        description: "For expanding retailers and service chains wanting multi-channel customer rewards.",
        isActive: true,
        variants: [
          {
            tier: PlanTierLevelEnum.STANDARD,
            price: 59.99,
            features: [
              "Up to 10 Active Campaigns",
              "Advanced Points & Stamp Multipliers",
              "Realtime Campaign Analytics",
              "Dedicated Account Manager",
            ],
            configuration: {
              quotas: {
                maxActiveCampaigns: 10,
                maxActiveRewards: 20,
                maxRewardsPerCampaign: 8,
                monthlyPointsAllowance: 15000,
                monthlyStampsAllowance: 7500,
                maxTeamMembers: 8,
                maxGiftCardTemplates: 15,
                maxCouponTemplates: 15,
              },
              featureFlags: {
                canCreateCampaignFromScratch: true,
                canEditAdminTemplates: true,
                hasAccessToAdvancedAnalytics: true,
                hasAccessToCRM: true,
                canUpdateReward: true,
                priorityInSearch: true,
                allowCustomBranding: true,
              },
            },
          },
          {
            tier: PlanTierLevelEnum.PRO,
            price: 99.99,
            features: [
              "Up to 25 Active Campaigns",
              "Omni-channel Customer CRM",
              "Automated Circular Rewards",
              "24/7 Priority Support",
            ],
            configuration: {
              quotas: {
                maxActiveCampaigns: 25,
                maxActiveRewards: 50,
                maxRewardsPerCampaign: 15,
                monthlyPointsAllowance: 35000,
                monthlyStampsAllowance: 18000,
                maxTeamMembers: 15,
                maxGiftCardTemplates: 30,
                maxCouponTemplates: 30,
              },
              featureFlags: {
                canCreateCampaignFromScratch: true,
                canEditAdminTemplates: true,
                hasAccessToAdvancedAnalytics: true,
                hasAccessToCRM: true,
                canUpdateReward: true,
                priorityInSearch: true,
                allowCustomBranding: true,
              },
            },
          },
          {
            tier: PlanTierLevelEnum.PRO_PLUS,
            price: 179.99,
            features: [
              "Unlimited Everything for 1 Year",
              "Dedicated Customer Success Specialist",
              "White-label Card Customization",
              "Priority Placement in Ecosystem",
            ],
            configuration: {
              quotas: {
                maxActiveCampaigns: -1,
                maxActiveRewards: -1,
                maxRewardsPerCampaign: -1,
                monthlyPointsAllowance: 100000,
                monthlyStampsAllowance: 50000,
                maxTeamMembers: 50,
                maxGiftCardTemplates: 100,
                maxCouponTemplates: 100,
              },
              featureFlags: {
                canCreateCampaignFromScratch: true,
                canEditAdminTemplates: true,
                hasAccessToAdvancedAnalytics: true,
                hasAccessToCRM: true,
                canUpdateReward: true,
                priorityInSearch: true,
                allowCustomBranding: true,
              },
            },
          },
        ],
      },
    ];

    for (const planDto of defaultPlans) {
      try {
        await this.create(planDto);
      } catch (e) {
        this.logger.error(`Error seeding plan ${planDto.name}: ${e.message}`);
      }
    }
  }

  private assertExactlyThreeTiers(dto: CreatePlanDto) {
    if (!dto.variants || dto.variants.length !== 3) {
      throw new BadRequestException("A Plan must be configured with exactly 3 variants (STANDARD, PRO, PRO_PLUS).");
    }

    const tiers = new Set(dto.variants.map((v) => v.tier));
    if (
      !tiers.has(PlanTierLevelEnum.STANDARD) ||
      !tiers.has(PlanTierLevelEnum.PRO) ||
      !tiers.has(PlanTierLevelEnum.PRO_PLUS)
    ) {
      throw new BadRequestException("Variants must include STANDARD (90d), PRO (180d), and PRO_PLUS (1yr).");
    }
  }

  async create(dto: CreatePlanDto): Promise<Plan> {
    this.assertExactlyThreeTiers(dto);

    const existing = await this.planRepository.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Plan with slug "${dto.slug}" already exists`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const plan = queryRunner.manager.create(Plan, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isActive: dto.isActive !== false,
      });
      const savedPlan = await queryRunner.manager.save(plan);

      const tierLevels = await queryRunner.manager.find(PlanTierLevel);

      for (const vDto of dto.variants) {
        const tierLevel = tierLevels.find((t) => t.name === vDto.tier);
        if (!tierLevel) {
          throw new BadRequestException(`Tier level ${vDto.tier} not found in database`);
        }

        const variant = queryRunner.manager.create(PlanVariant, {
          planId: savedPlan.id,
          tierLevelId: tierLevel.id,
          configuration: vDto.configuration || { quotas: {}, featureFlags: {} },
          features: vDto.features || [],
          isActive: true,
        });
        const savedVariant = await queryRunner.manager.save(variant);

        const price = queryRunner.manager.create(PlanPrice, {
          planVariantId: savedVariant.id,
          amount: Number(vDto.price),
          currency: "GBP",
          isActive: true,
          effectiveFrom: new Date(),
          effectiveTo: null,
        });
        await queryRunner.manager.save(price);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedPlan.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Plan[]> {
    return this.planRepository.find({
      where: { isActive: true },
      relations: [
        "variants",
        "variants.tierLevel",
        "variants.prices",
      ],
      order: { created_at: "ASC" },
    });
  }

  async findAllAdmin(): Promise<Plan[]> {
    return this.planRepository.find({
      relations: [
        "variants",
        "variants.tierLevel",
        "variants.prices",
      ],
      order: { created_at: "ASC" },
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: [
        "variants",
        "variants.tierLevel",
        "variants.prices",
      ],
    });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async findBySlug(slug: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { slug },
      relations: [
        "variants",
        "variants.tierLevel",
        "variants.prices",
      ],
    });
    if (!plan) {
      throw new NotFoundException(`Plan with slug ${slug} not found`);
    }
    return plan;
  }

  async resolveActivePrice(variantIdOrPlanId: string): Promise<{ variant: PlanVariant; price: PlanPrice }> {
    // 1. First check if ID matches a PlanVariant
    const variant = await this.variantRepository.findOne({
      where: { id: variantIdOrPlanId },
      relations: ["plan", "tierLevel", "prices"],
    });

    if (variant) {
      const activePrice = variant.prices?.find((p) => p.isActive) || variant.prices?.[0];
      if (!activePrice) {
        throw new NotFoundException(`No active price configured for variant ${variant.id}`);
      }
      return { variant, price: activePrice };
    }

    // 2. If not a variant ID, check if it's a Plan ID and return its Standard variant
    const plan = await this.planRepository.findOne({
      where: { id: variantIdOrPlanId },
      relations: ["variants", "variants.tierLevel", "variants.prices"],
    });

    if (plan && plan.variants?.length > 0) {
      const defaultVariant =
        plan.variants.find((v) => v.tierLevel?.name === PlanTierLevelEnum.STANDARD) ||
        plan.variants[0];
      const activePrice =
        defaultVariant.prices?.find((p) => p.isActive) || defaultVariant.prices?.[0];
      if (!activePrice) {
        throw new NotFoundException(`No active price configured for plan ${plan.id}`);
      }
      return { variant: defaultVariant, price: activePrice };
    }

    throw new NotFoundException(`Plan or Variant with ID ${variantIdOrPlanId} not found`);
  }

  async addVariantPrice(variantId: string, dto: AddPlanPriceDto): Promise<PlanPrice> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
      relations: ["prices"],
    });
    if (!variant) {
      throw new NotFoundException(`Plan Variant ${variantId} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Retire existing active prices for this variant
      await queryRunner.manager.update(
        PlanPrice,
        { planVariantId: variantId, isActive: true },
        { isActive: false, effectiveTo: new Date() }
      );

      // 2. Insert new active price row
      const newPrice = queryRunner.manager.create(PlanPrice, {
        planVariantId: variantId,
        amount: Number(dto.amount),
        currency: dto.currency || "GBP",
        stripePriceId: dto.stripePriceId || null,
        paypalPlanId: dto.paypalPlanId || null,
        isActive: true,
        effectiveFrom: new Date(),
        effectiveTo: null,
      });

      const savedPrice = await queryRunner.manager.save(newPrice);
      await queryRunner.commitTransaction();
      return savedPrice;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    if (dto.name) plan.name = dto.name;
    if (dto.slug) plan.slug = dto.slug;
    if (dto.description !== undefined) plan.description = dto.description;
    if (dto.isActive !== undefined) plan.isActive = dto.isActive;

    await this.planRepository.save(plan);

    if (dto.variants && dto.variants.length > 0) {
      for (const vDto of dto.variants) {
        const variant = plan.variants.find((v) => v.tierLevel?.name === vDto.tier);
        if (variant) {
          if (vDto.features) variant.features = vDto.features;
          if (vDto.configuration) {
            variant.configuration = {
              ...variant.configuration,
              ...vDto.configuration,
            };
          }
          await this.variantRepository.save(variant);

          if (vDto.price !== undefined) {
            const currentActivePrice = variant.prices?.find((p) => p.isActive);
            if (!currentActivePrice || Number(currentActivePrice.amount) !== Number(vDto.price)) {
              await this.addVariantPrice(variant.id, { amount: vDto.price });
            }
          }
        }
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const plan = await this.findOne(id);
    plan.isActive = false;
    await this.planRepository.save(plan);
    return { message: "Plan deactivated successfully" };
  }

  async getPlanSchema() {
    return {
      quotas: [
        { key: "maxActiveCampaigns", label: "Max Active Campaigns", type: "number", unlimited: true },
        { key: "maxActiveRewards", label: "Max Active Rewards", type: "number", unlimited: true },
        { key: "maxRewardsPerCampaign", label: "Max Rewards Per Campaign", type: "number", unlimited: true },
        { key: "monthlyPointsAllowance", label: "Monthly Points Allowance", type: "number" },
        { key: "monthlyStampsAllowance", label: "Monthly Stamps Allowance", type: "number" },
        { key: "maxTeamMembers", label: "Max Team Members", type: "number" },
        { key: "maxGiftCardTemplates", label: "Max Gift Card Templates", type: "number" },
        { key: "maxCouponTemplates", label: "Max Coupon Templates", type: "number" },
      ],
      featureFlags: [
        { key: "canCreateCampaignFromScratch", label: "Create Campaign From Scratch", type: "boolean" },
        { key: "canEditAdminTemplates", label: "Edit Admin Templates", type: "boolean" },
        { key: "hasAccessToAdvancedAnalytics", label: "Advanced Analytics Dashboard", type: "boolean" },
        { key: "hasAccessToCRM", label: "Customer CRM Access", type: "boolean" },
        { key: "canUpdateReward", label: "Update Reward", type: "boolean" },
        { key: "priorityInSearch", label: "Priority Placement in Search", type: "boolean" },
        { key: "allowCustomBranding", label: "Custom Storefront Branding", type: "boolean" },
      ],
    };
  }
}
