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
import { TierStatus } from "../tier/entities/tier-status.enum";
import { Membership, MembershipStatus, PlanType } from "../membership/entities/membership.entity";
import { MembershipPayment, MembershipPaymentMethod } from "../membership/entities/membership-payment.entity";
import { PaymentProvider } from "../payment-history/entities/payment-history.entity";
import { SsoService } from "../sso/sso.service";
import { decrypt } from "../../common/utils/crypto.util";
import { InitiatePlatformPurchaseDto, PaymentProviderType } from "./dto/initiate-purchase.dto";
import { ConfirmPlatformPurchaseDto } from "./dto/confirm-purchase.dto";
import { PlansService } from "../plans/plans.service";
import { PlanExpiryService } from "../plans/services/plan-expiry.service";
import { PlanTierLevelEnum } from "../plans/entities/plan-tier-level.entity";
import { JwtService } from "@nestjs/jwt";
import { MembershipService } from "../membership/membership.service";
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
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(MembershipPayment)
    private readonly paymentRepository: Repository<MembershipPayment>,
    private readonly configService: ConfigService,
    private readonly ssoService: SsoService,
    private readonly plansService: PlansService,
    private readonly planExpiryService: PlanExpiryService,
    private readonly jwtService: JwtService,
    private readonly membershipService: MembershipService,
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

    this.hmacSecret =
      this.configService.get<string>("MCOM_HMAC_SECRET") || "";
    this.clientId =
      this.configService.get<string>("MCOM_CLIENT_ID") || "mcom-rewards";
  }

  async getPurchasablePlans() {
    // 1. Fetch all unified plans with 3 variants
    const unifiedPlans = await this.plansService.findAll();
    if (unifiedPlans.length > 0) {
      return unifiedPlans.map((plan) => {
        const standardVariant = plan.variants?.find(
          (v) => v.tierLevel?.name === PlanTierLevelEnum.STANDARD
        );
        const proVariant = plan.variants?.find(
          (v) => v.tierLevel?.name === PlanTierLevelEnum.PRO
        );
        const proPlusVariant = plan.variants?.find(
          (v) => v.tierLevel?.name === PlanTierLevelEnum.PRO_PLUS
        );

        const standardPrice = standardVariant?.prices?.find((p) => p.isActive) || standardVariant?.prices?.[0];
        const proPrice = proVariant?.prices?.find((p) => p.isActive) || proVariant?.prices?.[0];
        const proPlusPrice = proPlusVariant?.prices?.find((p) => p.isActive) || proPlusVariant?.prices?.[0];

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
            const activePrice = v.prices?.find((p) => p.isActive) || v.prices?.[0];
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

    // 2. Fallback to legacy tiers if needed
    const tiers = await this.tierRepository.find({
      where: { status: TierStatus.PUBLISHED },
      relations: ["season"],
      order: { monthly_price: "ASC" },
    });

    return tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      slug: tier.name.toLowerCase().replace(/\s+/g, "-"),
      description: tier.description || null,
      monthlyPrice: Number(tier.monthly_price),
      quarterlyPrice: Number(tier.quarterly_price),
      annualPrice: Number(tier.annual_price),
      features: tier.features || [],
      configuration: tier.configuration || null,
      isActive: tier.status === TierStatus.PUBLISHED,
      isDefault: tier.is_default || false,
      type: tier.type,
      variants: [],
    }));
  }

  private async getValidCentralToken(business: Business): Promise<string> {
    if (!business.mcomAccessToken) {
      throw new UnauthorizedException({
        code: "ACCOUNT_NOT_LINKED",
        message: "Your account is not connected to MCOM Central. Please connect to continue.",
      });
    }

    const decryptedToken = decrypt(business.mcomAccessToken);
    return decryptedToken;
  }

  /**
   * HMAC-SHA256 sign a request body (or empty string for GET) as required
   * by the MCOM Wallet partner API.
   */
  private signWalletRequest(body: unknown): string {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    return (
      'sha256=' +
      crypto.createHmac('sha256', this.hmacSecret).update(raw).digest('hex')
    );
  }

  private walletPartnerHeaders(
    body: unknown,
    idempotencyKey?: string,
  ): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Mcom-Client-ID': this.clientId,
      'X-Mcom-Signature': this.signWalletRequest(body),
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
    };
  }

  /**
   * Derives a PlanType from the billing cycle or tier level name sent by the
   * frontend / returned by the variant. Ensures plan_type is never null.
   */
  private resolvePlanType(billingCycle?: string, tierLevelName?: string): PlanType {
    const raw = ((billingCycle || tierLevelName || '')).toUpperCase();
    if (raw.includes('ANNUAL') || raw.includes('PRO_PLUS') || raw.includes('PRO+') || raw.includes('YEAR')) {
      return PlanType.ANNUAL;
    }
    if (raw.includes('QUARTER') || raw === 'PRO') {
      return PlanType.QUARTERLY;
    }
    return PlanType.MONTHLY; // safe default
  }

  /**
   * Maps tier-level names sent by the frontend (STANDARD, PRO, PRO_PLUS)
   * to the billing cycle names expected by Central Hub (monthly, quarterly, annual).
   */
  private normalizeBillingCycle(billingCycle: string): string {
    switch ((billingCycle || '').toUpperCase()) {
      case 'STANDARD':
      case 'MONTHLY':
        return 'monthly';
      case 'PRO':
      case 'QUARTERLY':
        return 'quarterly';
      case 'PRO_PLUS':
      case 'PRO+':
      case 'ANNUAL':
        return 'annual';
      default:
        return 'monthly';
    }
  }

  async initiatePurchase(userId: string, dto: InitiatePlatformPurchaseDto) {
    const business = await this.businessRepository.findOne({ where: { id: userId } });
    if (!business) {
      throw new NotFoundException("Business profile not found");
    }

    // Resolve variant and price from PlansService (or fallback)
    let variantId = dto.externalPlanId;
    try {
      const { variant } = await this.plansService.resolveActivePrice(dto.externalPlanId);
      variantId = variant.id;
    } catch {
      // Fallback
    }

    let centralToken = await this.getValidCentralToken(business);

    // MCOM WALLET RAIL — uses HMAC partner API, NOT Bearer token
    if (dto.provider === PaymentProviderType.WALLET || (dto.provider as any) === "mcom_wallet") {
      try {
        const { price } = await this.plansService.resolveActivePrice(variantId);
        const idempotencyKey = `mcom-rewards-hold-${business.id}-${variantId}`;
        // NOTE: PlaceHoldDto on Central (McomSolutions) allows only
        // userId, amount, reference, description, metadata, ttlHours.
        // A top-level `category` is rejected by forbidNonWhitelisted validation.
        const holdPayload = {
          userId: business.mcomUserId || business.id,
          amount: Number(price.amount),
          description: `Plan hold for variant ${variantId}`,
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

    // STRIPE & PAYPAL RAILS
    const payload = {
      platform: this.platformSlug,
      externalPlanId: variantId,
      billingCycle: this.normalizeBillingCycle(dto.billingCycle || 'monthly'),
      returnUrl: dto.returnUrl || `${this.webPublicUrl}/business/subscription?upgrade=success`,
      cancelUrl: dto.cancelUrl || `${this.webPublicUrl}/business/subscription?upgrade=cancel`,
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
        }
      );
      return res.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        this.logger.warn(`Central token expired for user ${userId}, attempting auto-refresh...`);
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
            }
          );
          return retryRes.data;
        } catch (refreshErr) {
          this.logger.error(`Auto-refresh token failed: ${refreshErr?.message}`);
          throw new UnauthorizedException({
            code: "CENTRAL_SESSION_EXPIRED",
            message: "Your MCOM Central session has expired. Please sign in again.",
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
    const business = await this.businessRepository.findOne({ where: { id: userId } });
    if (!business) {
      throw new NotFoundException("Business profile not found");
    }

    const { variant, price } = await this.plansService.resolveActivePrice(dto.externalPlanId);

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
        // Preferred path: capture the pre-authorized hold
        try {
          const idempotencyKey = `mcom-rewards-capture-${holdId}`;
          // CaptureHoldDto allows optional category — use SUBSCRIPTION so the
          // ledger records the correct transaction type (defaults to HOLD_CAPTURE).
          const capturePayload = { holdId, category: "SUBSCRIPTION" };
          const captureRes = await axios.post(
            `${this.centralUrl}/api/v1/wallet/partner/hold/capture`,
            capturePayload,
            { headers: this.walletPartnerHeaders(capturePayload, idempotencyKey) },
          );
          centralResponseData = captureRes.data;
          transactionId = captureRes.data?.transactionId || transactionId;
        } catch (walletErr) {
          const errMsg = isAxiosError(walletErr)
            ? walletErr.response?.data?.message || walletErr.message
            : (walletErr as any)?.message;
          throw new BadRequestException(`Wallet capture failed: ${errMsg}`);
        }
      } else {
        // Fallback path: direct debit (no prior hold — e.g. hold expired or flow skipped)
        try {
          const idempotencyKey = `mcom-rewards-debit-${business.id}-${variant.id}`;
          const debitPayload = {
            userId: business.mcomUserId || business.id,
            amount: Number(price.amount),
            category: "SUBSCRIPTION",
            description: `${variant.plan?.name || "Plan"} · ${variant.tierLevel?.name || ""} subscription`,
            reference: `sub-${business.id}`,
            metadata: {
              platform: this.platformSlug,
              planVariantId: variant.id,
            },
          };
          const debitRes = await axios.post(
            `${this.centralUrl}/api/v1/wallet/partner/debit`,
            debitPayload,
            { headers: this.walletPartnerHeaders(debitPayload, idempotencyKey) },
          );
          centralResponseData = debitRes.data;
          transactionId = debitRes.data?.transactionId || transactionId;
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
          }
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
      // Stripe — the client has already confirmed the intent via stripe.confirmPayment().
      // We call McomSolutions /stripe/confirm to record the transaction server-side.
      // If the intent was already confirmed (payment_intent_unexpected_state) that means
      // Stripe already charged the card — treat it as success and proceed to activate.
      const intentId = dto.paymentIntentId || dto.setupIntentId;
      if (!intentId) {
        throw new BadRequestException("paymentIntentId or setupIntentId is required for Stripe confirmation");
      }
      transactionId = intentId;

      try {
        const res = await axios.post(
          `${this.centralUrl}/api/v1/payment/platform/stripe/confirm`,
          {
            platform: this.platformSlug,
            externalPlanId: variant.id,
            billingCycle: this.normalizeBillingCycle(dto.billingCycle || 'monthly'),
            paymentIntentId: intentId,
            setupIntentId: dto.setupIntentId,
          },
          {
            headers: {
              Authorization: `Bearer ${centralToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        centralResponseData = res.data;
      } catch (error) {
        // payment_intent_unexpected_state with status=succeeded means the client already
        // confirmed this PI — Stripe has collected the money. Treat as success.
        const stripeErrCode =
          isAxiosError(error)
            ? (error.response?.data?.error?.code ?? error.response?.data?.code)
            : null;
        const stripeStatus =
          isAxiosError(error)
            ? error.response?.data?.error?.payment_intent?.status
            : null;

        if (stripeErrCode === 'payment_intent_unexpected_state' && stripeStatus === 'succeeded') {
          this.logger.log(
            `PI ${intentId} already succeeded (client-side confirm) — activating membership without re-confirming`,
          );
          centralResponseData = {
            transactionId: intentId,
            status: 'succeeded',
            source: 'already_confirmed',
          };
        } else if (isAxiosError(error) && error.response?.status === 401) {
          // Token expired — refresh and retry once
          centralToken = await this.ssoService.refreshCentralToken(userId);
          try {
            const retryRes = await axios.post(
              `${this.centralUrl}/api/v1/payment/platform/stripe/confirm`,
              {
                platform: this.platformSlug,
                externalPlanId: variant.id,
                billingCycle: this.normalizeBillingCycle(dto.billingCycle || 'monthly'),
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
            this.logger.error(`Auto-refresh token failed: ${(refreshErr as any)?.message}`);
            throw new UnauthorizedException({
              code: "CENTRAL_SESSION_EXPIRED",
              message: "Your MCOM Central session has expired. Please sign in again.",
            });
          }
        } else {
          const errMsg = isAxiosError(error)
            ? error.response?.data?.message || error.message
            : (error as any)?.message;
          throw new BadRequestException(`Payment confirmation failed: ${errMsg}`);
        }
      }
    }

    // 2. Save MembershipPayment record
    let paymentMethod = MembershipPaymentMethod.STRIPE;
    if (dto.provider === "paypal") paymentMethod = MembershipPaymentMethod.PAYPAL;
    if (dto.provider === "wallet" || dto.provider === "mcom_wallet") {
      paymentMethod = MembershipPaymentMethod.MCOM_WALLET;
    }

    let savedPayment: MembershipPayment;
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
      savedPayment = await this.paymentRepository.findOne({
        where: { transactionId },
      });
    }

    // 3. Compute leap-safe expiry date
    const startsAt = new Date();
    const expiresAt = this.planExpiryService.calculateExpiryForTierLevel(
      variant.tierLevel?.name,
      startsAt
    );

    // 4. Update local membership in-place (1:1 per business)
    let membership = await this.membershipRepository.findOne({
      where: { business: { id: business.id } },
    });

    if (membership) {
      membership.planVariantId = variant.id;
      membership.priceId = price.id;
      membership.payment = savedPayment;
      membership.status = MembershipStatus.ACTIVE;
      membership.isActive = true;
      membership.starts_at = startsAt;
      membership.expires_at = expiresAt;
      membership.is_trial = false;
      membership.plan_type = this.resolvePlanType(dto.billingCycle, variant.tierLevel?.name);
      membership.transaction_id = transactionId;
      membership.payment_provider =
        dto.provider === "paypal"
          ? PaymentProvider.PAYPAL
          : dto.provider === "wallet" || dto.provider === "mcom_wallet"
          ? PaymentProvider.STRIPE // MCOM_WALLET maps through STRIPE enum for now
          : PaymentProvider.STRIPE;
    } else {
      membership = this.membershipRepository.create({
        business,
        planVariantId: variant.id,
        priceId: price.id,
        payment: savedPayment,
        status: MembershipStatus.ACTIVE,
        isActive: true,
        starts_at: startsAt,
        expires_at: expiresAt,
        is_trial: false,
        plan_type: this.resolvePlanType(dto.billingCycle, variant.tierLevel?.name),
        transaction_id: transactionId,
        payment_provider:
          dto.provider === "paypal"
            ? PaymentProvider.PAYPAL
            : PaymentProvider.STRIPE,
      });
    }

    await this.membershipRepository.save(membership);

    // 5. Update cached business fields
    business.membershipTier = variant.plan?.name || "Standard";
    business.membershipLevel = variant.tierLevel?.name || "STANDARD";
    business.membershipStatus = "active";
    await this.businessRepository.save(business);

    // 6. Invalidate membership cache so next guard sees new plan instantly
    this.membershipService.invalidateMembershipCache(business.id);

    // 7. Issue refreshed JWT (no hardcoded expires — from Config)
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
      `Successfully activated Plan Variant "${variant.plan?.name} · ${variant.tierLevel?.name}" for business ${business.id}`
    );

    return {
      success: true,
      membership,
      package: centralResponseData,
      access_token,
      refresh_token,
    };
  }

  /**
   * LOCAL-FIRST active-package read. Single source of truth for
   * /dashboard/subscription: local membership + planVariant relations.
   * Expiry is computed live from expires_at so stale cached
   * business.membershipStatus can never resurrect an expired plan.
   */
  async getMyActivePackage(userId: string) {
    const membership = await this.membershipRepository.findOne({
      where: { business: { id: userId } },
      relations: [
        "planVariant",
        "planVariant.plan",
        "planVariant.tierLevel",
        "planVariant.prices",
        "tier",
        "tier.season",
      ],
    });

    const business = await this.businessRepository.findOne({ where: { id: userId } });

    const isExpired =
      !membership ||
      (membership.expires_at && new Date(membership.expires_at) < new Date()) ||
      membership.status === "expired";
    const effectiveStatus = !membership
      ? "none"
      : isExpired
        ? "expired"
        : membership.status || "active";
    const planName =
      membership?.planVariant?.plan?.name || membership?.tier?.name || "Free";
    const membershipLevel =
      membership?.planVariant?.tierLevel?.name || "STANDARD";

    return {
      membership: membership || null,
      isLinkedToMcom: !!business?.mcomAccessToken,
      mcomUserId: business?.mcomUserId || null,
      membershipLevel,
      membershipTier: planName,
      planName,
      planVariantId:
        membership?.planVariant?.id || (membership as any)?.planVariantId || null,
      membershipStatus: effectiveStatus,
      isExpired,
      isTrial: membership?.is_trial || false,
      expiresAt: membership?.expires_at
        ? new Date(membership.expires_at).toISOString()
        : null,
    };
  }
}
