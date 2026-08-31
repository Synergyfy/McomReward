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
import { Business } from "../business/entities/business.entity";
import { Tier } from "../tier/entities/tier.entity";
import { TierStatus } from "../tier/entities/tier-status.enum";
import { TierType } from "../tier/entities/tier-type.enum";
import { Membership, MembershipStatus, PlanType } from "../membership/entities/membership.entity";
import { PaymentProvider } from "../payment-history/entities/payment-history.entity";
import { SsoService } from "../sso/sso.service";
import { decrypt } from "../../common/utils/crypto.util";
import { InitiatePlatformPurchaseDto, PaymentProviderType } from "./dto/initiate-purchase.dto";
import { ConfirmPlatformPurchaseDto } from "./dto/confirm-purchase.dto";

@Injectable()
export class McomPackagesService {
  private readonly logger = new Logger(McomPackagesService.name);
  private readonly centralUrl: string;
  private readonly platformSlug: string;
  private readonly webPublicUrl: string;

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    private readonly configService: ConfigService,
    private readonly ssoService: SsoService,
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
  }

  async getPurchasablePlans() {
    const tiers = await this.tierRepository.find({
      where: { status: TierStatus.PUBLISHED },
      relations: ["season"],
      order: { monthly_price: "ASC" },
    });

    return tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      description: tier.description || null,
      monthlyPrice: Number(tier.monthly_price),
      quarterlyPrice: Number(tier.quarterly_price),
      annualPrice: Number(tier.annual_price),
      features: tier.features || [],
      configuration: tier.configuration || null,
      isActive: tier.status === TierStatus.PUBLISHED,
      isDefault: tier.is_default || false,
      type: tier.type || TierType.STANDARD,
      trialDuration: tier.configuration?.trial?.trialDuration || null,
      season: tier.season
        ? {
            id: tier.season.id,
            name: tier.season.name,
            startDate: tier.season.startDate,
            endDate: tier.season.endDate,
          }
        : null,
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

  private calculateExpiry(billingCycle: string, isTrial?: boolean, trialDays?: number): Date {
    const now = new Date();
    if (isTrial && trialDays) {
      now.setDate(now.getDate() + trialDays);
      return now;
    }
    switch (billingCycle?.toLowerCase()) {
      case "annual":
      case "yearly":
        now.setFullYear(now.getFullYear() + 1);
        break;
      case "quarterly":
        now.setMonth(now.getMonth() + 3);
        break;
      case "monthly":
      default:
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now;
  }

  async initiatePurchase(userId: string, dto: InitiatePlatformPurchaseDto) {
    const business = await this.businessRepository.findOne({ where: { id: userId } });
    if (!business) {
      throw new NotFoundException("Business profile not found");
    }

    const tier = await this.tierRepository.findOne({ where: { id: dto.externalPlanId } });
    if (!tier) {
      throw new NotFoundException("Plan not found");
    }

    let centralToken = await this.getValidCentralToken(business);

    const payload = {
      platform: this.platformSlug,
      externalPlanId: dto.externalPlanId,
      billingCycle: dto.billingCycle || "monthly",
      returnUrl: dto.returnUrl || `${this.webPublicUrl}/payment/success`,
      cancelUrl: dto.cancelUrl || `${this.webPublicUrl}/payment/cancel`,
    };

    const providerUrlPath =
      dto.provider === PaymentProviderType.PAYPAL
        ? "paypal"
        : dto.provider === PaymentProviderType.WALLET
        ? "wallet"
        : "stripe";

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

    const tier = await this.tierRepository.findOne({ where: { id: dto.externalPlanId } });
    if (!tier) {
      throw new NotFoundException("Plan not found");
    }

    let centralToken = await this.getValidCentralToken(business);
    let centralResponseData: any = null;

    if (dto.provider === "paypal" && dto.orderId) {
      // Capture PayPal order on Central
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
      } catch (error) {
        const errMsg = isAxiosError(error)
          ? error.response?.data?.message || error.message
          : (error as any)?.message;
        throw new BadRequestException(`PayPal confirmation failed: ${errMsg}`);
      }
    } else {
      // Confirm Stripe on Central
      const intentId = dto.paymentIntentId || dto.setupIntentId;
      if (!intentId) {
        throw new BadRequestException("paymentIntentId or setupIntentId is required for Stripe confirmation");
      }

      try {
        const res = await axios.post(
          `${this.centralUrl}/api/v1/payment/platform/stripe/confirm`,
          {
            platform: this.platformSlug,
            externalPlanId: dto.externalPlanId,
            billingCycle: dto.billingCycle || "monthly",
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
        if (isAxiosError(error) && error.response?.status === 401) {
          centralToken = await this.ssoService.refreshCentralToken(userId);
          const retryRes = await axios.post(
            `${this.centralUrl}/api/v1/payment/platform/stripe/confirm`,
            {
              platform: this.platformSlug,
              externalPlanId: dto.externalPlanId,
              billingCycle: dto.billingCycle || "monthly",
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
          centralResponseData = retryRes.data;
        } else {
          const errMsg = isAxiosError(error)
            ? error.response?.data?.message || error.message
            : (error as any)?.message;
          throw new BadRequestException(`Payment confirmation failed: ${errMsg}`);
        }
      }
    }

    // Immediately update local membership and unlock entitlements!
    const isTrial = tier.type === TierType.TRIAL;
    const trialDays = tier.configuration?.trial?.trialDuration || 14;
    const expiresAt = this.calculateExpiry(dto.billingCycle, isTrial, trialDays);

    let planType = PlanType.MONTHLY;
    if (dto.billingCycle?.toLowerCase() === "annual") planType = PlanType.ANNUAL;
    if (dto.billingCycle?.toLowerCase() === "quarterly") planType = PlanType.QUARTERLY;

    let membership = await this.membershipRepository.findOne({
      where: { business: { id: business.id } },
      relations: ["tier"],
    });

    if (membership) {
      membership.tier = tier;
      membership.status = MembershipStatus.ACTIVE;
      membership.plan_type = planType;
      membership.expires_at = expiresAt;
      membership.is_trial = isTrial;
      membership.transaction_id = dto.paymentIntentId || dto.setupIntentId || dto.orderId || `MCOM-${Date.now()}`;
      membership.payment_provider =
        dto.provider === "paypal" ? PaymentProvider.PAYPAL : PaymentProvider.STRIPE;
    } else {
      membership = this.membershipRepository.create({
        business,
        tier,
        status: MembershipStatus.ACTIVE,
        plan_type: planType,
        starts_at: new Date(),
        expires_at: expiresAt,
        is_trial: isTrial,
        transaction_id: dto.paymentIntentId || dto.setupIntentId || dto.orderId || `MCOM-${Date.now()}`,
        payment_provider:
          dto.provider === "paypal" ? PaymentProvider.PAYPAL : PaymentProvider.STRIPE,
      });
    }

    await this.membershipRepository.save(membership);

    // Update business cached membership tier
    business.membershipTier = tier.name;
    business.membershipStatus = "active";
    await this.businessRepository.save(business);

    this.logger.log(`Successfully activated plan "${tier.name}" for business ${business.id}`);

    return {
      success: true,
      membership,
      package: centralResponseData,
    };
  }

  async getMyActivePackage(userId: string) {
    const membership = await this.membershipRepository.findOne({
      where: { business: { id: userId } },
      relations: ["tier", "tier.season"],
    });

    const business = await this.businessRepository.findOne({ where: { id: userId } });

    return {
      membership: membership || null,
      isLinkedToMcom: !!business?.mcomAccessToken,
      mcomUserId: business?.mcomUserId || null,
      membershipLevel: business?.membershipLevel || "Standard",
      membershipTier: business?.membershipTier || membership?.tier?.name || "Free",
      membershipStatus: business?.membershipStatus || membership?.status || "inactive",
    };
  }
}
