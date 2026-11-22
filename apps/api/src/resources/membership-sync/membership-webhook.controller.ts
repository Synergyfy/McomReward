import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import * as crypto from "crypto";
import { Public } from "../../common/decorators/public.decorator";
import { RawBody } from "../../common/decorators/raw-body.decorator";
import {
  MembershipSyncService,
  MembershipUpdatedData,
} from "./membership-sync.service";

/**
 * Central Hub → app membership synchronisation.
 *
 * Central POSTs a signed `membership.updated` event whenever a business buys,
 * renews, cancels or loses a membership that bundles this app. The handler
 * provisions/revokes only the plan or access pass included in the membership;
 * it never treats the event as proof of payment on its own (the signature is).
 *
 * Configure this URL in MCOM Console → this app → Configuration →
 * Membership Synchronization:
 *   {API_PUBLIC_URL}/api/v1/webhooks/membership-updated
 */
@ApiTags("Membership Sync")
@Controller()
@Public()
export class MembershipWebhookController {
  private readonly logger = new Logger(MembershipWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly membershipSyncService: MembershipSyncService,
  ) {}

  @Post(["webhooks/membership-updated", "mcom/webhook/membership-updated"])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Receive Central membership.updated lifecycle events",
  })
  @ApiResponse({ status: 200, description: "Event processed" })
  @ApiResponse({ status: 401, description: "Invalid webhook signature" })
  async handleMembershipUpdated(
    @Headers("x-mcom-webhook-signature") webhookSignature: string,
    @Headers("x-mcom-signature") standardSignature: string,
    @RawBody() rawBody: Buffer,
    @Req() req: any,
  ) {
    const signature =
      webhookSignature ||
      standardSignature ||
      req.headers?.["x-mcom-webhook-signature"] ||
      req.headers?.["x-mcom-signature"];

    if (rawBody?.length && !this.verifySignature(rawBody, signature)) {
      this.logger.error(
        "Invalid membership.updated webhook signature from MCOM Central",
      );
      throw new UnauthorizedException("Invalid webhook signature");
    }

    let payload: any;
    try {
      payload =
        req.body ||
        (rawBody?.length ? JSON.parse(rawBody.toString("utf8")) : {});
    } catch {
      throw new BadRequestException("Webhook body is not valid JSON");
    }

    const event = payload?.event;
    const data: MembershipUpdatedData = payload?.data || {};

    if (event !== "membership.updated") {
      this.logger.log(
        `Ignoring non-membership event on membership-sync endpoint: ${event}`,
      );
      return { received: true, ignored: true };
    }

    this.logger.log(
      `membership.updated: user=${data.userId ?? "none"} business=${data.businessId ?? "none"} ` +
        `plan=${data.package?.externalPlanId ?? data.membership?.planId ?? "none"} ` +
        `status=${data.membership?.status ?? data.package?.status ?? "none"} ` +
        `event=${data.eventId ?? "none"}`,
    );

    const result =
      await this.membershipSyncService.handleMembershipUpdated(data);

    return { received: true, ...result };
  }

  private verifySignature(
    rawBody: Buffer | string,
    signatureHeader?: string,
  ): boolean {
    const secret =
      this.configService.get<string>("MCOM_WEBHOOK_SECRET") ||
      this.configService.get<string>("MCOM_HMAC_SECRET") ||
      this.configService.get<string>("SSO_API_SECRET");

    if (!secret) {
      if (process.env.NODE_ENV !== "production") {
        this.logger.warn(
          "No MCOM_WEBHOOK_SECRET / MCOM_HMAC_SECRET configured; accepting membership webhook only because NODE_ENV is not production",
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
          "membership.updated signature missing; accepting only outside production",
        );
        return true;
      }
      return false;
    }

    const received = signatureHeader.replace(/^sha256=/, "");
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    try {
      const receivedBuffer = Buffer.from(received, "hex");
      const expectedBuffer = Buffer.from(expected, "hex");
      return (
        receivedBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
      );
    } catch {
      return false;
    }
  }
}
