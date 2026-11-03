import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, IsNull, Repository } from "typeorm";
import { nanoid } from "nanoid";
import { LoyaltySetupTemplate } from "./entities/loyalty-setup-template.entity";
import {
  CreateLoyaltySetupTemplateDto,
  UpdateLoyaltySetupTemplateDto,
} from "./dto/loyalty-setup-template.dto";
import { UpdateLoyaltySetupProgressDto } from "./dto/loyalty-setup-progress.dto";
import { LoyaltySetupProgress } from "./entities/loyalty-setup-progress.entity";
import { BUILT_IN_TEMPLATES } from "./built-in-templates";
import { BusinessReward } from "../rewards/entities/business-reward.entity";
import { BusinessCampaign } from "../campaign/entities/business-campaign.entity";
import { Campaign } from "../campaign/entities/campaign.entity";
import { RewardType } from "../rewards/enums/reward-type.enum";
import { RewardSource } from "../rewards/enums/reward-source.enum";
import { RewardAudience } from "../rewards/enums/reward-audience.enum";
import { RewardStatus } from "../rewards/enums/reward-status.enum";

const DEFAULT_BUILT_IN_TIER_CONFIG = {
  enabled: false,
  tiers: [
    {
      name: "Bronze",
      requirementType: "points",
      requirementValue: 0,
      benefits: ["Earn 1x points", "Birthday reward"],
    },
    {
      name: "Silver",
      requirementType: "points",
      requirementValue: 500,
      benefits: ["Earn 1.5x points", "Early access to offers"],
    },
    {
      name: "Gold",
      requirementType: "points",
      requirementValue: 1500,
      benefits: ["Earn 2x points", "VIP offers", "Free delivery"],
    },
    {
      name: "Platinum",
      requirementType: "points",
      requirementValue: 5000,
      benefits: ["Earn 3x points", "Personal manager", "Exclusive events"],
    },
  ],
};

const DEFAULT_CAMPAIGN_SLOTS = 1000;
const DEFAULT_CAMPAIGN_DURATION_DAYS = 365;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalize = (template: LoyaltySetupTemplate) => {
  const rewards = (template.rewards || []).map(
    (r: Record<string, unknown>) => ({
      id: r.id || r.key,
      ...r,
    }),
  );
  const campaigns = (template.campaigns || []).map(
    (c: Record<string, unknown>) => ({
      id: c.id || c.key,
      ...c,
    }),
  );
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    sectorKey: template.sectorKey,
    benefits: template.benefits || [],
    rewards,
    campaigns,
    tierConfig: template.tierConfig || null,
    isBuiltIn: template.isBuiltIn,
  };
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNonNegativeInt = (value: unknown, fallback = 0) =>
  Math.max(0, Math.floor(toNumber(value, fallback)));

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

@Injectable()
export class LoyaltySetupService {
  constructor(
    @InjectRepository(LoyaltySetupTemplate)
    private readonly templateRepository: Repository<LoyaltySetupTemplate>,
    @InjectRepository(LoyaltySetupProgress)
    private readonly progressRepository: Repository<LoyaltySetupProgress>,
    private readonly dataSource: DataSource,
  ) {}

  async seedBuiltIns(): Promise<void> {
    const count = await this.templateRepository.count();
    if (count > 0) {
      return;
    }
    await this.templateRepository.save(
      BUILT_IN_TEMPLATES.map((t) =>
        this.templateRepository.create({
          ...t,
          tierConfig: t.tierConfig || DEFAULT_BUILT_IN_TIER_CONFIG,
          isBuiltIn: true,
        }),
      ),
    );
  }

  async getTemplates() {
    await this.seedBuiltIns();
    const templates = await this.templateRepository.find({
      order: { created_at: "DESC" },
    });
    return templates.map(normalize);
  }

  async getAvailableTemplates() {
    // The admin page lists both built-in starter templates and templates
    // created by admins. Businesses should be offered that same managed set.
    return this.getTemplates();
  }

