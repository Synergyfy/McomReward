import { Injectable, Logger } from "@nestjs/common";
import { PaymentCheckoutService } from "./payment-checkout.service";
import { PaymentFulfillmentService } from "./payment-fulfillment.service";

export interface McomPaymentWebhookPayload {
  event: string;
  platform?: string;
  timestamp?: string;
  data?: {
    chargeId?: string;
    id?: string;
    amountMinor?: string;
    feeMinor?: string;
    netMinor?: string;
    currency?: string;
    method?: string;
    status?: string;
    reference?: string;
    mcomUserId?: string;
    externalCustomerId?: string;
    provider?: string;
    providerRef?: string;
    paidAt?: string;
    refundedAt?: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class McomPaymentWebhookService {
  private readonly logger = new Logger(McomPaymentWebhookService.name);

  constructor(
    private readonly checkoutService: PaymentCheckoutService,
    private readonly fulfillmentService: PaymentFulfillmentService,
  ) {}

  async handle(payload: McomPaymentWebhookPayload): Promise<{ ok: boolean }> {
    const event = payload?.event;
    const data = payload?.data || {};
    const chargeId = data.chargeId || data.id;

    if (!event) {
      this.logger.warn("Received MCOM Pay webhook without an event name");
      return { ok: true };
    }

    this.logger.log(
      `MCOM Pay webhook ${event} for charge ${chargeId || "unknown"}`,
    );

    switch (event) {
      case "payment.succeeded":
        await this.handleSucceeded(payload);
        break;
      case "payment.refunded":
        await this.handleRefunded(payload);
        break;
      default:
        this.logger.log(`Ignoring unhandled MCOM Pay event: ${event}`);
        break;
    }

    return { ok: true };
  }

  private async handleSucceeded(
    payload: McomPaymentWebhookPayload,
  ): Promise<void> {
    const data = payload.data || {};
    const chargeId = data.chargeId || data.id;
    if (!chargeId) {
      this.logger.warn("payment.succeeded without a chargeId");
      return;
    }

    const checkout = await this.checkoutService.findByChargeId(chargeId);
    if (!checkout) {
      // The charge was created outside this app instance or the local checkout
      // was not recorded yet. Acknowledge so MCOM does not retry forever.
      this.logger.warn(
        `No local checkout found for paid charge ${chargeId} (reference: ${data.reference || "n/a"})`,
      );
      return;
    }

    const transitioned = await this.checkoutService.markPaid(
      checkout,
      data as any,
    );

    if (transitioned || !checkout.fulfilledAt) {
      await this.fulfillmentService.fulfill(checkout);
      await this.checkoutService.markFulfilled(checkout);
    }
  }

  private async handleRefunded(
    payload: McomPaymentWebhookPayload,
  ): Promise<void> {
    const data = payload.data || {};
    const chargeId = data.chargeId || data.id;
    if (!chargeId) {
      this.logger.warn("payment.refunded without a chargeId");
      return;
    }

    const checkout = await this.checkoutService.findByChargeId(chargeId);
    if (!checkout) {
      this.logger.warn(
        `No local checkout found for refunded charge ${chargeId}`,
      );
      return;
    }

    await this.checkoutService.markRefunded(checkout, data as any);
    this.logger.log(
      `Marked checkout ${checkout.id} refunded (charge ${chargeId})`,
    );
  }
}
