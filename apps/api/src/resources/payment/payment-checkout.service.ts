import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  PaymentCheckout,
  PaymentCheckoutMethod,
  PaymentCheckoutPurpose,
  PaymentCheckoutStatus,
} from "./entities/payment-checkout.entity";
import { McomCharge, McomChargeResponse } from "./mcom-payments.service";

export interface CreateCheckoutInput {
  businessId?: string;
  purpose: PaymentCheckoutPurpose;
  purposeRef?: string;
  amountMinor: string;
  currency?: string;
  method: PaymentCheckoutMethod;
  idempotencyKey: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PaymentCheckoutService {
  private readonly logger = new Logger(PaymentCheckoutService.name);

  constructor(
    @InjectRepository(PaymentCheckout)
    private readonly checkoutRepository: Repository<PaymentCheckout>,
  ) {}

  async findById(id: string): Promise<PaymentCheckout | null> {
    return this.checkoutRepository.findOne({ where: { id } });
  }

  async findByIdOrThrow(id: string): Promise<PaymentCheckout> {
    const checkout = await this.findById(id);
    if (!checkout) throw new NotFoundException("Checkout not found");
    return checkout;
  }

  async findByChargeId(chargeId: string): Promise<PaymentCheckout | null> {
    return this.checkoutRepository.findOne({ where: { chargeId } });
  }

  async findByProviderRef(
    providerRef: string,
  ): Promise<PaymentCheckout | null> {
    return this.checkoutRepository.findOne({ where: { providerRef } });
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<PaymentCheckout | null> {
    return this.checkoutRepository.findOne({ where: { idempotencyKey } });
  }

  async findLatestPending(
    businessId: string,
    purpose: PaymentCheckoutPurpose,
    purposeRef?: string,
  ): Promise<PaymentCheckout | null> {
    const qb = this.checkoutRepository
      .createQueryBuilder("checkout")
      .where("checkout.businessId = :businessId", { businessId })
      .andWhere("checkout.purpose = :purpose", { purpose })
      .andWhere("checkout.status = :status", {
        status: PaymentCheckoutStatus.PENDING,
      });

    if (purposeRef) {
      qb.andWhere("checkout.purposeRef = :purposeRef", { purposeRef });
    }

    return qb.orderBy("checkout.created_at", "DESC").getOne();
  }

  /**
   * Create (or return) the local checkout for a business event. The
   * idempotency key is the same one sent to MCOM Pay, so retries are safe.
   */
  async getOrCreate(input: CreateCheckoutInput): Promise<PaymentCheckout> {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return existing;

    try {
      return await this.checkoutRepository.save(
        this.checkoutRepository.create({
          businessId: input.businessId,
          purpose: input.purpose,
          purposeRef: input.purposeRef,
          amountMinor: input.amountMinor,
          currency: input.currency || "GBP",
          method: input.method,
          idempotencyKey: input.idempotencyKey,
          reference: input.reference,
          metadata: input.metadata,
          status: PaymentCheckoutStatus.PENDING,
        }),
      );
    } catch (error) {
      // Unique constraint race: another request created the same checkout.
      if ((error as any)?.code === "23505") {
        const raced = await this.findByIdempotencyKey(input.idempotencyKey);
        if (raced) return raced;
      }
      throw error;
    }
  }

  async attachCharge(
    checkout: PaymentCheckout,
    response: McomChargeResponse,
  ): Promise<PaymentCheckout> {
    const charge = response.charge;
    if (!charge?.id) {
      throw new Error("MCOM Pay did not return a charge id");
    }

    // Never overwrite a terminal local state with a stale provider response.
    if (
      checkout.status === PaymentCheckoutStatus.PAID ||
      checkout.status === PaymentCheckoutStatus.REFUNDED
    ) {
      return checkout;
    }

    checkout.chargeId = charge.id;
    checkout.providerRef =
      charge.providerRef ||
      response.clientSecret?.split("_secret_")[0] ||
      checkout.providerRef;
    checkout.feeMinor = charge.feeMinor;
    checkout.netMinor = charge.netMinor;
    checkout.status = this.mapChargeStatus(charge.status);
    if (checkout.status === PaymentCheckoutStatus.PAID && !checkout.paidAt) {
      checkout.paidAt = charge.paidAt ? new Date(charge.paidAt) : new Date();
    }

    return this.checkoutRepository.save(checkout);
  }

  /**
   * Mark a checkout paid from a provider response or webhook.
   * Returns true only for the pending -> paid transition so callers can make
   * entitlement granting idempotent.
   */
  async markPaid(
    checkout: PaymentCheckout,
    charge?: Partial<McomCharge>,
  ): Promise<boolean> {
    if (checkout.status === PaymentCheckoutStatus.PAID) return false;
    if (checkout.status === PaymentCheckoutStatus.REFUNDED) return false;

    checkout.status = PaymentCheckoutStatus.PAID;
    checkout.paidAt = charge?.paidAt ? new Date(charge.paidAt) : new Date();
    if (charge?.id) checkout.chargeId = charge.id;
    if (charge?.feeMinor) checkout.feeMinor = charge.feeMinor;
    if (charge?.netMinor) checkout.netMinor = charge.netMinor;
    if (charge?.providerRef) checkout.providerRef = charge.providerRef;
    await this.checkoutRepository.save(checkout);
    return true;
  }

  async markFulfilled(checkout: PaymentCheckout): Promise<PaymentCheckout> {
    if (checkout.fulfilledAt) return checkout;
    checkout.fulfilledAt = new Date();
    return this.checkoutRepository.save(checkout);
  }

  async markRefunded(
    checkout: PaymentCheckout,
    charge?: Partial<McomCharge>,
  ): Promise<PaymentCheckout> {
    checkout.status = PaymentCheckoutStatus.REFUNDED;
    checkout.refundedAt = charge?.refundedAt
      ? new Date(charge.refundedAt)
      : new Date();
    return this.checkoutRepository.save(checkout);
  }

  async markFailed(
    checkout: PaymentCheckout,
    reason?: string,
  ): Promise<PaymentCheckout> {
    if (
      checkout.status === PaymentCheckoutStatus.PAID ||
      checkout.status === PaymentCheckoutStatus.REFUNDED
    ) {
      return checkout;
    }
    checkout.status = PaymentCheckoutStatus.FAILED;
    if (reason) {
      checkout.metadata = {
        ...(checkout.metadata || {}),
        failureReason: reason,
      };
    }
    return this.checkoutRepository.save(checkout);
  }

  private mapChargeStatus(status: McomCharge["status"]): PaymentCheckoutStatus {
    switch (status) {
      case "paid":
        return PaymentCheckoutStatus.PAID;
      case "failed":
        return PaymentCheckoutStatus.FAILED;
      case "canceled":
        return PaymentCheckoutStatus.CANCELED;
      case "refunded":
        return PaymentCheckoutStatus.REFUNDED;
      case "pending":
      default:
        return PaymentCheckoutStatus.PENDING;
    }
  }
}
