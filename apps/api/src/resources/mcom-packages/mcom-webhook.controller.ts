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
        this.logger.log(`Unhandled webhook event: ${event}`);
        break;
    }

    return { received: true };
  }

  private async findBusinessByCentralId(
    mcomUserId?: string,
  ): Promise<Business | null> {
    if (!mcomUserId) return null;
    return this.businessRepository.findOne({ where: { mcomUserId } });
  }

  private async handlePackageActive(data: any) {
    const business = await this.findBusinessByCentralId(data.mcomUserId);
    if (!business) {
      this.logger.warn(`Business not found for mcomUserId: ${data.mcomUserId}`);
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
}
