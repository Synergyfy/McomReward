import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { Business } from "../business/entities/business.entity";
import { Tier } from "../tier/entities/tier.entity";
import {
  PlanSubscription,
  SubscriptionBillingMethod,
  SubscriptionStatus,
  SubscriptionPlanType,
} from "../plans/entities/plan-subscription.entity";
import {
  PlanPayment,
  PlanPaymentMethod,
} from "../plans/entities/plan-payment.entity";
import { PaymentProvider } from "../payment-history/entities/payment-history.entity";
import {
  InitiatePlatformPurchaseDto,
  PaymentProviderType,
} from "./dto/initiate-purchase.dto";
import { ConfirmPlatformPurchaseDto } from "./dto/confirm-purchase.dto";
import { PlansService } from "../plans/plans.service";
import { PlanExpiryService } from "../plans/services/plan-expiry.service";
import { PlanTierLevelEnum } from "../plans/entities/plan-tier-level.entity";
import { JwtService } from "@nestjs/jwt";
import { PlanSubscriptionService } from "../plans/services/plan-subscription.service";
import { Role } from "../../common/role.enum";
import { toMinorUnits, fromMinorUnits } from "../../common/utils/money.util";
import {
  McomPaymentsService,
  McomChargeResponse,
} from "../payment/mcom-payments.service";
import { PaymentCheckoutService } from "../payment/payment-checkout.service";
import { PaymentFulfillmentService } from "../payment/payment-fulfillment.service";
import {
  PaymentCheckout,
  PaymentCheckoutMethod,
  PaymentCheckoutPurpose,
  PaymentCheckoutStatus,
} from "../payment/entities/payment-checkout.entity";
import { McomWalletPartnerService } from "../wallet/mcom-wallet-partner.service";
import { SubscriptionBillingService } from "../plans/services/subscription-billing.service";

