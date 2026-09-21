import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import axios, { isAxiosError } from "axios";
import * as crypto from "crypto";
import { Business } from "../business/entities/business.entity";
import { Tier } from "../tier/entities/tier.entity";
import {
  PlanSubscription,
  SubscriptionStatus,
  SubscriptionPlanType,
} from "../plans/entities/plan-subscription.entity";
import {
  PlanPayment,
  PlanPaymentMethod,
} from "../plans/entities/plan-payment.entity";
import { PaymentProvider } from "../payment-history/entities/payment-history.entity";
import { SsoService } from "../sso/sso.service";
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

@Injectable()
export class McomPackagesService {
  private readonly logger = new Logger(McomPackagesService.name);
  private readonly centralUrl: string;
  private readonly platformSlug: string;
  private readonly webPublicUrl: string;
  private readonly hmacSecret: string;
  private readonly clientId: string;

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
    private readonly ssoService: SsoService,
    private readonly plansService: PlansService,
    private readonly planExpiryService: PlanExpiryService,
    private readonly jwtService: JwtService,
    private readonly planSubscriptionService: PlanSubscriptionService,
  ) {
    this.centralUrl = (
      this.configService.get<string>("MCOM_SOLUTIONS_URL") ||
      this.configService.get<string>("MCOM_CENTRAL_BASE_URL") ||
      "http://localhost:3010"
    ).replace(/\/$/, "");

    this.platformSlug =
      this.configService.get<string>("MCOM_PLATFORM_SLUG") || "rewards";

    this.webPublicUrl = (
      this.configService.get<string>("WEB_PUBLIC_URL") ||
      this.configService.get<string>("LOYALTY_FRONTEND_URL") ||
      "http://localhost:3005"
    ).replace(/\/$/, "");

    this.hmacSecret = this.configService.get<string>("MCOM_HMAC_SECRET") || "";
    this.clientId =
      this.configService.get<string>("MCOM_CLIENT_ID") || "mcom-rewards";
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

  private async getValidCentralToken(business: Business): Promise<string> {
    if (!business.mcomAccessToken) {
      throw new UnauthorizedException(
        "Business is not linked to MCOM Solutions. Please log in via SSO.",
      );
    }
    return this.ssoService.refreshCentralToken(business.id);
  }

  private walletPartnerHeaders(
    body: object,
    idempotencyKey: string,
  ): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyString = JSON.stringify(body);
    const signaturePayload = `${this.clientId}:${timestamp}:${bodyString}`;
    const signature = crypto
      .createHmac("sha256", this.hmacSecret)
      .update(signaturePayload)
      .digest("hex");

    return {
      "X-Service-Id": this.clientId,
      "X-Timestamp": timestamp,
      "X-Signature": signature,
      "Idempotency-Key": idempotencyKey,
      "Content-Type": "application/json",
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
    const variantId = variant.id;

    let centralToken = await this.getValidCentralToken(business);

    if (dto.provider === PaymentProviderType.WALLET) {
      try {
        const idempotencyKey = `mcom-rewards-hold-${business.id}-${Date.now()}`;
        const holdPayload = {
          userId: business.mcomUserId,
          amount: Number(price.amount),
          currency: price.currency || "GBP",
          ttlSeconds: 900,
          reason: `Plan Subscription: ${variant.plan?.name || "Rewards Plan"} (${variant.tierLevel?.name || "Standard"})`,
          reference: `hold-${business.id}`,
          metadata: {
            platform: this.platformSlug,
            planVariantId: variantId,
            category: "SUBSCRIPTION",
          },
        };

        const holdRes = await axios.post(
          `${this.centralUrl}/api/v1/wallet/partner/hold/place`,
          holdPayload,
          { headers: this.walletPartnerHeaders(holdPayload, idempotencyKey) },
        );
        return {
          success: true,
          holdId: holdRes.data?.holdId || `hold_${Date.now()}`,
          idempotencyKey,
          ...holdRes.data,
        };
      } catch (walletErr) {
        const errMsg = isAxiosError(walletErr)
          ? walletErr.response?.data?.message || walletErr.message
          : (walletErr as any)?.message;
        this.logger.error(`Wallet hold creation failed: ${errMsg}`);
        throw new BadRequestException(`Wallet reservation failed: ${errMsg}`);
      }
    }

    const payload = {
      platform: this.platformSlug,
      externalPlanId: variantId,
      billingCycle: this.normalizeBillingCycle(dto.billingCycle || "monthly"),
      returnUrl:
        dto.returnUrl ||
        `${this.webPublicUrl}/business/subscription?upgrade=success`,
      cancelUrl:
        dto.cancelUrl ||
        `${this.webPublicUrl}/business/subscription?upgrade=cancel`,
    };

    const providerUrlPath =
      dto.provider === PaymentProviderType.PAYPAL ? "paypal" : "stripe";

    try {
      const res = await axios.post(
        `${this.centralUrl}/api/v1/payment/platform/${providerUrlPath}/initiate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${centralToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      return res.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        this.logger.warn(
          `Central token expired for user ${userId}, attempting auto-refresh...`,
        );
        try {
          centralToken = await this.ssoService.refreshCentralToken(userId);
          const retryRes = await axios.post(
            `${this.centralUrl}/api/v1/payment/platform/${providerUrlPath}/initiate`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${centralToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          return retryRes.data;
        } catch (refreshErr) {
          this.logger.error(
            `Auto-refresh token failed: ${(refreshErr as any)?.message}`,
          );
          throw new UnauthorizedException({
            code: "CENTRAL_SESSION_EXPIRED",
            message:
              "Your MCOM Central session has expired. Please sign in again.",
          });
        }
      }

      const errMsg = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : (error as any)?.message;
      this.logger.error(`Failed to initiate payment on Central: ${errMsg}`);
      throw new BadRequestException(`Payment initiation failed: ${errMsg}`);
    }
  }

  async confirmPurchase(userId: string, dto: ConfirmPlatformPurchaseDto) {
    const business = await this.businessRepository.findOne({
      where: { id: userId },
    });
    if (!business) {
      throw new NotFoundException("Business profile not found");
    }

    const { variant, price } = await this.plansService.resolveActivePrice(
      dto.externalPlanId,
    );

    let centralToken = await this.getValidCentralToken(business);
    let centralResponseData: any = null;
    let transactionId =
      dto.paymentIntentId ||
      dto.setupIntentId ||
      dto.orderId ||
      `TX-${Date.now()}`;

    // 1. Process with MCOM Solutions
    if (dto.provider === "wallet" || dto.provider === "mcom_wallet") {
      const holdId = dto.holdId;

      if (holdId) {
        try {
          const idempotencyKey = `mcom-rewards-capture-${holdId}`;
          const captureRes = await axios.post(
            `${this.centralUrl}/api/v1/wallet/partner/hold/capture`,
            {
              holdId,
              description: `Plan: ${variant.plan?.name || "Rewards Plan"} (${variant.tierLevel?.name || "Standard"})`,
              category: "SUBSCRIPTION",
            },
            { headers: this.walletPartnerHeaders({ holdId }, idempotencyKey) },
          );
          centralResponseData = captureRes.data;
          transactionId = holdId;
        } catch (captureErr) {
          const errMsg = isAxiosError(captureErr)
            ? captureErr.response?.data?.message || captureErr.message
            : (captureErr as any)?.message;
          throw new BadRequestException(
            `Failed to capture wallet hold: ${errMsg}`,
          );
        }
      } else {
        try {
          const idempotencyKey = `mcom-rewards-sub-${business.id}-${Date.now()}`;
          const debitPayload = {
            userId: business.mcomUserId,
            amount: Number(price.amount),
            currency: price.currency || "GBP",
            category: "SUBSCRIPTION",
            description: `Plan: ${variant.plan?.name || "Rewards Plan"} (${variant.tierLevel?.name || "Standard"})`,
            metadata: {
              platform: this.platformSlug,
              planVariantId: variant.id,
            },
          };
          const debitRes = await axios.post(
            `${this.centralUrl}/api/v1/wallet/partner/debit`,
            debitPayload,
            {
              headers: this.walletPartnerHeaders(debitPayload, idempotencyKey),
            },
          );
          centralResponseData = debitRes.data;
          transactionId = debitRes.data?.transactionId || `WLT-${Date.now()}`;
        } catch (walletErr) {
          const errMsg = isAxiosError(walletErr)
            ? walletErr.response?.data?.message || walletErr.message
            : (walletErr as any)?.message;
          throw new BadRequestException(`Wallet payment failed: ${errMsg}`);
        }
      }
    } else if (dto.provider === "paypal" && dto.orderId) {
      try {
        const res = await axios.post(
          `${this.centralUrl}/api/v1/payment/platform/paypal/capture`,
          { orderId: dto.orderId },
          {
            headers: {
              Authorization: `Bearer ${centralToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        centralResponseData = res.data;
        transactionId = dto.orderId;
      } catch (error) {
        const errMsg = isAxiosError(error)
          ? error.response?.data?.message || error.message
          : (error as any)?.message;
        throw new BadRequestException(`PayPal confirmation failed: ${errMsg}`);
      }
    } else {
      const intentId = dto.paymentIntentId || dto.setupIntentId;
      if (!intentId) {
        throw new BadRequestException(
          "paymentIntentId or setupIntentId is required for Stripe confirmation",
        );
      }
      transactionId = intentId;

      try {
        const res = await axios.post(
          `${this.centralUrl}/api/v1/payment/platform/stripe/confirm`,
          {
            platform: this.platformSlug,
            externalPlanId: variant.id,
            billingCycle: this.normalizeBillingCycle(
              dto.billingCycle || "monthly",
            ),
            paymentIntentId: intentId,
            setupIntentId: dto.setupIntentId,
          },
          {
            headers: {
              Authorization: `Bearer ${centralToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        centralResponseData = res.data;
      } catch (error) {
        const stripeErrCode = isAxiosError(error)
          ? (error.response?.data?.error?.code ?? error.response?.data?.code)
          : null;
        const stripeStatus = isAxiosError(error)
          ? error.response?.data?.error?.payment_intent?.status
          : null;

        if (
          stripeErrCode === "payment_intent_unexpected_state" &&
          stripeStatus === "succeeded"
        ) {
          this.logger.log(
            `PI ${intentId} already succeeded (client-side confirm) — activating plan subscription without re-confirming`,
          );
          centralResponseData = {
            transactionId: intentId,
            status: "succeeded",
            source: "already_confirmed",
          };
        } else if (isAxiosError(error) && error.response?.status === 401) {
          centralToken = await this.ssoService.refreshCentralToken(userId);
          try {
            const retryRes = await axios.post(
              `${this.centralUrl}/api/v1/payment/platform/stripe/confirm`,
              {
                platform: this.platformSlug,
                externalPlanId: variant.id,
                billingCycle: this.normalizeBillingCycle(
                  dto.billingCycle || "monthly",
                ),
                paymentIntentId: intentId,
                setupIntentId: dto.setupIntentId,
              },
              {
                headers: {
                  Authorization: `Bearer ${centralToken}`,
                  "Content-Type": "application/json",
                },
              },
            );
            centralResponseData = retryRes.data;
          } catch (refreshErr) {
            this.logger.error(
              `Auto-refresh token failed: ${(refreshErr as any)?.message}`,
            );
            throw new UnauthorizedException({
              code: "CENTRAL_SESSION_EXPIRED",
              message:
                "Your MCOM Central session has expired. Please sign in again.",
            });
          }
        } else {
          const errMsg = isAxiosError(error)
            ? error.response?.data?.message || error.message
            : (error as any)?.message;
          throw new BadRequestException(
            `Payment confirmation failed: ${errMsg}`,
          );
        }
      }
    }

    // 2. Save PlanPayment record
    let paymentMethod = PlanPaymentMethod.STRIPE;
    if (dto.provider === "paypal") paymentMethod = PlanPaymentMethod.PAYPAL;
    if (dto.provider === "wallet" || dto.provider === "mcom_wallet") {
      paymentMethod = PlanPaymentMethod.MCOM_WALLET;
    }

    let savedPayment: PlanPayment;
    try {
      const payment = this.paymentRepository.create({
        business,
        amount: Number(price.amount),
        currency: price.currency || "GBP",
        paymentMethod,
        transactionId,
        metadata: {
          variantId: variant.id,
          planName: variant.plan?.name,
          tierLevel: variant.tierLevel?.name,
          centralResponse: centralResponseData,
        },
      });
      savedPayment = await this.paymentRepository.save(payment);
    } catch {
      savedPayment = (await this.paymentRepository.findOne({
        where: { transactionId },
      })) as PlanPayment;
    }

    // 3. Compute leap-safe expiry date
    const startsAt = new Date();
    const expiresAt = this.planExpiryService.calculateExpiryForTierLevel(
      variant.tierLevel?.name,
      startsAt,
    );

    // 4. Update local PlanSubscription in-place (1:1 per business)
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
        dto.billingCycle,
        variant.tierLevel?.name,
      );
      subscription.transaction_id = transactionId;
      subscription.payment_provider =
        dto.provider === "paypal"
          ? PaymentProvider.PAYPAL
          : PaymentProvider.STRIPE;
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
          dto.billingCycle,
          variant.tierLevel?.name,
        ),
        transaction_id: transactionId,
        payment_provider:
          dto.provider === "paypal"
            ? PaymentProvider.PAYPAL
            : PaymentProvider.STRIPE,
      });
    }

    await this.subscriptionRepository.save(subscription);

    // 5. Update cached business fields
    business.membershipTier = variant.plan?.name || "Standard";
    business.membershipLevel = variant.tierLevel?.name || "STANDARD";
    business.membershipStatus = "active";
    await this.businessRepository.save(business);

    // 6. Invalidate subscription cache so next guard sees new plan instantly
    this.planSubscriptionService.invalidateSubscriptionCache(business.id);

    // 7. Issue refreshed JWT
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
    const access_token = this.jwtService.sign(jwtPayload, {
      secret: jwtSecret,
      expiresIn: accessExpiresIn as any,
    });
    const refresh_token = this.jwtService.sign(jwtPayload, {
      secret: jwtSecret,
      expiresIn: refreshExpiresIn as any,
    });

    this.logger.log(
      `Successfully activated Plan Variant "${variant.plan?.name} · ${variant.tierLevel?.name}" for business ${business.id}`,
    );

    return {
      success: true,
      subscription,
      package: centralResponseData,
      access_token,
      refresh_token,
    };
  }

  async getMyActivePackage(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
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
    const planName = subscription?.planVariant?.plan?.name || "Free";
    const membershipLevel =
      subscription?.planVariant?.tierLevel?.name || "STANDARD";

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
      isTrial: subscription?.is_trial || false,
      expiresAt: subscription?.expires_at
        ? new Date(subscription.expires_at).toISOString()
        : null,
    };
  }
}