  async createTemplate(dto: CreateLoyaltySetupTemplateDto) {
    const template = this.templateRepository.create({
      ...dto,
      benefits: dto.benefits || [],
      campaigns: dto.campaigns || [],
      tierConfig: dto.tierConfig || null,
      isBuiltIn: false,
    });
    const saved = await this.templateRepository.save(template);
    return normalize(saved);
  }

  async updateTemplate(id: string, dto: UpdateLoyaltySetupTemplateDto) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException("Reward template not found");
    }
    Object.assign(template, dto, {
      benefits: dto.benefits || template.benefits,
      campaigns: dto.campaigns || template.campaigns,
      tierConfig: dto.tierConfig ?? template.tierConfig,
    });
    const saved = await this.templateRepository.save(template);
    return normalize(saved);
  }

  async deleteTemplate(id: string) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException("Reward template not found");
    }
    if (template.isBuiltIn) {
      throw new BadRequestException("Built-in templates cannot be deleted");
    }
    await this.templateRepository.softDelete(id);
    return { success: true };
  }

  // ─── Per-business setup progress ──────────────────────────────────────────

  private createDefaultProgress(businessId: string): LoyaltySetupProgress {
    return this.progressRepository.create({
      businessId,
      hasSeenWelcome: false,
      hasSeenEcosystemIntro: false,
      selectedTemplateId: null,
      selectedCampaigns: [],
      rewardCustomizations: {},
      campaignDescriptions: {},
      enabledEngines: null,
      tierConfig: null,
      hasCompletedSetup: false,
      hasSkippedOnboarding: false,
      completedAt: null,
    });
  }

  async getProgress(businessId: string): Promise<LoyaltySetupProgress> {
    let progress = await this.progressRepository.findOne({
      where: { businessId },
    });
    if (!progress) {
      try {
        progress = await this.progressRepository.save(
          this.createDefaultProgress(businessId),
        );
      } catch {
        // Another request may have created the row concurrently.
        progress = await this.progressRepository.findOne({
          where: { businessId },
        });
      }
    }
    if (!progress) {
      throw new NotFoundException(
        "Loyalty setup progress could not be loaded.",
      );
    }
    return progress;
  }

  private applyProgressDto(
    progress: LoyaltySetupProgress,
    dto: UpdateLoyaltySetupProgressDto,
  ): void {
    if (dto.hasSeenWelcome !== undefined) {
      progress.hasSeenWelcome = dto.hasSeenWelcome;
    }
    if (dto.hasSeenEcosystemIntro !== undefined) {
      progress.hasSeenEcosystemIntro = dto.hasSeenEcosystemIntro;
    }
    if (dto.selectedCampaigns !== undefined) {
      progress.selectedCampaigns = dto.selectedCampaigns;
    }
    if (dto.rewardCustomizations !== undefined) {
      progress.rewardCustomizations = {
        ...(progress.rewardCustomizations || {}),
        ...dto.rewardCustomizations,
      };
    }
    if (dto.campaignDescriptions !== undefined) {
      progress.campaignDescriptions = {
        ...(progress.campaignDescriptions || {}),
        ...dto.campaignDescriptions,
      };
    }
    if (dto.enabledEngines !== undefined) {
      progress.enabledEngines = dto.enabledEngines;
    }
    if (dto.tierConfig !== undefined) {
      progress.tierConfig = dto.tierConfig;
    }
  }

  async updateProgress(
    businessId: string,
    dto: UpdateLoyaltySetupProgressDto,
  ): Promise<LoyaltySetupProgress> {
    const progress = await this.getProgress(businessId);
    const templateChanged =
      dto.selectedTemplateId !== undefined &&
      dto.selectedTemplateId !== progress.selectedTemplateId;

    this.applyProgressDto(progress, dto);

    if (dto.selectedTemplateId !== undefined) {
      progress.selectedTemplateId = dto.selectedTemplateId;
    }

    if (templateChanged) {
      progress.selectedCampaigns = [];
      progress.campaignDescriptions = {};
      progress.hasCompletedSetup = false;
      progress.completedAt = null;
    }

    return this.progressRepository.save(progress);
  }

  async skipProgress(businessId: string): Promise<LoyaltySetupProgress> {
    const progress = await this.getProgress(businessId);
    progress.hasSeenWelcome = true;
    progress.hasSkippedOnboarding = true;
    return this.progressRepository.save(progress);
  }

  private normalizeRewardType(value: unknown): RewardType {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();

    switch (normalized) {
      case "gift card":
      case "gift_card":
      case "giftcard":
        return RewardType.GIFT_CARD;
      case "coupon":
        return RewardType.COUPON;
      case "point offer":
      case "point_offer":
        return RewardType.POINT_OFFER;
      case "physical product":
      case "physical_product":
        return RewardType.PHYSICAL_PRODUCT;
      default:
        // Templates do not collect the extra Mall targeting metadata needed
        // for a true MallDiscount, so all remaining values map to a voucher.
        return RewardType.VOUCHER;
    }
  }

  async completeProgress(
    businessId: string,
    dto: UpdateLoyaltySetupProgressDto,
  ): Promise<LoyaltySetupProgress> {
    return this.dataSource.transaction(async (manager) => {
      const progressRepository = manager.getRepository(LoyaltySetupProgress);
      const templateRepository = manager.getRepository(LoyaltySetupTemplate);

      let progress = await progressRepository.findOne({
        where: { businessId },
      });
      if (!progress) {
        progress = progressRepository.create({
          businessId,
          hasSeenWelcome: false,
          hasSeenEcosystemIntro: false,
          selectedTemplateId: null,
          selectedCampaigns: [],
          rewardCustomizations: {},
          campaignDescriptions: {},
          enabledEngines: null,
          tierConfig: null,
          hasCompletedSetup: false,
          hasSkippedOnboarding: false,
          completedAt: null,
        });
      }

      if (progress.hasCompletedSetup) {
        return progress;
      }

      this.applyProgressDto(progress, dto);
      if (dto.selectedTemplateId !== undefined) {
        progress.selectedTemplateId = dto.selectedTemplateId;
      }

      if (!progress.selectedTemplateId) {
        throw new BadRequestException(
          "Select a rewards template before completing setup.",
        );
      }

      const template = await templateRepository.findOne({
        where: { id: progress.selectedTemplateId },
      });
      if (!template) {
        throw new NotFoundException("Selected rewards template was not found.");
      }

      const customizations = (progress.rewardCustomizations || {}) as Record<
        string,
        Record<string, unknown>
      >;
      const templateRewards = Array.isArray(template.rewards)
        ? template.rewards
        : [];

      const businessRewardRepository = manager.getRepository(BusinessReward);
      const businessCampaignRepository =
        manager.getRepository(BusinessCampaign);
      const campaignRepository = manager.getRepository(Campaign);

      const rewardKeyToId = new Map<string, string>();
      const createdRewardIds: string[] = [];

      for (const rawReward of templateRewards) {
        const reward = rawReward as Record<string, unknown>;
        const key = String(reward.key ?? reward.id ?? "").trim();
        if (!key) continue;

        const customization =
          customizations[key] ||
          (reward.id ? customizations[String(reward.id)] : undefined) ||
          {};
        const pointsRequired = toNonNegativeInt(
          customization.pointsRequired ?? reward.pointsRequired,
        );
        const stampsRequired = toNonNegativeInt(
          customization.stampsRequired ?? reward.stampsRequired,
        );
        const quantity = toNonNegativeInt(
          customization.quantity ?? reward.quantity,
        );
        const expiry = parseDate(
          customization.expiryDatetime ?? reward.expiryDatetime,
        );

        const entity = businessRewardRepository.create({
          business: { id: businessId } as any,
          title: String(customization.name ?? reward.name ?? "Reward"),
          description: String(
            customization.description ?? reward.description ?? "",
          ),
          image: String(customization.image ?? reward.image ?? "🎁"),
          reward_type: this.normalizeRewardType(
            customization.rewardType ?? reward.rewardType,
          ),
          reward_source: RewardSource.BUSINESS,
          audience: RewardAudience.ALL_BUSINESS,
          points_required: pointsRequired,
          stamps_required: stampsRequired,
          is_points_enabled: pointsRequired > 0 || stampsRequired === 0,
          is_stamps_enabled: stampsRequired > 0,
          quantity,
          remaining_quantity: quantity,
          expiry_datetime: expiry,
          status: RewardStatus.ACTIVE,
        });

        const saved = await businessRewardRepository.save(entity);
        rewardKeyToId.set(key, saved.id);
        if (reward.id) {
          rewardKeyToId.set(String(reward.id), saved.id);
        }
        createdRewardIds.push(saved.id);
      }

      const selectedCampaigns = Array.isArray(progress.selectedCampaigns)
        ? progress.selectedCampaigns
        : [];

      if (selectedCampaigns.length > 0 && createdRewardIds.length === 0) {
        throw new BadRequestException(
          "The selected template does not contain any rewards to attach to its campaigns.",
        );
      }

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + DEFAULT_CAMPAIGN_DURATION_DAYS);

      for (const rawCampaign of selectedCampaigns) {
        const selection = rawCampaign as Record<string, unknown>;
        const campaignId = String(selection.id ?? selection.key ?? "").trim();
        if (!campaignId) continue;

        if (!UUID_PATTERN.test(campaignId)) {
          throw new BadRequestException(
            `Campaign "${String(selection.name ?? campaignId)}" is not a valid campaign template.`,
          );
        }

        const campaign = await campaignRepository.findOne({
          where: { id: campaignId, business: IsNull() },
        });
        if (!campaign) {
          throw new BadRequestException(
            `Campaign "${String(selection.name ?? campaignId)}" is no longer available.`,
          );
        }

        const includedKeys = Array.isArray(selection.includedRewardKeys)
          ? selection.includedRewardKeys.map(String)
          : [];
        const linkedRewardIds = includedKeys
          .map((key) => rewardKeyToId.get(key))
          .filter((id): id is string => Boolean(id));

        const rewardIdsToLink = linkedRewardIds.length
          ? linkedRewardIds
          : createdRewardIds;

        const linkedRewards = rewardIdsToLink.length
          ? await businessRewardRepository.findBy({
              id: In(rewardIdsToLink),
            })
          : [];

        const description = String(
          selection.description ??
            progress.campaignDescriptions?.[campaignId] ??
            campaign.campaign_message ??
            "",
        );

        const totalSlots = Math.max(
          1,
          toNonNegativeInt(
            selection.totalSlots ?? selection.total_slots,
            DEFAULT_CAMPAIGN_SLOTS,
          ),
        );

        const businessCampaign = businessCampaignRepository.create({
          business: { id: businessId } as any,
          campaign,
          uniqueCode: nanoid(9),
          name: campaign.name,
          campaign_type: campaign.campaign_type,
          campaign_message: description || campaign.campaign_message,
          description: description || campaign.campaign_message,
          audience_type: campaign.audience_type,
          banner_url: campaign.banner_url,
          logo_url: campaign.logo_url,
          signUpPoint: campaign.signUpPoint,
          reward_mode: campaign.reward_mode,
          regular_points_threshold: campaign.regular_points_threshold,
          earn_point_page_title: campaign.earn_point_page_title,
          earn_point_page_description: campaign.earn_point_page_description,
          redeem_reward_page_title: campaign.redeem_reward_page_title,
          redeem_reward_page_description:
            campaign.redeem_reward_page_description,
          contact_us_page_title: campaign.contact_us_page_title,
          contact_us_page_description: campaign.contact_us_page_description,
          contact_email: campaign.contact_email,
          contact_phone_number: campaign.contact_phone_number,
          footer_text: campaign.footer_text,
          start_date: now,
          end_date: endDate,
          total_slots: totalSlots,
          remaining_slots: totalSlots,
        });
        businessCampaign.businessRewards = linkedRewards;

        await businessCampaignRepository.save(businessCampaign);
      }

      progress.hasCompletedSetup = true;
      progress.hasSkippedOnboarding = false;
      progress.completedAt = new Date();

      return progressRepository.save(progress);
    });
  }
}