@Injectable()
export class McomPackagesService implements OnModuleInit {
  private readonly logger = new Logger(McomPackagesService.name);
  private readonly platformSlug: string;

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
    @InjectRepository(PlanSubscription)
    private readonly subscriptionRepository: Repository<PlanSubscription>,
    @InjectRepository(PlanPayment)
    private readonly paymentRepository: Repository<PlanPayment>,
    private readonly configService: ConfigService,
    private readonly plansService: PlansService,
    private readonly planExpiryService: PlanExpiryService,
    private readonly jwtService: JwtService,
    private readonly planSubscriptionService: PlanSubscriptionService,
    private readonly mcomPayments: McomPaymentsService,
    private readonly checkoutService: PaymentCheckoutService,
    private readonly fulfillmentService: PaymentFulfillmentService,
    private readonly centralWallet: McomWalletPartnerService,
    private readonly billingService: SubscriptionBillingService,
  ) {
    this.platformSlug =
      this.configService.get<string>("MCOM_PLATFORM_SLUG") || "mcom-reward";
  }

  private get centralWebUrl(): string {
    return (
      this.configService.get<string>("MCOM_CENTRAL_WEB_URL") ||
      this.configService.get<string>("MCOM_SOLUTIONS_URL") ||
      "http://localhost:3010"
    ).replace(/\/$/, "");
  }

  onModuleInit(): void {
    // The generic webhook handler calls this when a plan charge is paid
    // (close-tab-after-payment backstop). Confirmation uses the same path.
    this.fulfillmentService.register(
      PaymentCheckoutPurpose.PLAN,
      async (checkout) => {
        await this.activateFromCheckout(checkout);
      },
    );
  }

  async getPurchasablePlans() {
    const unifiedPlans = await this.plansService.findAll();
    if (unifiedPlans.length > 0) {
      return unifiedPlans.map((plan) => {
        const standardVariant = plan.variants?.find(
          (v) => v.tierLevel?.name === PlanTierLevelEnum.STANDARD,
        );
        const proVariant = plan.variants?.find(
          (v) => v.tierLevel?.name === PlanTierLevelEnum.PRO,
        );
        const proPlusVariant = plan.variants?.find(
          (v) => v.tierLevel?.name === PlanTierLevelEnum.PRO_PLUS,
        );

        const standardPrice =
          standardVariant?.prices?.find((p) => p.isActive) ||
          standardVariant?.prices?.[0];
        const proPrice =
          proVariant?.prices?.find((p) => p.isActive) ||
          proVariant?.prices?.[0];
        const proPlusPrice =
          proPlusVariant?.prices?.find((p) => p.isActive) ||
          proPlusVariant?.prices?.[0];

        return {
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          description: plan.description || null,
          isActive: plan.isActive,
          monthlyPrice: Number(standardPrice?.amount || 0),
          quarterlyPrice: Number(proPrice?.amount || 0),
          annualPrice: Number(proPlusPrice?.amount || 0),
          features: standardVariant?.features || [],
          configuration: standardVariant?.configuration || null,
          variants: (plan.variants || []).map((v) => {
            const activePrice =
              v.prices?.find((p) => p.isActive) || v.prices?.[0];
            return {
              id: v.id,
              tierLevel: v.tierLevel?.name,
              sortOrder: v.tierLevel?.sortOrder,
              durationDays: v.tierLevel?.durationDays,
              isCalendarYear: v.tierLevel?.isCalendarYear,
              price: Number(activePrice?.amount || 0),
              currency: activePrice?.currency || "GBP",
              features: v.features || [],
              configuration: v.configuration || {},
              isActive: v.isActive,
            };
          }),
        };
      });
    }

    const legacyTiers = await this.tierRepository.find({
      order: { monthly_price: "ASC" },
    });

    return legacyTiers.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      monthlyPrice: Number(t.monthly_price || 0),
      quarterlyPrice: Number(
        t.quarterly_price ||
          (t.monthly_price ? Number(t.monthly_price) * 3 * 0.9 : 0),
      ),
      annualPrice: Number(t.annual_price || 0),
      features: t.features || [],
      configuration: null,
      isActive: true,
      variants: [],
    }));
  }

  private normalizeBillingCycle(cycle?: string): string {
    const c = (cycle || "monthly").toLowerCase().trim();
    if (c === "quarterly" || c === "pro") return "quarterly";
    if (c === "annual" || c === "yearly" || c === "pro_plus") return "annual";
    return "monthly";
  }

  private resolvePlanType(
    billingCycle?: string,
    tierLevelName?: string,
  ): SubscriptionPlanType {
    const cycle = (billingCycle || "").toLowerCase();
    const tier = (tierLevelName || "").toUpperCase();
    if (cycle === "annual" || cycle === "yearly" || tier === "PRO_PLUS") {
      return SubscriptionPlanType.ANNUAL;
    }
    if (cycle === "quarterly" || tier === "PRO") {
      return SubscriptionPlanType.QUARTERLY;
    }
    return SubscriptionPlanType.MONTHLY;
  }

  private mapMethod(
    provider: PaymentProviderType | string,
  ): PaymentCheckoutMethod {
    switch ((provider || "").toLowerCase()) {
      case "wallet":
      case "mcom_wallet":
        return PaymentCheckoutMethod.WALLET;
      case "paypal":
        return PaymentCheckoutMethod.PAYPAL;
      case "stripe":
      default:
        return PaymentCheckoutMethod.STRIPE;
    }
  }

  private mapPlanPaymentMethod(
    method: PaymentCheckoutMethod,
  ): PlanPaymentMethod {
    if (method === PaymentCheckoutMethod.WALLET) {
      return PlanPaymentMethod.MCOM_WALLET;
    }
    if (method === PaymentCheckoutMethod.PAYPAL) {
      return PlanPaymentMethod.PAYPAL;
    }
    return PlanPaymentMethod.STRIPE;
  }

  private mapPaymentProvider(method: PaymentCheckoutMethod): PaymentProvider {
    if (method === PaymentCheckoutMethod.WALLET) {
      return PaymentProvider.MCOM_WALLET;
    }
    if (method === PaymentCheckoutMethod.PAYPAL) {
      return PaymentProvider.PAYPAL;
    }
    return PaymentProvider.STRIPE;
  }

  private mapBillingMethod(
    method: PaymentCheckoutMethod,
  ): SubscriptionBillingMethod {
    if (method === PaymentCheckoutMethod.WALLET) {
      return SubscriptionBillingMethod.WALLET;
    }
    if (method === PaymentCheckoutMethod.PAYPAL) {
      return SubscriptionBillingMethod.PAYPAL;
    }
    return SubscriptionBillingMethod.STRIPE;
  }

  private checkoutMetadata(
    business: Business,
    variant: any,
    price: any,
    dto: InitiatePlatformPurchaseDto,
  ): Record<string, unknown> {
    return {
      platform: this.platformSlug,
      businessId: business.id,
      planVariantId: variant.id,
      planId: variant.plan?.id,
      planName: variant.plan?.name,
      tierLevel: variant.tierLevel?.name,
      priceId: price.id,
      billingCycle: dto.billingCycle,
      autoRenew: dto.autoRenew !== false,
    };
  }

  async initiatePurchase(userId: string, dto: InitiatePlatformPurchaseDto) {
    const business = await this.businessRepository.findOne({
      where: { id: userId },
    });
    if (!business) {
      throw new NotFoundException("Business profile not found");
    }

    const { variant, price } = await this.plansService.resolveActivePrice(
      dto.externalPlanId,
    );

    const method = this.mapMethod(dto.provider);
    if (method === PaymentCheckoutMethod.WALLET && !business.mcomUserId) {
      throw new BadRequestException({
        code: "ACCOUNT_NOT_LINKED",
        message:
          "Your business profile is not linked to an MCOM account. Please log in via SSO.",
      });
    }

    // A client-generated checkout id makes retries idempotent without ever
    // reusing a key for a different amount or payment method.
    const checkoutId = dto.checkoutId?.trim() || randomUUID();
    const amountMinor = toMinorUnits(price.amount);
    const idempotencyKey =
      `mcom-rewards-plan-${business.id}-${checkoutId}-${method}`.slice(0, 255);
    const reference = `plan-${business.id}-${variant.id}-${checkoutId}`.slice(
      0,
      255,
    );
    const metadata = this.checkoutMetadata(business, variant, price, dto);

    const checkout = await this.checkoutService.getOrCreate({
      businessId: business.id,
      purpose: PaymentCheckoutPurpose.PLAN,
      purposeRef: variant.id,
      amountMinor,
      currency: price.currency || "GBP",
      method,
      idempotencyKey,
      reference,
      metadata,
    });

    let response: McomChargeResponse;
    try {
      response = await this.mcomPayments.createCharge({
        amountMinor,
        currency: price.currency || "GBP",
        method,
        reference,
        description: `Plan: ${variant.plan?.name || "Rewards Plan"} (${
          variant.tierLevel?.name || "Standard"
        })`,
        mcomUserId:
          method === PaymentCheckoutMethod.WALLET
            ? business.mcomUserId
            : undefined,
        externalCustomerId: business.id,
        metadata: { ...metadata, checkoutId: checkout.id },
        idempotencyKey,
      });
    } catch (error) {
      await this.checkoutService.markFailed(
        checkout,
        (error as Error)?.message,
      );
      this.mcomPayments.toHttpException(error);
    }

    const updated = await this.checkoutService.attachCharge(checkout, response);

    return {
      success: true,
      checkoutId: updated.id,
      chargeId: response.charge.id,
      method,
      amountMinor: response.charge.amountMinor || amountMinor,
      currency: response.charge.currency || price.currency || "GBP",
      status: response.charge.status,
      clientSecret: response.clientSecret,
      approvalUrl: response.approvalUrl,
      ...(method === PaymentCheckoutMethod.WALLET
        ? { topUpUrl: this.centralWallet.topUpUrl() }
        : {}),
    };
  }

  async confirmPurchase(userId: string, dto: ConfirmPlatformPurchaseDto) {
    const business = await this.businessRepository.findOne({
      where: { id: userId },
    });
    if (!business) {
      throw new NotFoundException("Business profile not found");
    }

    const checkout = await this.resolveCheckout(business.id, dto);

    if (checkout.purpose === PaymentCheckoutPurpose.PLAN_RENEWAL) {
      await this.billingService.confirmRenewal(checkout, {
        ...(dto.paymentIntentId
          ? { paymentIntentId: dto.paymentIntentId }
          : {}),
        ...(dto.orderId ? { orderId: dto.orderId } : {}),
      });

      return {
        success: true,
        renewal: true,
        payment: {
          checkoutId: checkout.id,
          chargeId: checkout.chargeId,
          amountMinor: checkout.amountMinor,
          currency: checkout.currency,
          method: checkout.method,
          status: checkout.status,
        },
      };
    }

    if (checkout.status !== PaymentCheckoutStatus.PAID) {
      if (!checkout.chargeId) {
        throw new BadRequestException(
          "This checkout has no MCOM Pay charge. Please start the payment again.",
        );
      }

      try {
        const response = await this.mcomPayments.confirmCharge(
          checkout.chargeId,
          {
            ...(dto.paymentIntentId
              ? { paymentIntentId: dto.paymentIntentId }
              : {}),
            ...(dto.orderId ? { orderId: dto.orderId } : {}),
          },
        );

        if (response.charge.status !== "paid") {
          throw new BadRequestException(
            `Payment is not complete (status: ${response.charge.status})`,
          );
        }

        if (
          response.charge.amountMinor &&
          response.charge.amountMinor !== checkout.amountMinor
        ) {
          throw new BadRequestException(
            "Paid amount does not match the checkout amount",
          );
        }

        await this.checkoutService.attachCharge(checkout, response);
        await this.checkoutService.markPaid(checkout, response.charge);
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        this.mcomPayments.toHttpException(error);
      }
    }

    const subscription = await this.activateFromCheckout(checkout);
    const tokens = this.issueAuthTokens(business);

    return {
      success: true,
      subscription,
      payment: {
        checkoutId: checkout.id,
        chargeId: checkout.chargeId,
        amountMinor: checkout.amountMinor,
        currency: checkout.currency,
        method: checkout.method,
        status: checkout.status,
      },
      ...tokens,
    };
  }

  private async resolveCheckout(
    businessId: string,
    dto: ConfirmPlatformPurchaseDto,
  ): Promise<PaymentCheckout> {
    let checkout: PaymentCheckout | null = null;

    if (dto.checkoutId) {
      checkout = await this.checkoutService.findById(dto.checkoutId);
    } else if (dto.chargeId) {
      checkout = await this.checkoutService.findByChargeId(dto.chargeId);
    } else if (dto.paymentIntentId || dto.orderId) {
      checkout = await this.checkoutService.findByProviderRef(
        dto.paymentIntentId || dto.orderId,
      );
    } else {
      checkout = await this.checkoutService.findLatestPending(
        businessId,
        PaymentCheckoutPurpose.PLAN,
        dto.externalPlanId,
      );
    }

    if (!checkout) {
      throw new NotFoundException(
        "Checkout not found. Please start the purchase again.",
      );
    }
    if (
      checkout.purpose !== PaymentCheckoutPurpose.PLAN &&
      checkout.purpose !== PaymentCheckoutPurpose.PLAN_RENEWAL
    ) {
      throw new BadRequestException("This checkout is not a plan purchase");
    }
    if (checkout.businessId && checkout.businessId !== businessId) {
      throw new BadRequestException(
        "This checkout belongs to another business",
      );
    }

    return checkout;
  }

  private async activateFromCheckout(
    checkout: PaymentCheckout,
  ): Promise<PlanSubscription | null> {
    if (checkout.status !== PaymentCheckoutStatus.PAID) {
      throw new BadRequestException("The payment has not been completed yet");
    }

    const businessId = checkout.businessId;
    if (!businessId) {
      throw new BadRequestException("Checkout is missing a business");
    }

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException("Business profile not found");
    }

    // Already granted (webhook or a previous confirm). Return the existing
    // subscription so the confirm response can still issue fresh tokens.
    if (checkout.fulfilledAt) {
      const existing = await this.subscriptionRepository.findOne({
        where: { business: { id: businessId } },
      });
      if (existing) return existing;
    }

    if (!checkout.purposeRef) {
      throw new BadRequestException("Checkout is missing the purchased plan");
    }

    const { variant, price } = await this.plansService.resolveActivePrice(
      checkout.purposeRef,
    );

    const amount = fromMinorUnits(checkout.amountMinor);
    const paymentMethod = this.mapPlanPaymentMethod(checkout.method);
    const paymentProvider = this.mapPaymentProvider(checkout.method);
    const transactionId = checkout.chargeId || checkout.id;

    let savedPayment: PlanPayment;
    try {
      savedPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          business,
          amount,
          currency: checkout.currency || price.currency || "GBP",
          paymentMethod,
          transactionId,
          metadata: {
            checkoutId: checkout.id,
            chargeId: checkout.chargeId,
            amountMinor: checkout.amountMinor,
            feeMinor: checkout.feeMinor,
            netMinor: checkout.netMinor,
            variantId: variant.id,
            planName: variant.plan?.name,
            tierLevel: variant.tierLevel?.name,
            mcomPayment: checkout.metadata,
          },
        }),
      );
    } catch {
      savedPayment = (await this.paymentRepository.findOne({
        where: { transactionId },
      })) as PlanPayment;
      if (!savedPayment) {
        throw new BadRequestException(
          "Unable to record this payment. Please contact support.",
        );
      }
    }

    const startsAt = new Date();
    const expiresAt = this.planExpiryService.calculateExpiryForTierLevel(
      variant.tierLevel?.name,
      startsAt,
    );
    const autoRenew = checkout.metadata?.autoRenew !== false;
    const billingMethod = this.mapBillingMethod(checkout.method);

    let subscription = await this.subscriptionRepository.findOne({
      where: { business: { id: business.id } },
    });

    if (subscription) {
      subscription.planVariantId = variant.id;
      subscription.planVariant = variant;
      subscription.priceId = price.id;
      subscription.price = price;
      subscription.payment = savedPayment;
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.isActive = true;
      subscription.starts_at = startsAt;
      subscription.expires_at = expiresAt;
      subscription.is_trial = false;
      subscription.plan_type = this.resolvePlanType(
        String(checkout.metadata?.billingCycle || "monthly"),
        variant.tierLevel?.name,
      );
      subscription.transaction_id = transactionId;
      subscription.payment_provider = paymentProvider;
      subscription.autoRenew = autoRenew;
      subscription.billingMethod = billingMethod;
      subscription.billingAnchor = startsAt;
      subscription.nextBillingAt = autoRenew ? expiresAt : null;
      subscription.renewalAttempts = 0;
      subscription.graceUntil = null;
      subscription.canceledAt = null;
    } else {
      subscription = this.subscriptionRepository.create({
        business,
        planVariantId: variant.id,
        planVariant: variant,
        priceId: price.id,
        price,
        payment: savedPayment,
        status: SubscriptionStatus.ACTIVE,
        isActive: true,
        starts_at: startsAt,
        expires_at: expiresAt,
        is_trial: false,
        plan_type: this.resolvePlanType(
          String(checkout.metadata?.billingCycle || "monthly"),
          variant.tierLevel?.name,
        ),
        transaction_id: transactionId,
        payment_provider: paymentProvider,
        autoRenew,
        billingMethod,
        billingAnchor: startsAt,
        nextBillingAt: autoRenew ? expiresAt : null,
        renewalAttempts: 0,
        graceUntil: null,
        canceledAt: null,
      });
    }

    await this.subscriptionRepository.save(subscription);

    business.membershipTier = variant.plan?.name || "Standard";
    business.membershipLevel = variant.tierLevel?.name || "STANDARD";
    business.membershipStatus = "active";
    await this.businessRepository.save(business);

    this.planSubscriptionService.invalidateSubscriptionCache(business.id);
    await this.checkoutService.markFulfilled(checkout);

    this.logger.log(
      `Activated plan "${variant.plan?.name} · ${variant.tierLevel?.name}" for business ${business.id} via ${checkout.method} (${transactionId})`,
    );

    return subscription;
  }

  private issueAuthTokens(business: Business) {
    const accessExpiresIn =
      this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRES_IN") ||
      this.configService.get<string>("jwt.expiresIn") ||
      this.configService.get<string>("JWT_SECRET_EXPIRES") ||
      "1h";
    const refreshExpiresIn =
      this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRES_IN") || "7d";
    const jwtPayload = {
      username: business.email,
      sub: business.id,
      role: business.role || Role.Business,
      isEmailVerified: business.isEmailVerified,
      hasActiveSubscription: true,
      isSuperBusiness: business.isSuperBusiness || false,
    };
    const jwtSecret =
      this.configService.get<string>("jwt.secret") ||
      this.configService.get<string>("JWT_SECRET") ||
      process.env.JWT_SECRET;

    return {
      access_token: this.jwtService.sign(jwtPayload, {
        secret: jwtSecret,
        expiresIn: accessExpiresIn as any,
      }),
      refresh_token: this.jwtService.sign(jwtPayload, {
        secret: jwtSecret,
        expiresIn: refreshExpiresIn as any,
      }),
    };
  }

  async setAutoRenew(userId: string, autoRenew: boolean) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { business: { id: userId } },
    });
    if (!subscription) {
      throw new NotFoundException("No subscription found for this business");
    }

    subscription.autoRenew = autoRenew;
    subscription.canceledAt = autoRenew ? null : new Date();
    if (autoRenew) {
      subscription.nextBillingAt =
        subscription.nextBillingAt || subscription.expires_at || new Date();
      if (subscription.status === SubscriptionStatus.PAST_DUE) {
        subscription.status = SubscriptionStatus.ACTIVE;
      }
    }

    await this.subscriptionRepository.save(subscription);
    return {
      success: true,
      autoRenew: subscription.autoRenew,
      nextBillingAt: subscription.nextBillingAt
        ? new Date(subscription.nextBillingAt).toISOString()
        : null,
    };
  }

  async getMyActivePackage(userId: string) {
    let subscription = await this.subscriptionRepository.findOne({
      where: { business: { id: userId } },
      relations: [
        "planVariant",
        "planVariant.plan",
        "planVariant.tierLevel",
        "planVariant.prices",
        "price",
        "payment",
      ],
    });

    const business = await this.businessRepository.findOne({
      where: { id: userId },
    });

    // If subscription is missing, dynamically sync from stored entitlement or trial context
    if (!subscription && business) {
      if (business.entitlementData) {
        subscription = await this.planSubscriptionService.syncFromEntitlement(
          business.id,
          business.entitlementData as any,
        );
      } else if (
        business.hasPaidVerificationFee ||
        business.membershipStatus === "trial"
      ) {
        subscription = await this.planSubscriptionService.syncFromEntitlement(
          business.id,
          {
            version: "2026-10-01",
            targetPlatform: {
              clientId: "rewards",
              platformSlug: "rewards",
              name: "MCOM Rewards",
            },
            access: {
              hasAccess: true,
              accessType: "TRIAL_PROGRAMME",
              upgradeUrl: `${this.centralWebUrl}/dashboard/memberships`,
            },
            plan: {
              planId: "trial",
              planName: "14-Day Trial",
              source: "trial",
              status: "trial",
              billingCycle: "14 days",
              quotas: {},
              limits: {},
              features: [],
            },
            membershipContext: {
              membershipPlanName: null,
              membershipLevel: "STANDARD",
              membershipStatus: "trial",
              isIncludedInMembership: false,
            },
            trialContext: {
              isInTrial: true,
              hasPaidVerificationFee: true,
              trialExpiresAt: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              daysRemaining: 14,
              programmeTasks: [],
            },
          } as any,
        );
      }
    }

    const isExpired =
      !subscription ||
      (subscription.expires_at &&
        new Date(subscription.expires_at) < new Date()) ||
      subscription.status === SubscriptionStatus.EXPIRED;
    const effectiveStatus = !subscription
      ? "none"
      : isExpired
        ? "expired"
        : subscription.status || "active";
    const planName =
      subscription?.planVariant?.plan?.name ||
      (subscription?.is_trial ? "14-Day Trial" : "Free");
    const membershipLevel =
      subscription?.planVariant?.tierLevel?.name || "STANDARD";

    const isTrial = subscription?.is_trial || false;
    const hasAccess =
      !isExpired &&
      (effectiveStatus === SubscriptionStatus.ACTIVE ||
        (effectiveStatus as string) === "active" ||
        isTrial);

    const accessType = isTrial
      ? "TRIAL_PROGRAMME"
      : business?.entitlementSource === "membership"
        ? "PAID_MEMBERSHIP"
        : subscription?.isActive
          ? "DIRECT_PACKAGE"
          : "NONE";

    const upgradeUrl = `${this.centralWebUrl}/dashboard/memberships`;

    const now = Date.now();
    const expiryTimestamp = subscription?.expires_at
      ? new Date(subscription.expires_at).getTime()
      : 0;
    const daysRemaining =
      isTrial && expiryTimestamp > now
        ? Math.max(
            0,
            Math.ceil((expiryTimestamp - now) / (1000 * 60 * 60 * 24)),
          )
        : ((business?.entitlementData as any)?.trialContext?.daysRemaining ??
          (isTrial ? 14 : 0));

    return {
      subscription: subscription || null,
      membership: subscription || null, // Keep membership alias for frontend compatibility
      isLinkedToMcom: !!business?.mcomAccessToken,
      mcomUserId: business?.mcomUserId || null,
      membershipLevel,
      membershipTier: planName,
      planName,
      planVariantId:
        subscription?.planVariant?.id || subscription?.planVariantId || null,
      membershipStatus: effectiveStatus,
      isExpired,
      isTrial,
      hasAccess,
      accessType,
      source: business?.entitlementSource || (isTrial ? "trial" : "direct"),
      entitlement: business?.entitlementData || null,
      trialTasks: business?.trialTasks || [],
      hasPaidVerificationFee: business?.hasPaidVerificationFee || false,
      daysRemaining,
      upgradeUrl,
      expiresAt: subscription?.expires_at
        ? new Date(subscription.expires_at).toISOString()
        : null,
      autoRenew: subscription?.autoRenew ?? false,
      billingMethod: subscription?.billingMethod ?? null,
      nextBillingAt: subscription?.nextBillingAt
        ? new Date(subscription.nextBillingAt).toISOString()
        : null,
      renewalAttempts: subscription?.renewalAttempts ?? 0,
    };
  }
}
