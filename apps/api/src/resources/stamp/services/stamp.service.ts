import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { StampRewardTemplate } from "../entities/stamp-reward-template.entity";
import { BusinessStampReward } from "../entities/business-stamp-reward.entity";
import { StampCard } from "../entities/stamp-card.entity";
import { StampEvent } from "../entities/stamp-event.entity";
import { StampCardStatus } from "../enums/stamp-card-status.enum";
import { StampTriggerMethod } from "../enums/stamp-trigger-method.enum";
import { Participant } from "../../participant/entities/participant.entity";
import { Business } from "../../business/entities/business.entity";
import { CreateStampTemplateDto } from "../dto/create-stamp-template.dto";
import { UpdateStampTemplateDto } from "../dto/update-stamp-template.dto";
import { ActivateStampRewardDto } from "../dto/activate-stamp-reward.dto";

export interface StampRewardTemplateResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  title: string;
  description: string;
  requiredStamps: number;
  rewardBenefit: string;
  rewardBenefitValue: string;
  triggerMethod: string;
  stampValidityDays: number | null;
  rewardClaimDeadlineDays: number | null;
  isHybrid: boolean;
  hybridPointsPerStamp: number;
  hybridCompletionBonusPoints: number;
  isPublished: boolean;
  isArchived: boolean;
  defaultImage: string;
}

export interface BusinessStampRewardResponse {
  id: string;
  template: StampRewardTemplateResponse;
  business: { id: string; name: string; logo?: string; address?: string };
  custom_image: string;
  operating_hours: string;
  is_active: boolean;
  total_enrolled: number;
  total_completions: number;
  total_redemptions: number;
}

export interface StampCardResponse {
  id: string;
  current_stamps: number;
  status: StampCardStatus;
  completed_at: string | null;
  redeemed_at: string | null;
  created_at: string;
  updated_at: string;
  business_stamp_reward_id: string;
  stamps_required: number;
  participant: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  businessStampReward: BusinessStampRewardResponse;
}

export interface BusinessStampStatsResponse {
  id: string;
  title: string;
  total_enrolled: number;
  total_completions: number;
  total_redemptions: number;
}

export interface ConsumerStampStatsResponse {
  activeCards: number;
  completedCards: number;
  redeemedRewards: number;
  totalStampsCollected: number;
  totalPointsEarned: number;
}

export interface StampCardRedemptionQR {
  stampCardId: string;
  customerId: string;
  businessId: string;
  rewardTitle: string;
  rewardValue: string;
  expiresAt: string;
  qrCode: string;
}

export interface AwardStampInput {
  businessId?: string;
  staffId?: string;
  participantUniqueCode?: string;
  participantId?: string;
  stampCardId?: string;
  businessStampRewardId?: string;
  triggerMethod?: string;
}

@Injectable()
export class StampService {
  constructor(
    @InjectRepository(StampRewardTemplate)
    private readonly templateRepository: Repository<StampRewardTemplate>,
    @InjectRepository(BusinessStampReward)
    private readonly businessRewardRepository: Repository<BusinessStampReward>,
    @InjectRepository(StampCard)
    private readonly stampCardRepository: Repository<StampCard>,
    @InjectRepository(StampEvent)
    private readonly stampEventRepository: Repository<StampEvent>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly dataSource: DataSource,
  ) {}

  // --- Response mappers ---

  private mapTemplateToResponse(
    template: StampRewardTemplate,
  ): StampRewardTemplateResponse {
    return {
      id: template.id,
      createdAt: template.created_at.toISOString(),
      updatedAt: template.updated_at.toISOString(),
      deletedAt: template.deleted_at
        ? template.deleted_at.toISOString()
        : undefined,
      title: template.title,
      description: template.description,
      requiredStamps: template.required_stamps,
      rewardBenefit: template.reward_benefit,
      rewardBenefitValue: template.reward_benefit_value,
      triggerMethod: template.trigger_method,
      stampValidityDays: template.stamp_validity_days ?? null,
      rewardClaimDeadlineDays: template.reward_claim_deadline_days ?? null,
      isHybrid: template.is_hybrid,
      hybridPointsPerStamp: template.hybrid_points_per_stamp,
      hybridCompletionBonusPoints: template.hybrid_completion_bonus_points,
      isPublished: template.is_published,
      isArchived: template.is_archived,
      defaultImage: template.default_image || "",
    };
  }

