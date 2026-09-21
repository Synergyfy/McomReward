import { Injectable, Logger, NotFoundException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import {
  PlanSubscription,
  SubscriptionStatus,
  SubscriptionPlanType,
} from "../entities/plan-subscription.entity";
import { PlanVariant } from "../entities/plan-variant.entity";
import { PlanPrice } from "../entities/plan-price.entity";
import { Plan } from "../entities/plan.entity";
import { PlanPayment } from "../entities/plan-payment.entity";
import { Business } from "../../business/entities/business.entity";
import { PaymentProvider } from "../../payment-history/entities/payment-history.entity";
import {
  CentralPackage,
  McomCentralService,
} from "../../sso/mcom-central.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PlanSubscriptionService {
  private readonly logger = new Logger(PlanSubscriptionService.name);

  // In-memory cache for active subscriptions
  private readonly activeSubscriptionCache = new Map<
    string,
    { data: PlanSubscription[]; expiresAt: number }
  >();

  private cachedTtlMs?: number;
  private readonly MAX_CACHE_SIZE = 5000;

  constructor(
    @InjectRepository(PlanSubscription)
    private readonly subscriptionRepository: Repository<PlanSubscription>,
    @InjectRepository(PlanPayment)
    private readonly paymentRepository: Repository<PlanPayment>,
    @InjectRepository(PlanVariant)
    private readonly planVariantRepository: Repository<PlanVariant>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @Inject(forwardRef(() => McomCentralService))
    private readonly mcomCentralService: McomCentralService,
    private readonly configService: ConfigService,
  ) {}

  private getCacheTtlMs(): number {
    if (this.cachedTtlMs !== undefined) return this.cachedTtlMs;
    const fromEnv = this.configService.get<number>("SUBSCRIPTION_CACHE_TTL_MS");
    if (typeof fromEnv === "number" && !Number.isNaN(fromEnv)) {
      this.cachedTtlMs = fromEnv;
      return fromEnv;
    }
    const parsed = parseInt(
      this.configService.get<string>(
        "SUBSCRIPTION_CACHE_TTL_MS",
      ) as unknown as string,
      10,
    );
    this.cachedTtlMs = !Number.isNaN(parsed) && parsed > 0 ? parsed : 15000;
    return this.cachedTtlMs;
  }

  private getCacheKey(businessId: string): string {
    return `subscription:active:${businessId}`;
  }

  invalidateSubscriptionCache(businessId: string): void {
    this.activeSubscriptionCache.delete(this.getCacheKey(businessId));
  }

  clearAllSubscriptionCache(): void {
    this.activeSubscriptionCache.clear();
  }

  async findOneByBusinessId(
    businessId: string,
  ): Promise<PlanSubscription | null> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { business: { id: businessId } },
      relations: [
        "planVariant",
        "planVariant.plan",
        "planVariant.tierLevel",
        "planVariant.prices",
        "price",
        "payment",
      ],
      order: { created_at: "DESC" },
    });
    return subscriptions[0] || null;
  }

  async findActiveSubscriptions(
    businessId: string,
  ): Promise<PlanSubscription[]> {
    const cacheKey = this.getCacheKey(businessId);
    const cached = this.activeSubscriptionCache.get(cacheKey);
    const nowMs = Date.now();
    if (cached && cached.expiresAt > nowMs) {
      return cached.data;
    }

    const subscriptions = await this.subscriptionRepository.find({
      where: {
        business: { id: businessId },
        status: SubscriptionStatus.ACTIVE,
      },
      relations: [
        "planVariant",
        "planVariant.plan",
        "planVariant.tierLevel",
        "planVariant.prices",
        "price",
        "payment",
      ],
    });

    const now = new Date();
    const filtered = subscriptions.filter(
      (s) => !s.expires_at || new Date(s.expires_at) > now,
    );

    if (this.activeSubscriptionCache.size >= this.MAX_CACHE_SIZE) {
      const keysToDelete = Array.from(
        this.activeSubscriptionCache.keys(),
      ).slice(0, 500);
      for (const k of keysToDelete) {
        this.activeSubscriptionCache.delete(k);
      }
    }

    this.activeSubscriptionCache.set(cacheKey, {
      data: filtered,
      expiresAt: nowMs + this.getCacheTtlMs(),
    });
    return filtered;
  }

  async findActiveSubscription(
    businessId: string,
  ): Promise<PlanSubscription | null> {
    const subs = await this.findActiveSubscriptions(businessId);
    return subs.length > 0 ? subs[0] : null;
  }

  async hasActiveSubscription(businessId: string): Promise<boolean> {
    const active = await this.findActiveSubscriptions(businessId);
    return active.length > 0;
  }

  async getMySubscription(user: any): Promise<PlanSubscription | null> {
    return this.findOneByBusinessId(user.id);
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
    },
  ): Promise<PlanSubscription | null> {
    if (!appPlan) return null;

    const expiresAt = appPlan.expiresAt
      ? new Date(appPlan.expiresAt)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const isExpired = expiresAt <= new Date();
    const isActive = appPlan.status === "active" && !isExpired;

    // Resolve unified plan variant
    let variant: PlanVariant | null = null;
    if (appPlan.planName) {
      const plan = await this.planRepository.findOne({
        where: { name: appPlan.planName },
        relations: ["variants", "variants.tierLevel", "variants.prices"],
      });
      if (plan && plan.variants?.length > 0) {
        variant = plan.variants[0];
      }
    }

    if (!variant) {
      const allPlans = await this.planRepository.find({
        where: { isActive: true },
        relations: ["variants", "variants.tierLevel", "variants.prices"],
      });
      if (allPlans.length > 0 && allPlans[0].variants?.length > 0) {
        variant = allPlans[0].variants[0];
      }
    }

    let subscription = await this.subscriptionRepository.findOne({
      where: { business: { id: businessId } },
      relations: ["planVariant", "price"],
    });

    const transactionId = `CENTRAL-APPPLAN-${appPlan.source || "bundle"}-${appPlan.planId || "active"}`;

    if (subscription) {
      if (variant) {
        subscription.planVariant = variant;
        subscription.planVariantId = variant.id;
        const activePrice =
          variant.prices?.find((p) => p.isActive) || variant.prices?.[0];
        if (activePrice) {
          subscription.price = activePrice;
          subscription.priceId = activePrice.id;
        }
      }
      subscription.status = isActive
        ? SubscriptionStatus.ACTIVE
        : SubscriptionStatus.EXPIRED;
      subscription.isActive = isActive;
      subscription.expires_at = expiresAt;
      subscription.transaction_id = transactionId;
      subscription.is_trial = false;
    } else {
      const activePrice =
        variant?.prices?.find((p) => p.isActive) || variant?.prices?.[0];
      subscription = this.subscriptionRepository.create({
        business: { id: businessId } as Business,
        planVariant: variant || undefined,
        planVariantId: variant?.id,
        price: activePrice || undefined,
        priceId: activePrice?.id,
        plan_type: this.mapPlanType(appPlan.planName || "monthly"),
        starts_at: new Date(),
        expires_at: expiresAt,
        status: isActive
          ? SubscriptionStatus.ACTIVE
          : SubscriptionStatus.EXPIRED,
        isActive,
        is_trial: false,
        transaction_id: transactionId,
        payment_provider: PaymentProvider.STRIPE,
      });
    }

    this.logger.log(
      `Synced appPlan "${appPlan.planName}" (source: ${appPlan.source}, active: ${isActive}) for business ${businessId}`,
    );

    const saved = await this.subscriptionRepository.save(subscription);
    this.invalidateSubscriptionCache(businessId);
    return saved;
  }

  async syncFromCentralPackage(
    businessId: string,
    centralPackage: CentralPackage,
  ): Promise<PlanSubscription | null> {
    const plan = await this.planRepository.findOne({
      where: { name: centralPackage.packageName },
      relations: ["variants", "variants.tierLevel", "variants.prices"],
    });

    const variant = plan?.variants?.[0];

    const expiresAt = new Date(centralPackage.expiresAt);
    const isExpired = expiresAt <= new Date();

    let subscription = await this.subscriptionRepository.findOne({
      where: {
        business: { id: businessId },
        transaction_id: Like(`CENTRAL-%`),
      },
      relations: ["planVariant"],
    });

    if (subscription) {
      if (variant) {
        subscription.planVariant = variant;
        subscription.planVariantId = variant.id;
      }
      subscription.status = isExpired
        ? SubscriptionStatus.EXPIRED
        : SubscriptionStatus.ACTIVE;
      subscription.isActive = !isExpired;
      subscription.expires_at = expiresAt;
      subscription.is_trial = false;
    } else {
      const activePrice =
        variant?.prices?.find((p) => p.isActive) || variant?.prices?.[0];
      subscription = this.subscriptionRepository.create({
        business: { id: businessId } as Business,
        planVariant: variant || undefined,
        planVariantId: variant?.id,
        price: activePrice || undefined,
        priceId: activePrice?.id,
        plan_type: this.mapPlanType(centralPackage.planName),
        starts_at: new Date(),
        expires_at: expiresAt,
        status: isExpired
          ? SubscriptionStatus.EXPIRED
          : SubscriptionStatus.ACTIVE,
        isActive: !isExpired,
        is_trial: false,
        transaction_id: `CENTRAL-${centralPackage.providerSubscriptionId}`,
        payment_provider:
          centralPackage.provider === "stripe"
            ? PaymentProvider.STRIPE
            : PaymentProvider.PAYPAL,
      });
    }

    const saved = await this.subscriptionRepository.save(subscription);
    this.invalidateSubscriptionCache(businessId);
    return saved;
  }

  private mapPlanType(planName: string): SubscriptionPlanType {
    const name = planName?.toLowerCase() || "";
    if (name.includes("annual") || name.includes("yearly")) {
      return SubscriptionPlanType.ANNUAL;
    }
    if (name.includes("quarterly")) {
      return SubscriptionPlanType.QUARTERLY;
    }
    return SubscriptionPlanType.MONTHLY;
  }

  async syncFromCentralProfile(
    businessId: string,
    email: string,
  ): Promise<void> {
    try {
      const centralUser = await this.mcomCentralService.getUserMembership({
        email,
      });

      if (!centralUser?.success || !centralUser?.data?.packages) {
        return;
      }

      const rewardsPackage = centralUser.data.packages.find(
        (p: any) =>
          (p.platformName === "MCOM Rewards" ||
            p.platform === "MCOM Rewards") &&
          p.status === "active",
      );

      if (rewardsPackage) {
        const mappedPackage: CentralPackage = {
          platform:
            rewardsPackage.platformName ||
            rewardsPackage.platform ||
            "MCOM Rewards",
          packageName: rewardsPackage.packageName,
          planName: rewardsPackage.packageName,
          status: rewardsPackage.status === "active" ? "active" : "inactive",
          limits: {},
          expiresAt:
            rewardsPackage.expiresAt ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          provider: rewardsPackage.provider || "stripe",
          providerSubscriptionId:
            rewardsPackage.providerSubscriptionId || "CENTRAL-PROFILE",
        };

        await this.syncFromCentralPackage(businessId, mappedPackage);
      }
    } catch (error) {
      this.logger.error(
        `Failed to sync subscription from Central profile for ${email}: ${error?.message}`,
        error?.stack,
      );
    }
  }
}
