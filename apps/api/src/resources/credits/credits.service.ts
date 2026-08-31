import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CreditLevel } from "./entities/credit-level.entity";
import { CreditRule } from "./entities/credit-rule.entity";
import { CreditTransaction } from "./entities/credit-transaction.entity";
import {
  CreditsTransactionType,
  CreditsUnit,
  CreditsUserType,
} from "./entities/credits.enums";
import { Participant } from "../participant/entities/participant.entity";
import { Business } from "../business/entities/business.entity";
import { CreateCreditRuleDto } from "./dto/create-credit-rule.dto";
import { UpdateCreditRuleDto } from "./dto/update-credit-rule.dto";

export interface CreditsBalance {
  credits: number;
  availableCashback: number;
  pendingAmount: number;
  expiringSoon: number;
  progression: {
    currentCredits: number;
    currentLevel: number;
    nextLevel?: Record<string, unknown>;
    allLevels: Record<string, unknown>[];
  };
}

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(CreditLevel)
    private readonly levelRepository: Repository<CreditLevel>,
    @InjectRepository(CreditRule)
    private readonly ruleRepository: Repository<CreditRule>,
    @InjectRepository(CreditTransaction)
    private readonly transactionRepository: Repository<CreditTransaction>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  // --- Balance / progression ---

  private mapLevel(level: CreditLevel) {
    return {
      level: level.level,
      creditsNeeded: level.creditsNeeded,
      matchingContribution: level.matchingContribution,
      totalCashback: level.totalCashback,
    };
  }

  async getBalance(
    userId: string,
    userType: CreditsUserType,
  ): Promise<CreditsBalance> {
    const [credits, cashback, levels, pending] = await Promise.all([
      this.transactionRepository.sum("amount", { userId, userType, unit: CreditsUnit.CREDITS }),
      this.transactionRepository.sum("amount", { userId, userType, unit: CreditsUnit.GBP }),
      this.levelRepository.find({ order: { level: "ASC" } }),
      this.transactionRepository.sum("amount", {
        userId,
        userType,
        unit: CreditsUnit.GBP,
        status: "pending",
      }),
    ]);

    const creditsBalance = credits || 0;
    const availableCashback = cashback || 0;

    const unlocked = levels
      .filter((l) => l.creditsNeeded <= creditsBalance)
      .pop();
    const nextLevel = levels.find((l) => l.creditsNeeded > creditsBalance);

    return {
      credits: creditsBalance,
      availableCashback,
      pendingAmount: pending || 0,
      // Credits schema has no expiry tracking; there is nothing that can expire soon.
      expiringSoon: 0,
      progression: {
        currentCredits: creditsBalance,
        currentLevel: unlocked ? unlocked.level : 0,
        nextLevel: nextLevel ? this.mapLevel(nextLevel) : undefined,
        allLevels: levels.map((l) => this.mapLevel(l)),
      },
    };
  }

  // --- Unlock a credit level (matching contribution -> cashback) ---

  async unlock(userId: string, userType: CreditsUserType, level: number) {
    const levelConfig = await this.levelRepository.findOne({ where: { level } });
    if (!levelConfig) {
      throw new NotFoundException("Credit level not found");
    }

    const balance = await this.getBalance(userId, userType);
    if (balance.credits < levelConfig.creditsNeeded) {
      throw new BadRequestException("Not enough credits to unlock this level");
    }
    if (balance.availableCashback < levelConfig.matchingContribution) {
      throw new BadRequestException(
        "Insufficient spendable balance for the matching contribution",
      );
    }

    const entries = [
      {
        userId,
        userType,
        amount: -levelConfig.matchingContribution,
        type: CreditsTransactionType.DEBIT,
        unit: CreditsUnit.GBP,
        description: `Matching contribution for Level ${level}`,
        status: "COMPLETED",
      },
      {
        userId,
        userType,
        amount: levelConfig.totalCashback,
        type: CreditsTransactionType.CREDIT,
        unit: CreditsUnit.GBP,
        description: `Unlocked Level ${level} rewards`,
        status: "COMPLETED",
      },
    ];

    await this.transactionRepository.save(
      this.transactionRepository.create(entries),
    );

    return this.getBalance(userId, userType);
  }

  // --- Admin: award credits manually ---

  async award(
    userId: string,
    userType: CreditsUserType,
    amount: number,
    unit: CreditsUnit,
    description?: string,
  ) {
    const tx = this.transactionRepository.create({
      userId,
      userType,
      amount,
      type: CreditsTransactionType.CREDIT,
      unit,
      description: description || "Manual credit adjustment",
      status: "COMPLETED",
    });
    await this.transactionRepository.save(tx);
    return this.getBalance(userId, userType);
  }

  // --- Rules ---

  async getRules() {
    const rules = await this.ruleRepository.find({
      order: { created_at: "DESC" },
    });
    return rules.map((r) => ({
      id: r.id,
      platform: r.platform,
      eventType: r.eventType,
      rewardType: r.rewardType,
      rewardValue: r.rewardValue,
      isActive: r.isActive,
      level: r.level,
      createdAt: r.created_at.toISOString(),
    }));
  }

  async createRule(dto: CreateCreditRuleDto) {
    const eventTypes = Array.isArray(dto.eventType) ? dto.eventType : [dto.eventType];
    const rules = eventTypes.map((eventType) =>
      this.ruleRepository.create({
        platform: dto.platform,
        eventType,
        rewardType: dto.rewardType,
        rewardValue: dto.rewardValue,
        isActive: dto.isActive ?? true,
        level: dto.level,
      }),
    );
    await this.ruleRepository.save(rules);
    return this.getRules();
  }

  async updateRule(id: string, dto: UpdateCreditRuleDto) {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException("Credit rule not found");
    }
    if (dto.platform !== undefined) rule.platform = dto.platform;
    if (dto.eventType !== undefined) {
      rule.eventType = Array.isArray(dto.eventType)
        ? dto.eventType[0]
        : dto.eventType;
    }
    if (dto.rewardType !== undefined) rule.rewardType = dto.rewardType;
    if (dto.rewardValue !== undefined) rule.rewardValue = dto.rewardValue;
    if (dto.isActive !== undefined) rule.isActive = dto.isActive;
    if (dto.level !== undefined) rule.level = dto.level;
    await this.ruleRepository.save(rule);
    return this.getRules();
  }

  async deleteRule(id: string) {
    const result = await this.ruleRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException("Credit rule not found");
    }
    return { success: true };
  }

  async getEvents(): Promise<string[]> {
    const rules = await this.ruleRepository.find();
    return [...new Set(rules.map((r) => r.eventType))];
  }

  // --- History ---

  async getHistory(userId: string, userType: CreditsUserType, page = 1, limit = 10) {
    const [items, total] = await this.transactionRepository.findAndCount({
      where: { userId, userType },
      order: { created_at: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: items.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        unit: t.unit,
        sourcePlatform: t.sourcePlatform,
        eventType: t.eventType,
        description: t.description,
        createdAt: t.created_at.toISOString(),
        status: t.status,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminHistory(page = 1, limit = 10, email?: string) {
    const where: Record<string, unknown> = {};
    if (email) {
      const [participants, businesses] = await Promise.all([
        this.participantRepository.find({ where: { email } }),
        this.businessRepository.find({ where: { email } }),
      ]);
      const userIds = [
        ...participants.map((p) => p.id),
        ...businesses.map((b) => b.id),
      ];
      if (userIds.length === 0) {
        return {
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        };
      }
      where.userId = In(userIds);
    }

    const [items, total] = await this.transactionRepository.findAndCount({
      where,
      order: { created_at: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: items.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        unit: t.unit,
        sourcePlatform: t.sourcePlatform,
        eventType: t.eventType,
        description: t.description,
        createdAt: t.created_at.toISOString(),
        status: t.status,
        referenceId: t.userId,
        wallet: {
          id: t.userId,
        },
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}