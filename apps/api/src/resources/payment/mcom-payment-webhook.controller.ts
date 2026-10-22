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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import * as crypto from "crypto";
import { Public } from "../../common/decorators/public.decorator";
import { RawBody } from "../../common/decorators/raw-body.decorator";
import {
  McomPaymentWebhookPayload,
  McomPaymentWebhookService,
} from "./mcom-payment-webhook.service";

@ApiTags("Payment")
@Controller("payment")
@Public()
export class McomPaymentWebhookController {
  private readonly logger = new Logger(McomPaymentWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly webhookService: McomPaymentWebhookService,
  ) {}

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Handle MCOM Pay payment lifecycle webhooks" })
  @ApiResponse({ status: 200, description: "Webhook processed" })
  @ApiResponse({ status: 401, description: "Invalid webhook signature" })
  async handle(
    @Headers("x-mcom-webhook-signature") signature: string,
    @Headers("x-mcom-signature") standardSignature: string,
    @RawBody() rawBody: Buffer,
    @Req() req: any,
  ) {
    const provided = signature || standardSignature;
    const body =
      rawBody?.length > 0
        ? rawBody
        : Buffer.from(
            typeof req.body === "string"
              ? req.body
              : JSON.stringify(req.body || {}),
          );

    if (!this.verifySignature(body, provided)) {
      throw new UnauthorizedException("Invalid MCOM Pay webhook signature");
    }

    let payload: McomPaymentWebhookPayload;
    try {
      payload = JSON.parse(body.toString("utf8"));
    } catch {
      this.logger.warn("MCOM Pay webhook body is not valid JSON");
      return { received: true };
    }

    await this.webhookService.handle(payload);
    return { received: true };
  }

  private verifySignature(body: Buffer, signature?: string): boolean {
    const secret =
      this.configService.get<string>("MCOM_WEBHOOK_SECRET") ||
      this.configService.get<string>("SSO_API_SECRET");

    if (!secret) {
      if (process.env.NODE_ENV !== "production") {
        this.logger.warn(
          "MCOM_WEBHOOK_SECRET is not configured (allowed only in non-production)",
        );
        return true;
      }
      this.logger.error(
        "MCOM_WEBHOOK_SECRET is required in production to verify MCOM Pay webhooks",
      );
      return false;
    }

    if (!signature || !signature.startsWith("sha256=")) {
      if (process.env.NODE_ENV !== "production") {
        this.logger.warn(
          "MCOM Pay webhook signature missing (allowed only in non-production)",
        );
        return true;
      }
      return false;
    }

    const expected = signature.replace(/^sha256=/, "");
    const actual = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    try {
      const expectedBuf = Buffer.from(expected, "hex");
      const actualBuf = Buffer.from(actual, "hex");
      if (expectedBuf.length !== actualBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    } catch {
      return false;
    }
  }
}
