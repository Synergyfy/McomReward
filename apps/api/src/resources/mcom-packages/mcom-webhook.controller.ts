import {
  Controller,
  Post,
  Headers,
  Req,
  UnauthorizedException,
  Logger,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as crypto from "crypto";
import { Public } from "../../common/decorators/public.decorator";
import { RawBody } from "../../common/decorators/raw-body.decorator";
import { Business } from "../business/entities/business.entity";
import {
  PlanSubscription,
  SubscriptionStatus,
  SubscriptionPlanType,
} from "../plans/entities/plan-subscription.entity";
import { PlanVariant } from "../plans/entities/plan-variant.entity";
import { Plan } from "../plans/entities/plan.entity";
import { PlanSubscriptionService } from "../plans/services/plan-subscription.service";
import { McomCentralService } from "../sso/mcom-central.service";
import { EntitlementSyncService } from "../sso/entitlement-sync.service";
import { RewardFulfilmentService } from "../reward-fulfilment/reward-fulfilment.service";

@ApiTags("MCOM Webhooks")
@Controller("mcom")
@Public()
export class McomWebhookController {
  private readonly logger = new Logger(McomWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(PlanSubscription)
    private readonly subscriptionRepository: Repository<PlanSubscription>,
    private readonly planSubscriptionService: PlanSubscriptionService,
    private readonly mcomCentralService: McomCentralService,
    private readonly entitlementSyncService: EntitlementSyncService,
    private readonly rewardFulfilment: RewardFulfilmentService,
  ) {}

  private verifySignature(
    rawBody: Buffer | string,
    signatureHeader?: string,
  ): boolean {
    const webhookSecret =
      this.configService.get<string>("MCOM_WEBHOOK_SECRET") ||
      this.configService.get<string>("SSO_API_SECRET");

    if (!webhookSecret) {
      if (process.env.NODE_ENV !== "production") {
        this.logger.warn(
          "Neither MCOM_WEBHOOK_SECRET nor SSO_API_SECRET is configured (allowed only in non-production)",
        );
        return true;
      }
      this.logger.error(
        "Webhook signing secret is not configured in production",
      );
      return false;
    }

    if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
      if (process.env.NODE_ENV !== "production") {
        this.logger.warn(
          "Webhook signature missing or header not starting with sha256= (allowed in dev)",
        );
        return true;
      }
      return false;
    }

    const expectedHash = signatureHeader.replace(/^sha256=/, "");
    const actualHash = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    try {
      const expectedBuf = Buffer.from(expectedHash, "hex");
      const actualBuf = Buffer.from(actualHash, "hex");
      if (expectedBuf.length !== actualBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    } catch {
      return false;
    }
  }

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Handle inbound MCOM Solutions lifecycle webhooks" })
  @ApiResponse({ status: 200, description: "Webhook processed" })
  @ApiResponse({ status: 401, description: "Invalid webhook signature" })
  async handleWebhook(
    @Headers("x-mcom-webhook-signature") webhookSig: string,
    @Headers("x-mcom-signature") standardSig: string,
    @RawBody() rawBody: Buffer,
    @Req() req: any,
  ) {
    const signature =
      webhookSig ||
      standardSig ||
      req.headers?.["x-mcom-webhook-signature"] ||
      req.headers?.["x-mcom-signature"];
    const payload =
      req.body || (rawBody ? JSON.parse(rawBody.toString("utf8")) : {});

    if (rawBody && !this.verifySignature(rawBody, signature)) {
      this.logger.error("Invalid webhook signature received from MCOM Central");
      throw new UnauthorizedException("Invalid webhook signature");
    }

    const event = payload.event;
    const data = payload.data || {};
    this.logger.log(
      `Received MCOM lifecycle webhook: ${event} for user ${data.mcomUserId}`,
    );

    switch (event) {
      case "entitlement.trial_started":
        await this.handleTrialStarted(data);
        break;

      case "entitlement.membership_assigned":
        await this.handleMembershipAssigned(data);
        break;

      case "package.created":
      case "package.renewed":
        await this.handlePackageActive(data);
        break;

      case "package.cancelled":
        await this.handlePackageCancelled(data);
        break;

      case "package.expired":
        await this.handlePackageExpired(data);
        break;

      case "payment.failed":
        this.logger.warn(
          `Payment failed event for MCOM user ${data.mcomUserId}`,
        );
        break;

      default:
        if (typeof event === "string" && event.startsWith("central.")) {
          await this.rewardFulfilment.handleCentralEvent(event, data);
          break;
        }
        this.logger.log(`Unhandled webhook event: ${event}`);
        break;
    }

    return { received: true };
  }


  /**
   * Webhooks are a signal, not the source of truth: re-introspect Central and
   * apply the resulting entitlement. Returns false when Central could not be
   * reached so callers can fall back to legacy payload handling.
   */
  private async introspectAndApply(business: Business): Promise<boolean> {
    if (!business.mcomUserId) return false;

    try {
      const entitlement =
        await this.mcomCentralService.getIntrospectionEntitlementByUserId(
          business.mcomUserId,
        );
      if (!entitlement) return false;

      business.entitlementData = entitlement;
      business.hasPaidVerificationFee =
        entitlement.trialContext?.hasPaidVerificationFee ?? false;
      business.trialTasks = entitlement.trialContext?.programmeTasks || [];
      business.entitlementSource =
        entitlement.plan?.source ||
        (entitlement.access?.accessType === "PAID_MEMBERSHIP"
          ? "membership"
          : entitlement.access?.accessType === "TRIAL_PROGRAMME"
            ? "trial"
            : "direct");

      if (entitlement.membershipContext?.membershipLevel) {
        business.membershipLevel =
          entitlement.membershipContext.membershipLevel;
      }
      if (entitlement.membershipContext?.membershipPlanName) {
        business.membershipTier =
          entitlement.membershipContext.membershipPlanName;
      }
      if (entitlement.membershipContext?.membershipStatus) {
        business.membershipStatus =
          entitlement.membershipContext.membershipStatus;
      }

      await this.businessRepository.save(business);
      await this.entitlementSyncService.apply(business.id, entitlement);
      return true;
    } catch (error: any) {
      this.logger.warn(
        `Entitlement re-introspection failed for business ${business.id}: ${error?.message}`,
      );
      return false;
    }
  }

  private async findBusinessByCentralId(
    identifier?: string,
    email?: string,
  ): Promise<Business | null> {    if (!identifier && !email) return null;
    if (identifier) {
      const byMcomId = await this.businessRepository.findOne({
        where: { mcomUserId: identifier },
      });
      if (byMcomId) return byMcomId;

      const byId = await this.businessRepository.findOne({
        where: { id: identifier },
      });
      if (byId) return byId;
    }
    if (email) {
      const byEmail = await this.businessRepository.findOne({
        where: { email: email.toLowerCase().trim() },
      });
      if (byEmail) return byEmail;
    }
    return null;
  }


  private async handlePackageActive(data: any) {
    const business = await this.findBusinessByCentralId(data.mcomUserId);
    if (!business) {
      this.logger.warn(`Business not found for mcomUserId: ${data.mcomUserId}`);
      return;
    }

    if (await this.introspectAndApply(business)) {
      this.logger.log(
        `Webhook applied via entitlement introspection for business ${business.id}`,
      );
      return;
    }

    await this.planSubscriptionService.syncFromAppPlan(business.id, {
      planId: data.externalPlanId,
      planName: data.packageName,
      status: "active",
      expiresAt: data.expiresAt,
      source: "webhook",
    });

    this.logger.log(
      `Webhook applied: Plan "${data.packageName}" active for business ${business.id}`,
    );
  }

  private async handlePackageCancelled(data: any) {
    const business = await this.findBusinessByCentralId(data.mcomUserId);
    if (!business) return;

    this.logger.log(
      `Webhook: Subscription cancelled for business ${business.id}, access remains valid until expiration.`,
    );
  }

  private async handlePackageExpired(data: any) {
    const business = await this.findBusinessByCentralId(data.mcomUserId);
    if (!business) return;

    if (await this.introspectAndApply(business)) {
      this.logger.log(
        `Webhook applied via entitlement introspection for business ${business.id} (expired event)`,
      );
      return;
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { business: { id: business.id } },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.EXPIRED;
      subscription.isActive = false;
      await this.subscriptionRepository.save(subscription);
      business.membershipStatus = "expired";
      await this.businessRepository.save(business);
      this.planSubscriptionService.invalidateSubscriptionCache(business.id);
    }

    this.logger.log(
      `Webhook: Subscription expired for business ${business.id}, downgraded.`,
    );
  }

  private async handleTrialStarted(data: any) {
    const business = await this.findBusinessByCentralId(
      data.mcomUserId || data.userId || data.businessId,
    );
    if (!business) {
      this.logger.warn(
        `Business not found for trial_started webhook: ${data.mcomUserId}`,
      );
      return;
    }

    if (await this.introspectAndApply(business)) {
      this.logger.log(
        `Webhook applied via entitlement introspection for business ${business.id} (trial_started)`,
      );
      return;
    }

    business.hasPaidVerificationFee = true;
    business.entitlementSource = "trial";
    if (data.programmeTasks) {
      business.trialTasks = data.programmeTasks;
    }
    await this.businessRepository.save(business);

    if (data.entitlement) {
      business.entitlementData = data.entitlement;
      await this.businessRepository.save(business);
      await this.entitlementSyncService.apply(business.id, data.entitlement);
    } else {
      const trialDays = data.trialAccessDays || 14;
      const expiresAt =
        data.trialAccessExpiresAt ||
        new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

      await this.entitlementSyncService.apply(business.id, {
        version: "2026-10-01",
        targetPlatform: {
          clientId: "mcom-rewards",
          platformSlug: "rewards",
          name: "MCOM Rewards",
        },
        access: {
          hasAccess: true,
          accessType: "TRIAL_PROGRAMME",
          upgradeUrl: `${this.configService.get("MCOM_SOLUTIONS_URL") || "http://localhost:3010"}/dashboard/memberships`,
        },
        plan: {
          planId: data.planId || "trial_rewards",
          planName: data.planName || "Trial Programme",
          source: "trial",
          status: "trial",
          expiresAt,
          quotas: {},
          limits: {},
          features: [],
        },
        membershipContext: {
          membershipPlanName: null,
          membershipLevel: "Trial",
          membershipStatus: "trial",
          isIncludedInMembership: false,
        },
        trialContext: {
          isInTrial: true,
          hasPaidVerificationFee: true,
          trialExpiresAt: expiresAt,
          daysRemaining: trialDays,
          programmeTasks: data.programmeTasks || [],
        },
      });
    }

    this.logger.log(
      `Webhook applied: Trial started for business ${business.id}`,
    );
  }

  private async handleMembershipAssigned(data: any) {
    const business = await this.findBusinessByCentralId(
      data.mcomUserId || data.userId || data.businessId,
    );
    if (!business) {
      this.logger.warn(
        `Business not found for membership_assigned webhook: ${data.mcomUserId}`,
      );
      return;
    }

    if (await this.introspectAndApply(business)) {
      this.logger.log(
        `Webhook applied via entitlement introspection for business ${business.id} (membership_assigned)`,
      );
      return;
    }

    business.entitlementSource = "membership";
    business.membershipLevel =
      data.membershipLevel || data.membershipPlanName || business.membershipLevel;
    business.membershipTier =
      data.membershipPlanName || business.membershipTier;
    business.membershipStatus = "active";

    if (data.entitlement) {
      business.entitlementData = data.entitlement;
      await this.businessRepository.save(business);
      await this.entitlementSyncService.apply(business.id, data.entitlement);
    } else {
      await this.businessRepository.save(business);
      await this.planSubscriptionService.syncFromAppPlan(business.id, {
        planId: data.planId || data.externalPlanId,
        planName: data.planName || data.packageName,
        status: "active",
        expiresAt: data.expiresAt,
        source: "membership",
        membershipPlanName: data.membershipPlanName,
      });
    }

    this.logger.log(
      `Webhook applied: Membership assigned for business ${business.id}`,
    );
  }
}