  private mapBusinessRewardToResponse(
    reward: BusinessStampReward,
  ): BusinessStampRewardResponse {
    return {
      id: reward.id,
      template: this.mapTemplateToResponse(reward.template),
      business: {
        id: reward.business?.id,
        name: reward.business?.name,
        logo: reward.business?.profile_image,
        address: reward.business?.address,
      },
      custom_image: reward.custom_image || "",
      operating_hours: reward.operating_hours || "",
      is_active: reward.is_active,
      total_enrolled: reward.total_enrolled,
      total_completions: reward.total_completions,
      total_redemptions: reward.total_redemptions,
    };
  }

  private mapCardToResponse(card: StampCard): StampCardResponse {
    const reward = card.businessStampReward;
    const participant = card.participant;
    return {
      id: card.id,
      current_stamps: card.current_stamps,
      status: card.status,
      completed_at: card.completed_at ? card.completed_at.toISOString() : null,
      redeemed_at: card.redeemed_at ? card.redeemed_at.toISOString() : null,
      created_at: card.created_at.toISOString(),
      updated_at: card.updated_at.toISOString(),
      business_stamp_reward_id: reward?.id || "",
      stamps_required: reward?.template?.required_stamps || 0,
      participant: {
        id: participant?.id || "",
        name: participant?.name || "Unknown Customer",
        email: participant?.email || "",
        avatar: participant?.profilePhoto,
      },
      businessStampReward: reward
        ? this.mapBusinessRewardToResponse(reward)
        : (null as any),
    };
  }

  // --- Admin: template CRUD ---

  async createTemplate(
    dto: CreateStampTemplateDto,
  ): Promise<StampRewardTemplateResponse> {
    const template = this.templateRepository.create(dto);
    const saved = await this.templateRepository.save(template);
    return this.mapTemplateToResponse(saved);
  }

  async findAllTemplates(): Promise<StampRewardTemplateResponse[]> {
    const templates = await this.templateRepository.find({
      order: { created_at: "DESC" },
    });
    return templates.map((t) => this.mapTemplateToResponse(t));
  }

