import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Membership } from "./entities/membership.entity";
import { PaymentHistory } from "../payment-history/entities/payment-history.entity";
import { Tier } from "../tier/entities/tier.entity";
import { JoinTrialDto } from "./dto/join-trial.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Business } from "../business/entities/business.entity";
import { MembershipStatus, PlanType } from "./entities/membership.entity";
import { PaymentService } from "../payment/payment.service";
import { PaymentProvider } from "../payment-history/entities/payment-history.entity";
import { TierType } from "../tier/entities/tier-type.enum";
import { TierStatus } from "../tier/entities/tier-status.enum";
import { MoreThan, LessThanOrEqual, MoreThanOrEqual, LessThan } from "typeorm";
import { CentralPackage, McomCentralService } from "../sso/mcom-central.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  // In-memory cache for active memberships — TTL from config, no hardcoded values
  private readonly activeMembershipCache = new Map<
    string,
    { data: Membership[]; expiresAt: number }
  >();

  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
    private readonly paymentService: PaymentService,
    private readonly mcomCentralService: McomCentralService,
    private readonly configService: ConfigService,
  ) {}

  private cachedTtlMs?: number;
  private readonly MAX_CACHE_SIZE = 5000;

  private getCacheTtlMs(): number {
    if (this.cachedTtlMs !== undefined) return this.cachedTtlMs;
    const fromEnv = this.configService.get<number>("MEMBERSHIP_CACHE_TTL_MS");
    if (typeof fromEnv === "number" && !Number.isNaN(fromEnv)) {
      this.cachedTtlMs = fromEnv;
      return fromEnv;
    }
    const parsed = parseInt(
      this.configService.get<string>("MEMBERSHIP_CACHE_TTL_MS") as unknown as string,
      10,
    );
    this.cachedTtlMs = !Number.isNaN(parsed) && parsed > 0 ? parsed : 15000;
    return this.cachedTtlMs;
  }

  private getCacheKey(businessId: string): string {
    return `membership:active:${businessId}`;
  }

  invalidateMembershipCache(businessId: string): void {
    this.activeMembershipCache.delete(this.getCacheKey(businessId));
  }

  clearAllMembershipCache(): void {
    this.activeMembershipCache.clear();
  }

  async findOneByBusinessId(businessId: string) {
    const memberships = await this.membershipRepository.find({
      where: { business: { id: businessId } },
      relations: [
        "planVariant",
        "planVariant.plan",
        "planVariant.tierLevel",
        "planVariant.prices",
        "tier",
        "tier.season",
        "payment",
      ],
      order: { created_at: "DESC" },
    });
    return memberships[0] || null;
  }

  async overrideBusinessTier(businessId: string, tierId: string) {
    const membership = await this.findOneByBusinessId(businessId);
    if (!membership) {
      throw new NotFoundException("Membership not found for this business");
    }
    const tier = await this.tierRepository.findOne({ where: { id: tierId } });
    if (!tier) {
      throw new NotFoundException("Tier not found");
    }
    membership.tier = tier;
    const saved = await this.membershipRepository.save(membership);
    this.invalidateMembershipCache(businessId);
    return saved;
  }

  /**
   * LOCAL-FIRST enforcement read. Returns non-expired ACTIVE memberships
   * from the Rewards DB only — never consults MCOM Solutions Central.
   * Expiry is enforced live via expires_at so a stale ACTIVE row past its
   * date cannot grant capabilities. Result is cached per-business for
   * MEMBERSHIP_CACHE_TTL_MS to avoid hot-path DB thrash.
   */
  async findActiveMemberships(businessId: string) {
    const cacheKey = this.getCacheKey(businessId);
    const cached = this.activeMembershipCache.get(cacheKey);
    const nowMs = Date.now();
    if (cached && cached.expiresAt > nowMs) {
      return cached.data;
    }

    const memberships = await this.membershipRepository.find({
      where: {
        business: { id: businessId },
        status: MembershipStatus.ACTIVE,
      },
      relations: [
        "planVariant",
        "planVariant.plan",
        "planVariant.tierLevel",
        "planVariant.prices",
        "tier",
        "tier.season",
        "payment",
      ],
    });
    const now = new Date();
    const filtered = memberships.filter(
      (m) => !m.expires_at || new Date(m.expires_at) > now,
    );

    if (this.activeMembershipCache.size >= this.MAX_CACHE_SIZE) {
      // Prune oldest 10% of entries to keep memory bounded
      const keysToDelete = Array.from(this.activeMembershipCache.keys()).slice(0, 500);
      for (const k of keysToDelete) {
        this.activeMembershipCache.delete(k);
      }
    }

    this.activeMembershipCache.set(cacheKey, {
      data: filtered,
      expiresAt: nowMs + this.getCacheTtlMs(),
    });
    return filtered;
  }

  async checkSeasonalOverlap(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const activeSeasonal = await this.membershipRepository.find({
      where: {
        business: { id: businessId },
        status: MembershipStatus.ACTIVE,
        tier: { type: TierType.SEASONAL },
      },
      relations: ["tier", "tier.season"],
    });

    for (const membership of activeSeasonal) {
      const memStart = membership.starts_at;
      const memEnd = membership.expires_at;

      if (startDate <= memEnd && endDate >= memStart) {
        return true;
      }
    }
    return false;
  }

  async getMyMembership(user: any) {
    return await this.membershipRepository.findOne({
      where: { business: { id: user.id } },
      relations: [
        "planVariant",
        "planVariant.plan",
        "planVariant.tierLevel",
        "planVariant.prices",
        "tier",
        "tier.season",
        "payment",
      ],
      order: { created_at: "DESC" },
    });
  }

  async hasActiveSubscription(businessId: string): Promise<boolean> {
    // No trials: active means non-expired ACTIVE membership (cached)
    const active = await this.findActiveMemberships(businessId);
    return active.length > 0;
  }

  async getMyPaymentHistory(user: any) {
    return await this.paymentHistoryRepository.find({
      where: { user: { id: user.id } },
      relations: ["membership"],
    });
  }

  async updateProgressionLevel(
    id: string,
    level: "basic" | "pro" | "pro_plus",
  ) {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: ["business"],
    });
    await this.membershipRepository.update(id, { progression_level: level });
    if (membership?.business?.id) {
      this.invalidateMembershipCache(membership.business.id);
    }
  }

  async remove(id: string) {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: ["business"],
    });
    await this.membershipRepository.softDelete(id);
    if (membership?.business?.id) {
      this.invalidateMembershipCache(membership.business.id);
    }
  }

  async joinTrial(user: any, joinTrialDto: JoinTrialDto) {
    // Check if membership already exists
    const existingMembership = await this.membershipRepository.findOne({
      where: { business: { id: user.id } },
    });

    if (existingMembership) {
      throw new BadRequestException("Membership already exists");
    }

    const tier = await this.tierRepository.findOne({
      where: { id: joinTrialDto.tier_id },
    });
    if (!tier) {
      throw new NotFoundException("Tier not found");
    }

    const startsAt = new Date();
    const expiresAt = new Date();
    const trialDays = 30; // Default trial period
    expiresAt.setDate(startsAt.getDate() + trialDays);

    let provider = PaymentProvider.STRIPE; // Default
    let transactionId = null;

    let planType: PlanType;

    if (joinTrialDto.provider === "paypal") {
      if (tier.paypal_monthly_plan_id) planType = PlanType.MONTHLY;
      else if (tier.paypal_annual_plan_id) planType = PlanType.ANNUAL;
      else if (tier.paypal_quarterly_plan_id) planType = PlanType.QUARTERLY;
    } else {
      if (tier.stripe_monthly_price_id) planType = PlanType.MONTHLY;
      else if (tier.stripe_annual_price_id) planType = PlanType.ANNUAL;
      else if (tier.stripe_quarterly_price_id) planType = PlanType.QUARTERLY;
    }

    // Default to monthly if still not found (legacy behavior)
    if (!planType) planType = PlanType.MONTHLY;

    if (joinTrialDto.payment_token || joinTrialDto.provider === "paypal") {
      // Create a subscription with trial
      const subscribeParams: any = {
        tier_id: tier.id,
        plan_type: planType,
        provider:
          joinTrialDto.provider === "paypal"
            ? PaymentProvider.PAYPAL
            : PaymentProvider.STRIPE,
        is_trial: true,
        trial_days: trialDays,
      };

      if (joinTrialDto.payment_token)
        subscribeParams.payment_token = joinTrialDto.payment_token;
      if (joinTrialDto.return_url)
        subscribeParams.return_url = joinTrialDto.return_url;
      if (joinTrialDto.cancel_url)
        subscribeParams.cancel_url = joinTrialDto.cancel_url;

      const subscribeResult = await this.paymentService.subscribe(
        subscribeParams,
        user,
      );

      if (subscribeResult.subscriptionId) {
        transactionId = subscribeResult.subscriptionId;
      }

      // If approvalUrl is present (PayPal), we return it.
      // The membership is created as ACTIVE trial, but for PayPal it might remain pending until user approves?
      // For now, consistent with requirements, we persist it.

      if (joinTrialDto.provider === "paypal") provider = PaymentProvider.PAYPAL;

      const membership = this.membershipRepository.create({
        business: { id: user.id } as Business,
        tier,
        plan_type: planType,
        starts_at: startsAt,
        expires_at: expiresAt,
        status: MembershipStatus.ACTIVE,
        is_trial: true,
        transaction_id: transactionId,
        payment_provider: provider,
      });

      await this.membershipRepository.save(membership);
      this.invalidateMembershipCache(user.id);

      return {
        ...membership,
        approvalUrl: (subscribeResult as any).approvalUrl,
      };
    }

    // Fallback if no payment info provided
    const membership = this.membershipRepository.create({
      business: { id: user.id } as Business,
      tier,
      plan_type: planType,
      starts_at: startsAt,
      expires_at: expiresAt,
      status: MembershipStatus.ACTIVE,
      is_trial: true,
    });

    await this.membershipRepository.save(membership);
    this.invalidateMembershipCache(user.id);
    return membership;
  }

  async grantAccess(businessId: string, tierId: string, durationDays: number, source: string) {
      const tier = await this.tierRepository.findOne({ where: { id: tierId } });
      if (!tier) throw new NotFoundException('Tier not found');
  
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(startsAt.getDate() + durationDays);
  
      const membership = this.membershipRepository.create({
        business: { id: businessId } as Business,
        tier,
        plan_type: PlanType.MONTHLY, // Default or generic
        starts_at: startsAt,
        expires_at: expiresAt,
        status: MembershipStatus.ACTIVE,
        is_trial: false, // It's a granted access, not a trial
        payment_provider: PaymentProvider.STRIPE, // Placeholder or add 'SYSTEM'/'VOUCHER' to enum if possible. Using Stripe/Manual for now.
        transaction_id: `VOUCHER-${source}`
      });
  
      const saved = await this.membershipRepository.save(membership);
      this.invalidateMembershipCache(businessId);
      return saved;
  }

  async syncFromAppPlan(
    businessId: string,
    appPlan: {
      source?: "membership" | "direct" | string;
      platform?: string;
      clientId?: string;
      planId?: string;
      planName?: string;
      status?: string;
      quotas?: Record<string, any>;
      limits?: Record<string, any>;
      membershipPlanName?: string;
      expiresAt?: string;
      directPlan?: any;
      membershipPlan?: any;
    }
  ): Promise<Membership | null> {
    if (!appPlan) return null;

    const expiresAt = appPlan.expiresAt
      ? new Date(appPlan.expiresAt)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const isExpired = expiresAt <= new Date();
    const isActive = appPlan.status === "active" && !isExpired;

    let tier: Tier | null = null;
    if (appPlan.planName) {
      tier = await this.tierRepository.findOne({
        where: { name: appPlan.planName },
      });
    }
    if (!tier && appPlan.planId) {
      tier = await this.tierRepository.findOne({
        where: { id: appPlan.planId as any },
      });
    }
    if (!tier) {
      tier = await this.tierRepository.findOne({
        where: [{ is_default: true }, { status: TierStatus.PUBLISHED }],
      });
    }

    let membership = await this.membershipRepository.findOne({
      where: { business: { id: businessId } },
      relations: ["tier", "planVariant"],
    });

    const transactionId = `CENTRAL-APPPLAN-${appPlan.source || "bundle"}-${appPlan.planId || "active"}`;

    if (membership) {
      if (tier) membership.tier = tier;
      membership.status = isActive ? MembershipStatus.ACTIVE : MembershipStatus.EXPIRED;
      membership.isActive = isActive;
      membership.expires_at = expiresAt;
      membership.transaction_id = transactionId;
      membership.is_trial = false;
    } else {
      membership = this.membershipRepository.create({
        business: { id: businessId } as Business,
        tier: tier || undefined,
        plan_type: this.mapPlanType(appPlan.planName || "monthly"),
        starts_at: new Date(),
        expires_at: expiresAt,
        status: isActive ? MembershipStatus.ACTIVE : MembershipStatus.EXPIRED,
        isActive,
        is_trial: false,
        transaction_id: transactionId,
        payment_provider: PaymentProvider.STRIPE,
      });
    }

    this.logger.log(
      `Synced appPlan "${appPlan.planName}" (source: ${appPlan.source}, active: ${isActive}) for business ${businessId}`
    );

    const savedAppPlan = await this.membershipRepository.save(membership);
    this.invalidateMembershipCache(businessId);
    return savedAppPlan;
  }

  async syncFromCentralPackage(
    businessId: string,
    centralPackage: CentralPackage
  ): Promise<Membership | null> {
    const tier = await this.tierRepository.findOne({
      where: { name: centralPackage.packageName },
    });

    if (!tier) {
      this.logger.warn(
        `No tier found for MCOM Central package: ${centralPackage.packageName}`
      );
      return null;
    }

    const expiresAt = new Date(centralPackage.expiresAt);
    const isExpired = expiresAt <= new Date();

    // Check for existing membership synced from this central subscription
    let membership = await this.membershipRepository.findOne({
      where: {
        business: { id: businessId },
        transaction_id: Like(`CENTRAL-%`),
      },
      relations: ["tier"],
    });

    if (membership) {
      // Update existing membership
      membership.tier = tier;
      membership.status = isExpired
        ? MembershipStatus.EXPIRED
        : MembershipStatus.ACTIVE;
      membership.expires_at = expiresAt;
      membership.is_trial = false;
    } else {
      // Create new membership from central package
      membership = this.membershipRepository.create({
        business: { id: businessId } as Business,
        tier,
        plan_type: this.mapPlanType(centralPackage.planName),
        starts_at: new Date(),
        expires_at: expiresAt,
        status: isExpired ? MembershipStatus.EXPIRED : MembershipStatus.ACTIVE,
        is_trial: false,
        transaction_id: `CENTRAL-${centralPackage.providerSubscriptionId}`,
        payment_provider:
          centralPackage.provider === "stripe"
            ? PaymentProvider.STRIPE
            : PaymentProvider.PAYPAL,
      });
    }

    this.logger.log(
      `Synced MCOM Central package "${centralPackage.packageName}" (status: ${membership.status}) for business ${businessId}`
    );

    const savedCentral = await this.membershipRepository.save(membership);
    this.invalidateMembershipCache(businessId);
    return savedCentral;
  }

  private mapPlanType(planName: string): PlanType {
    const name = planName?.toLowerCase() || "";
    if (name.includes("annual") || name.includes("yearly")) {
      return PlanType.ANNUAL;
    }
    if (name.includes("quarterly")) {
      return PlanType.QUARTERLY;
    }
    return PlanType.MONTHLY;
  }

  async syncFromCentralProfile(
    businessId: string,
    email: string
  ): Promise<void> {
    try {
      const centralUser = await this.mcomCentralService.getUserMembership({ email });

      if (!centralUser?.success || !centralUser?.data?.packages) {
        this.logger.log(
          `No packages or user profile found in MCOM Central for email ${email}`
        );
        return;
      }

      const rewardsPackage = centralUser.data.packages.find(
        (p: any) =>
          (p.platformName === "MCOM Rewards" || p.platform === "MCOM Rewards") &&
          p.status === "active"
      );

      if (rewardsPackage) {
        // Sync package to local membership
        const mappedPackage: CentralPackage = {
          platform: rewardsPackage.platformName || rewardsPackage.platform || "MCOM Rewards",
          packageName: rewardsPackage.packageName,
          planName: rewardsPackage.packageName, // Assume planName is same as packageName
          status: rewardsPackage.status === "active" ? "active" : "inactive",
          limits: {},
          expiresAt: rewardsPackage.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          provider: rewardsPackage.provider || "stripe",
          providerSubscriptionId: rewardsPackage.providerSubscriptionId || "CENTRAL-PROFILE",
        };

        await this.syncFromCentralPackage(businessId, mappedPackage);
      } else {
        this.logger.log(
          `No active MCOM Rewards package found for business email ${email}`
        );
        // Revoke active central memberships if they exist but are no longer active in Central
        let existingMembership = await this.membershipRepository.findOne({
          where: {
            business: { id: businessId },
            transaction_id: Like(`CENTRAL-%`),
          },
        });
        if (existingMembership && existingMembership.status === MembershipStatus.ACTIVE) {
          existingMembership.status = MembershipStatus.EXPIRED;
          await this.membershipRepository.save(existingMembership);
          this.invalidateMembershipCache(businessId);
          this.logger.log(
            `Revoked expired/inactive MCOM Central package for business ${businessId}`
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to sync subscription from MCOM Central profile for email ${email}: ${error?.message}`,
        error?.stack
      );
    }
  }

  async findTierByName(name: string): Promise<Tier | null> {
    return this.tierRepository.findOne({ where: { name } });
  }
}
