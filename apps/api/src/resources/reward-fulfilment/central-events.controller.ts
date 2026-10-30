import {
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
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import * as crypto from "crypto";
import { Public } from "../../common/decorators/public.decorator";
import { RawBody } from "../../common/decorators/raw-body.decorator";
import { RewardFulfilmentService } from "./reward-fulfilment.service";

/**
 * Central Hub → Rewards lifecycle events.
 *
 * Transport: Central's webhook dispatcher (HMAC-SHA256 in
 * `X-Mcom-Webhook-Signature`), not the mesh. Configure the `mcom-rewards`
 * webhook URL in the Central Console to this endpoint.
 */
@ApiTags("Central Events")
@Controller("central/events")
@Public()
export class CentralEventsController {
  private readonly logger = new Logger(CentralEventsController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly fulfilment: RewardFulfilmentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Receive Central partner lifecycle events" })
  async handle(
    @Headers("x-mcom-webhook-signature") webhookSig: string,
    @RawBody() rawBody: Buffer,
    @Req() req: any,
  ) {
    const signature =
      webhookSig ||
      req.headers?.["x-mcom-webhook-signature"] ||
      req.headers?.["x-mcom-signature"];

    if (rawBody && !this.verify(rawBody, signature)) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    const payload =
      req.body || (rawBody ? JSON.parse(rawBody.toString("utf8")) : {});
    const event = payload?.event;
    const data = payload?.data || {};

    if (!event) {
      return { received: true, ignored: true };
    }

    this.logger.log(`Central event: ${event}`);
    await this.fulfilment.handleCentralEvent(event, data);
    return { received: true };
  }

  private verify(rawBody: Buffer | string, header?: string): boolean {
    const secret =
      this.config.get<string>("MCOM_WEBHOOK_SECRET") ||
      this.config.get<string>("SSO_API_SECRET");

    if (!secret) {
      if (process.env.NODE_ENV !== "production") {
        this.logger.warn(
          "MCOM_WEBHOOK_SECRET is not configured (allowed only outside production)",
        );
        return true;
      }
      return false;
    }

    if (!header || !header.startsWith("sha256=")) {
      return process.env.NODE_ENV !== "production";
    }

    const expected = header.replace(/^sha256=/, "");
    const actual = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    try {
      const a = Buffer.from(expected, "hex");
      const b = Buffer.from(actual, "hex");
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
}