  async findTemplateById(id: string): Promise<StampRewardTemplateResponse> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException("Stamp reward template not found");
    }
    return this.mapTemplateToResponse(template);
  }

  async updateTemplate(
    id: string,
    dto: UpdateStampTemplateDto,
  ): Promise<StampRewardTemplateResponse> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException("Stamp reward template not found");
    }
    Object.assign(template, dto);
    const saved = await this.templateRepository.save(template);
    return this.mapTemplateToResponse(saved);
  }

  async deleteTemplate(id: string): Promise<void> {
    const result = await this.templateRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException("Stamp reward template not found");
    }
  }

  async publishTemplate(id: string): Promise<StampRewardTemplateResponse> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException("Stamp reward template not found");
    }
    template.is_published = true;
    const saved = await this.templateRepository.save(template);
    return this.mapTemplateToResponse(saved);
  }

  async archiveTemplate(id: string): Promise<StampRewardTemplateResponse> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException("Stamp reward template not found");
    }
    template.is_archived = true;
    const saved = await this.templateRepository.save(template);
    return this.mapTemplateToResponse(saved);
  }

  async duplicateTemplate(id: string): Promise<StampRewardTemplateResponse> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException("Stamp reward template not found");
    }
    const copy = this.templateRepository.create({
      title: `${template.title} (Copy)`,
      description: template.description,
      required_stamps: template.required_stamps,
      reward_benefit: template.reward_benefit,
      reward_benefit_value: template.reward_benefit_value,
      trigger_method: template.trigger_method,
      stamp_validity_days: template.stamp_validity_days,
      reward_claim_deadline_days: template.reward_claim_deadline_days,
      is_hybrid: template.is_hybrid,
      hybrid_points_per_stamp: template.hybrid_points_per_stamp,
      hybrid_completion_bonus_points: template.hybrid_completion_bonus_points,
      is_published: false,
      is_archived: false,
      default_image: template.default_image,
    });
    const saved = await this.templateRepository.save(copy);
    return this.mapTemplateToResponse(saved);
  }

  // --- Business: activation & management ---

  async getAvailableTemplates(
    businessId: string,
  ): Promise<StampRewardTemplateResponse[]> {
    const activatedRewards = await this.businessRewardRepository.find({
      where: { business: { id: businessId } },
      relations: ["template"],
    });
    const activatedIds = activatedRewards.map((r) => r.template?.id);

    const templates = await this.templateRepository.find({
      where: { is_published: true, is_archived: false },
      order: { created_at: "DESC" },
    });

    return templates
      .filter((t) => !activatedIds.includes(t.id))
      .map((t) => this.mapTemplateToResponse(t));
  }

  async getBusinessStampRewards(
    businessId: string,
  ): Promise<BusinessStampRewardResponse[]> {
    const rewards = await this.businessRewardRepository.find({
      where: { business: { id: businessId } },
      relations: ["template", "business"],
      order: { created_at: "DESC" },
    });
    return rewards.map((r) => this.mapBusinessRewardToResponse(r));
  }

  async activateStampReward(
    businessId: string,
    dto: ActivateStampRewardDto,
  ): Promise<BusinessStampRewardResponse> {
    const template = await this.templateRepository.findOne({
      where: { id: dto.templateId, is_published: true, is_archived: false },
    });
    if (!template) {
      throw new NotFoundException("Published stamp reward template not found");
    }

    const existing = await this.businessRewardRepository.findOne({
      where: { business: { id: businessId }, template: { id: dto.templateId } },
    });
    if (existing) {
      throw new BadRequestException(
        "This stamp reward is already activated for your business",
      );
    }

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    const reward = this.businessRewardRepository.create({
      template,
      business,
      custom_image: dto.custom_image,
      operating_hours: dto.operating_hours,
      is_active: true,
      total_enrolled: 0,
      total_completions: 0,
      total_redemptions: 0,
    });
    const saved = await this.businessRewardRepository.save(reward);
    return this.mapBusinessRewardToResponse(
      await this.businessRewardRepository.findOne({
        where: { id: saved.id },
        relations: ["template", "business"],
      }),
    );
  }

  private async findOwnedReward(businessId: string, id: string) {
    const reward = await this.businessRewardRepository.findOne({
      where: { id, business: { id: businessId } },
      relations: ["template", "business"],
    });
    if (!reward) {
      throw new NotFoundException("Stamp reward not found");
    }
    return reward;
  }

  async pauseStampReward(
    businessId: string,
    id: string,
  ): Promise<BusinessStampRewardResponse> {
    const reward = await this.findOwnedReward(businessId, id);
    reward.is_active = false;
    const saved = await this.businessRewardRepository.save(reward);
    return this.mapBusinessRewardToResponse(saved);
  }

  async resumeStampReward(
    businessId: string,
    id: string,
  ): Promise<BusinessStampRewardResponse> {
    const reward = await this.findOwnedReward(businessId, id);
    reward.is_active = true;
    const saved = await this.businessRewardRepository.save(reward);
    return this.mapBusinessRewardToResponse(saved);
  }

  async deactivateStampReward(businessId: string, id: string): Promise<void> {
    const reward = await this.findOwnedReward(businessId, id);
    await this.businessRewardRepository.softDelete(reward.id);
  }

  async getStampRewardStats(
    businessId: string,
  ): Promise<BusinessStampStatsResponse[]> {
    const rewards = await this.businessRewardRepository.find({
      where: { business: { id: businessId } },
      relations: ["template"],
    });
    return rewards.map((r) => ({
      id: r.id,
      title: r.template?.title || "Untitled",
      total_enrolled: r.total_enrolled,
      total_completions: r.total_completions,
      total_redemptions: r.total_redemptions,
    }));
  }

  async getCustomerStampCards(
    businessId: string,
    businessStampRewardId: string,
  ): Promise<StampCardResponse[]> {
    await this.findOwnedReward(businessId, businessStampRewardId);
    const cards = await this.stampCardRepository.find({
      where: {
        businessStampReward: { id: businessStampRewardId },
      },
      relations: [
        "participant",
        "businessStampReward",
        "businessStampReward.template",
        "businessStampReward.business",
      ],
      order: { created_at: "DESC" },
    });
    return cards.map((c) => this.mapCardToResponse(c));
  }

  async redeemStampCard(
    businessId: string,
    stampCardId?: string,
    participantUniqueCode?: string,
  ): Promise<StampCardResponse> {
    let card: StampCard | null = null;
    if (stampCardId) {
      card = await this.stampCardRepository.findOne({
        where: { id: stampCardId },
        relations: [
          "participant",
          "businessStampReward",
          "businessStampReward.template",
          "businessStampReward.business",
        ],
      });
    } else if (participantUniqueCode) {
      const participant = await this.participantRepository.findOne({
        where: { uniqueCode: participantUniqueCode },
      });
      if (!participant) {
        throw new NotFoundException("Participant not found");
      }
      card = await this.stampCardRepository.findOne({
        where: {
          participant: { id: participant.id },
          businessStampReward: { business: { id: businessId } },
          status: StampCardStatus.COMPLETED,
        },
        relations: [
          "participant",
          "businessStampReward",
          "businessStampReward.template",
          "businessStampReward.business",
        ],
        order: { created_at: "DESC" },
      });
    }

    if (!card || card.businessStampReward?.business?.id !== businessId) {
      throw new NotFoundException(
        "Completed stamp card not found for this business",
      );
    }
    if (card.status !== StampCardStatus.COMPLETED) {
      throw new BadRequestException(
        "This stamp card is not completed and cannot be redeemed",
      );
    }

    card.status = StampCardStatus.REDEEMED;
    card.redeemed_at = new Date();
    await this.stampCardRepository.save(card);

    const reward = card.businessStampReward;
    reward.total_redemptions += 1;
    await this.businessRewardRepository.save(reward);

    return this.mapCardToResponse(
      await this.stampCardRepository.findOne({
        where: { id: card.id },
        relations: [
          "participant",
          "businessStampReward",
          "businessStampReward.template",
          "businessStampReward.business",
        ],
      }),
    );
  }

  // --- Awarding a stamp to a card ---

  async addStamp(
    businessId: string,
    participantId: string,
    triggerMethod: StampTriggerMethod,
    businessStampRewardId?: string,
  ): Promise<StampCardResponse> {
    const execute = async (manager: EntityManager) => {
      const participant = await manager.findOne(Participant, {
        where: { id: participantId },
      });
      if (!participant) {
        throw new NotFoundException("Participant not found");
      }

      let reward: BusinessStampReward;
      if (businessStampRewardId) {
        reward = await manager.findOne(BusinessStampReward, {
          where: { id: businessStampRewardId },
          relations: ["template", "business"],
        });
      } else {
        reward = await manager.findOne(BusinessStampReward, {
          where: { business: { id: businessId }, is_active: true },
          relations: ["template", "business"],
          order: { created_at: "DESC" },
        });
      }
      if (!reward) {
        throw new NotFoundException("Active stamp reward not found");
      }
      if (!reward.is_active) {
        throw new BadRequestException("This stamp reward is currently paused");
      }

      let card = await manager.findOne(StampCard, {
        where: {
          participant: { id: participant.id },
          businessStampReward: { id: reward.id },
          status: StampCardStatus.IN_PROGRESS,
        },
      });

      const isNewCard = !card;
      if (!card) {
        card = manager.create(StampCard, {
          participant,
          businessStampReward: reward,
          current_stamps: 0,
          status: StampCardStatus.IN_PROGRESS,
        });
        card = await manager.save(StampCard, card);
      }

      const requiredStamps = reward.template.required_stamps;
      card.current_stamps += 1;

      const event = manager.create(StampEvent, {
        stampCard: card,
        trigger_method: triggerMethod,
        points_added: reward.template.is_hybrid
          ? reward.template.hybrid_points_per_stamp || 0
          : 0,
        metadata: JSON.stringify({ businessId: businessId }),
      });
      await manager.save(StampEvent, event);

      if (card.current_stamps >= requiredStamps) {
        card.status = StampCardStatus.COMPLETED;
        card.completed_at = new Date();
        reward.total_completions += 1;
      }
      card = await manager.save(StampCard, card);

      if (isNewCard) {
        reward.total_enrolled += 1;
      }
      await manager.save(BusinessStampReward, reward);

      return card;
    };

    const card = await this.dataSource.transaction(execute);

    return this.mapCardToResponse(
      await this.stampCardRepository.findOne({
        where: { id: card.id },
        relations: [
          "participant",
          "businessStampReward",
          "businessStampReward.template",
          "businessStampReward.business",
        ],
      }),
    );
  }

  async awardStamp(input: AwardStampInput): Promise<StampCardResponse> {
    let participant: Participant | null = null;
    let businessStampRewardId = input.businessStampRewardId;
    let businessId = input.businessId;
    const triggerMethod = input.triggerMethod
      ? (input.triggerMethod.toUpperCase() as StampTriggerMethod)
      : StampTriggerMethod.MANUAL;

    if (input.stampCardId) {
      const card = await this.stampCardRepository.findOne({
        where: { id: input.stampCardId },
        relations: [
          "participant",
          "businessStampReward",
          "businessStampReward.business",
        ],
      });
      if (!card) {
        throw new NotFoundException("Stamp card not found");
      }
      participant = card.participant;
      businessStampRewardId = card.businessStampReward.id;
      businessId = card.businessStampReward.business.id;
    }

    if (!participant && input.participantUniqueCode) {
      participant = await this.participantRepository.findOne({
        where: { uniqueCode: input.participantUniqueCode },
      });
      if (!participant) {
        throw new NotFoundException("Participant not found");
      }
    }

    if (!participant && input.participantId) {
      participant = await this.participantRepository.findOne({
        where: { id: input.participantId },
      });
      if (!participant) {
        throw new NotFoundException("Participant not found");
      }
    }

    if (!participant) {
      throw new BadRequestException(
        "A participant (id or unique code) or an existing stamp card is required",
      );
    }

    if (!businessStampRewardId) {
      throw new BadRequestException(
        "businessStampRewardId is required to award a stamp",
      );
    }

    return this.addStamp(
      businessId || "",
      participant.id,
      triggerMethod,
      businessStampRewardId,
    );
  }

  // --- Participant: cards, discover, start, stats, QR ---

  async getMyStampCards(participantId: string): Promise<StampCardResponse[]> {
    const cards = await this.stampCardRepository.find({
      where: { participant: { id: participantId } },
      relations: [
        "businessStampReward",
        "businessStampReward.template",
        "businessStampReward.business",
      ],
      order: { created_at: "DESC" },
    });
    return cards.map((c) => this.mapCardToResponse(c));
  }

  async getStampCardById(
    participantId: string,
    cardId: string,
  ): Promise<StampCardResponse> {
    const card = await this.stampCardRepository.findOne({
      where: { id: cardId, participant: { id: participantId } },
      relations: [
        "participant",
        "businessStampReward",
        "businessStampReward.template",
        "businessStampReward.business",
      ],
    });
    if (!card) {
      throw new NotFoundException("Stamp card not found");
    }
    return this.mapCardToResponse(card);
  }

  async getDiscoverableStampRewards(
    participantId: string,
  ): Promise<BusinessStampRewardResponse[]> {
    const myCards = await this.stampCardRepository.find({
      where: { participant: { id: participantId } },
      relations: ["businessStampReward"],
    });
    const startedIds = myCards.map((c) => c.businessStampReward.id);

    const rewards = await this.businessRewardRepository.find({
      where: { is_active: true },
      relations: ["template", "business"],
      order: { created_at: "DESC" },
    });

    return rewards
      .filter((r) => r.template?.is_published && !r.template?.is_archived)
      .map((r) => ({
        ...this.mapBusinessRewardToResponse(r),
        hasStarted: startedIds.includes(r.id),
        currentProgress: startedIds.includes(r.id)
          ? myCards.find((c) => c.businessStampReward.id === r.id)
              ?.current_stamps || 0
          : 0,
      }));
  }

  async getRewardsByBusiness(
    businessId: string,
  ): Promise<BusinessStampRewardResponse[]> {
    const rewards = await this.businessRewardRepository.find({
      where: { business: { id: businessId }, is_active: true },
      relations: ["template", "business"],
      order: { created_at: "DESC" },
    });
    return rewards
      .filter((r) => r.template?.is_published && !r.template?.is_archived)
      .map((r) => this.mapBusinessRewardToResponse(r));
  }

  async startStampCard(
    participantId: string,
    businessStampRewardId: string,
  ): Promise<StampCardResponse> {
    const reward = await this.businessRewardRepository.findOne({
      where: { id: businessStampRewardId, is_active: true },
      relations: ["template", "business"],
    });
    if (!reward) {
      throw new NotFoundException("Active stamp reward not found");
    }

    let card = await this.stampCardRepository.findOne({
      where: {
        participant: { id: participantId },
        businessStampReward: { id: reward.id },
      },
      relations: [
        "participant",
        "businessStampReward",
        "businessStampReward.template",
        "businessStampReward.business",
      ],
    });
    if (!card) {
      const participant = await this.participantRepository.findOne({
        where: { id: participantId },
      });
      if (!participant) {
        throw new NotFoundException("Participant not found");
      }
      card = this.stampCardRepository.create({
        participant,
        businessStampReward: reward,
        current_stamps: 0,
        status: StampCardStatus.IN_PROGRESS,
      });
      card = await this.stampCardRepository.save(card);
      reward.total_enrolled += 1;
      await this.businessRewardRepository.save(reward);
    }

    return this.mapCardToResponse(card);
  }

  async getConsumerStampStats(
    participantId: string,
  ): Promise<ConsumerStampStatsResponse> {
    const cards = await this.stampCardRepository.find({
      where: { participant: { id: participantId } },
    });
    const totalPointsEarned = cards.reduce(
      (sum, c) => sum + c.current_stamps,
      0,
    );
    return {
      activeCards: cards.filter((c) => c.status === StampCardStatus.IN_PROGRESS)
        .length,
      completedCards: cards.filter(
        (c) => c.status === StampCardStatus.COMPLETED,
      ).length,
      redeemedRewards: cards.filter(
        (c) => c.status === StampCardStatus.REDEEMED,
      ).length,
      totalStampsCollected: totalPointsEarned,
      totalPointsEarned: 0,
    };
  }

  async getRedemptionQR(
    participantId: string,
    stampCardId: string,
  ): Promise<StampCardRedemptionQR> {
    const card = await this.stampCardRepository.findOne({
      where: { id: stampCardId, participant: { id: participantId } },
      relations: [
        "businessStampReward",
        "businessStampReward.template",
        "businessStampReward.business",
      ],
    });
    if (!card) {
      throw new NotFoundException("Stamp card not found");
    }
    if (card.status !== StampCardStatus.COMPLETED) {
      throw new BadRequestException(
        "Reward QR is only available for completed stamp cards",
      );
    }

    const template = card.businessStampReward.template;
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const payload = JSON.stringify({
      type: "stamp_redemption",
      cardId: stampCardId,
      businessId: card.businessStampReward.business.id,
      timestamp: Date.now(),
    });

    return {
      stampCardId,
      customerId: participantId,
      businessId: card.businessStampReward.business.id,
      rewardTitle: template.title,
      rewardValue: template.reward_benefit_value || "",
      expiresAt,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        payload,
      )}`,
    };
  }

  // --- Admin participant views ---

  async getParticipantStampCards(
    participantId: string,
    status?: string,
  ): Promise<StampCardResponse[]> {
    let cards = await this.stampCardRepository.find({
      where: { participant: { id: participantId } },
      relations: [
        "participant",
        "businessStampReward",
        "businessStampReward.template",
        "businessStampReward.business",
      ],
      order: { created_at: "DESC" },
    });
    if (status && status !== "all") {
      const normalized = status.toUpperCase();
      cards = cards.filter((c) => c.status === normalized);
    }
    return cards.map((c) => this.mapCardToResponse(c));
  }

  async getParticipantStampStats(
    participantId: string,
  ): Promise<ConsumerStampStatsResponse> {
    return this.getConsumerStampStats(participantId);
  }

  async getParticipantDiscoverableStampRewards(
    participantId: string,
  ): Promise<BusinessStampRewardResponse[]> {
    return this.getDiscoverableStampRewards(participantId);
  }
}
