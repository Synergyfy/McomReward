import { Injectable, Logger } from "@nestjs/common";
import {
  PaymentCheckout,
  PaymentCheckoutPurpose,
} from "./entities/payment-checkout.entity";

export type PaymentFulfillmentHandler = (
  checkout: PaymentCheckout,
) => Promise<void>;

/**
 * Small registry so the generic webhook handler can grant the right
 * entitlement without importing every domain module (and creating cycles).
 * Domain services register their handler on module init.
 */
@Injectable()
export class PaymentFulfillmentService {
  private readonly logger = new Logger(PaymentFulfillmentService.name);
  private readonly handlers = new Map<
    PaymentCheckoutPurpose,
    PaymentFulfillmentHandler
  >();

  register(
    purpose: PaymentCheckoutPurpose,
    handler: PaymentFulfillmentHandler,
  ): void {
    this.handlers.set(purpose, handler);
  }

  isRegistered(purpose: PaymentCheckoutPurpose): boolean {
    return this.handlers.has(purpose);
  }

  async fulfill(checkout: PaymentCheckout): Promise<void> {
    const handler = this.handlers.get(checkout.purpose);
    if (!handler) {
      this.logger.warn(
        `No fulfillment handler registered for purpose ${checkout.purpose} (checkout ${checkout.id})`,
      );
      return;
    }
    await handler(checkout);
  }
}
