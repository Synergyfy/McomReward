import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, LessThanOrEqual, Repository } from "typeorm";
import { Business } from "../../business/entities/business.entity";
import {
  PlanSubscription,
  SubscriptionBillingMethod,
  SubscriptionPlanType,
  SubscriptionStatus,
} from "../entities/plan-subscription.entity";
import {
  PlanPayment,
  PlanPaymentMethod,
} from "../entities/plan-payment.entity";
import {
  SubscriptionInvoice,
  SubscriptionInvoiceStatus,
} from "../entities/subscription-invoice.entity";
import { PlanExpiryService } from "./plan-expiry.service";
import { McomWalletPartnerService } from "../../wallet/mcom-wallet-partner.service";
import {
  ConfirmMcomChargeInput,
  McomPaymentsService,
} from "../../payment/mcom-payments.service";
import { PaymentCheckoutService } from "../../payment/payment-checkout.service";
import { PaymentFulfillmentService } from "../../payment/payment-fulfillment.service";
import {
  PaymentCheckout,
  PaymentCheckoutMethod,
  PaymentCheckoutPurpose,
} from "../../payment/entities/payment-checkout.entity";
import { fromMinorUnits, toMinorUnits } from "../../../common/utils/money.util";

const RENEWAL_LOCK_ID = 918_273_645;
const RETRY_DELAYS_DAYS = [1, 3, 7];
const GRACE_DAYS = 7;

/**
 * Partner-owned recurring billing (MCOM Payments guide, Part C).
 *
 * MCOM does not store a mandate for partner subscriptions. Wallet renewals are
 * auto-debited by this scheduler; card/PayPal renewals create a fresh MCOM Pay
 * charge per period and wait for the customer to complete it.
 */
@Injectable()
export class SubscriptionBillingService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionBillingService.name);

  constructor(
    @InjectRepository(PlanSubscription)
    private readonly subscriptionRepository: Repository<PlanSubscription>,
    @InjectRepository(SubscriptionInvoice)
    private readonly invoiceRepository: Repository<SubscriptionInvoice>,
    @InjectRepository(PlanPayment)
    private readonly paymentRepository: Repository<PlanPayment>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly dataSource: DataSource,
    private readonly expiryService: PlanExpiryService,
    private readonly centralWallet: McomWalletPartnerService,
    private readonly mcomPayments: McomPaymentsService,
    private readonly checkoutService: PaymentCheckoutService,
    private readonly fulfillmentService: PaymentFulfillmentService,
  ) {}

  onModuleInit(): void {
    this.fulfillmentService.register(
      PaymentCheckoutPurpose.PLAN_RENEWAL,
      async (checkout) => {
        await this.completeRenewal(checkout);
      },
    );
  }

  @Cron("0 2 * * *", { name: "subscription-renewals" })
  async renewDueSubscriptions(): Promise<void> {
    // Only one instance should run renewals. The lock is released even if a
    // single subscription fails.
    const [{ locked }] = await this.dataSource.query(
      "SELECT pg_try_advisory_lock($1) AS locked",
      [RENEWAL_LOCK_ID],
    );
    if (!locked) {
      this.logger.log("Renewal run skipped — another instance holds the lock");
      return;
    }

    try {
      await this.processDueSubscriptions();
    } finally {
      await this.dataSource.query("SELECT pg_advisory_unlock($1)", [
        RENEWAL_LOCK_ID,
      ]);
    }
  }

  /** Extracted so tests and admin tooling can run renewals on demand. */
  async processDueSubscriptions(now = new Date()): Promise<{
    processed: number;
    paid: number;
    failed: number;
  }> {
    const due = await this.subscriptionRepository.find({
      where: {
        status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE]),
        autoRenew: true,
        nextBillingAt: LessThanOrEqual(now),
      },
      relations: [
        "business",
        "planVariant",
        "planVariant.plan",
        "planVariant.tierLevel",
        "price",
      ],
      take: 100,
    });

    let paid = 0;
    let failed = 0;

    for (const subscription of due) {
      try {
        const result = await this.renewSubscription(subscription);
        if (result === "paid") paid++;
        if (result === "failed") failed++;
      } catch (error: any) {
        failed++;
        this.logger.error(
          `Renewal crashed for subscription ${subscription.id}: ${error?.message}`,
          error?.stack,
        );
      }
    }

    if (due.length > 0) {
      this.logger.log(
        `Renewal run: ${due.length} due, ${paid} paid, ${failed} failed`,
      );
    }

    return { processed: due.length, paid, failed };
  }

  private async renewSubscription(
    subscription: PlanSubscription,
  ): Promise<"paid" | "failed" | "skipped"> {
    if (!subscription.business?.id) return "skipped";
    if (!subscription.billingMethod) {
      this.logger.warn(
        `Subscription ${subscription.id} has autoRenew but no billingMethod; skipping`,
      );
      return "skipped";
    }

    const periodStart =
      subscription.expires_at ||
      subscription.billingAnchor ||
      subscription.nextBillingAt ||
      new Date();
    const periodEnd = this.nextPeriodEnd(subscription, periodStart);
    const amount = Number(subscription.price?.amount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      this.logger.warn(
        `Subscription ${subscription.id} has no renewable price; skipping`,
      );
      return "skipped";
    }

    const amountMinor = toMinorUnits(amount);
    const periodKey = this.periodKey(periodStart);
    const invoice = await this.getOrCreateInvoice(
      subscription,
      periodStart,
      periodEnd,
      amountMinor,
      periodKey,
    );

    if (invoice.status === SubscriptionInvoiceStatus.PAID) {
      await this.advanceSubscription(subscription, periodStart, periodEnd);
      return "paid";
    }

    // Card/PayPal renewals await the customer; do not burn a dunning attempt
    // on every cron run while the charge is still pending.
    if (
      invoice.status === SubscriptionInvoiceStatus.PENDING &&
      invoice.chargeId
    ) {
      this.logger.log(
        `Renewal invoice ${invoice.id} is awaiting customer payment (charge ${invoice.chargeId})`,
      );
      return "skipped";
    }

    invoice.attempts = (invoice.attempts || 0) + 1;
    await this.invoiceRepository.save(invoice);

    try {
      if (subscription.billingMethod === SubscriptionBillingMethod.WALLET) {
        await this.chargeWallet(subscription, invoice, periodKey);
      } else {
        const result = await this.createRenewalCharge(
          subscription,
          invoice,
          periodKey,
        );
        if (result !== "paid") {
          return "skipped";
        }
      }

      await this.advanceSubscription(subscription, periodStart, periodEnd);
      await this.recordPayment(subscription, invoice);
      return "paid";
    } catch (error: any) {
      await this.markFailure(subscription, invoice, error);
      return "failed";
    }
  }

  private async chargeWallet(
    subscription: PlanSubscription,
    invoice: SubscriptionInvoice,
    periodKey: string,
  ): Promise<void> {
    const mcomUserId = subscription.business?.mcomUserId;
    if (!mcomUserId) {
      throw new Error(
        "Business is not linked to an MCOM account for wallet renewal",
      );
    }

    const receipt = await this.centralWallet.debit(
      mcomUserId,
      fromMinorUnits(invoice.amountMinor),
      {
        category: "SUBSCRIPTION",
        description: `${subscription.planVariant?.plan?.name || "MCOM Rewards"} renewal`,
        reference: invoice.id,
        metadata: {
          subscriptionId: subscription.id,
          invoiceId: invoice.id,
          periodKey,
        },
        idempotencyKey: `mcom-rewards-sub-${subscription.id}-${periodKey}`,
      },
    );

    invoice.status = SubscriptionInvoiceStatus.PAID;
    invoice.chargeId = receipt.transactionId;
    invoice.paidAt = new Date();
    invoice.failureReason = null;
    await this.invoiceRepository.save(invoice);
  }

  private async createRenewalCharge(
    subscription: PlanSubscription,
    invoice: SubscriptionInvoice,
    periodKey: string,
  ): Promise<"paid" | "pending"> {
    const method =
      subscription.billingMethod === SubscriptionBillingMethod.PAYPAL
        ? PaymentCheckoutMethod.PAYPAL
        : PaymentCheckoutMethod.STRIPE;

    // A previous run already created the charge for this period. Without a
    // stored mandate we cannot auto-charge it; leave it awaiting the customer.
    if (invoice.chargeId) {
      this.logger.log(
        `Renewal invoice ${invoice.id} is awaiting customer payment (charge ${invoice.chargeId})`,
      );
      return "pending";
    }

    if (!this.mcomPayments.isConfigured()) {
      throw new Error("MCOM Pay is not configured");
    }

    const idempotencyKey = `mcom-rewards-sub-${subscription.id}-${periodKey}`;
    const checkout = await this.checkoutService.getOrCreate({
      businessId: subscription.business?.id,
      purpose: PaymentCheckoutPurpose.PLAN_RENEWAL,
      purposeRef: subscription.planVariantId,
      amountMinor: invoice.amountMinor,
      currency: invoice.currency,
      method,
      idempotencyKey,
      reference: invoice.id,
      metadata: {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        periodKey,
        renewal: true,
        billingCycle: subscription.plan_type,
      },
    });

    const response = await this.mcomPayments.createCharge({
      amountMinor: invoice.amountMinor,
      currency: invoice.currency,
      method,
      reference: invoice.id,
      description: `${subscription.planVariant?.plan?.name || "MCOM Rewards"} renewal`,
      externalCustomerId: subscription.business?.id,
      metadata: {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        periodKey,
        checkoutId: checkout.id,
      },
      idempotencyKey,
    });

    await this.checkoutService.attachCharge(checkout, response);

    invoice.chargeId = response.charge.id;
    invoice.status = SubscriptionInvoiceStatus.PENDING;
    await this.invoiceRepository.save(invoice);

    if (response.charge.status === "paid") {
      invoice.status = SubscriptionInvoiceStatus.PAID;
      invoice.paidAt = new Date();
      await this.invoiceRepository.save(invoice);
      return "paid";
    }

    this.logger.log(
      `Renewal for subscription ${subscription.id} awaits customer payment (${method})`,
    );
    return "pending";
  }

  /**
   * Confirm a renewal checkout (used by the return page / manual refresh) and
   * advance the subscription exactly once.
   */
  async confirmRenewal(
    checkout: PaymentCheckout,
    handle: ConfirmMcomChargeInput = {},
  ): Promise<void> {
    if (checkout.status !== "paid") {
      if (!checkout.chargeId) {
        throw new BadRequestException(
          "This renewal has no MCOM Pay charge. Please contact support.",
        );
      }

      const response = await this.mcomPayments.confirmCharge(
        checkout.chargeId,
        handle,
      );
      if (response.charge.status !== "paid") {
        throw new BadRequestException(
          `Renewal payment is not complete (status: ${response.charge.status})`,
        );
      }
      if (
        response.charge.amountMinor &&
        response.charge.amountMinor !== checkout.amountMinor
      ) {
        throw new BadRequestException(
          "Paid amount does not match the renewal amount",
        );
      }

      await this.checkoutService.attachCharge(checkout, response);
      await this.checkoutService.markPaid(checkout, response.charge);
    }

    await this.completeRenewal(checkout);
  }

  /**
   * Idempotent fulfillment for a paid renewal checkout. Shared by the confirm
   * path and the `payment.succeeded` webhook.
   */
  async completeRenewal(checkout: PaymentCheckout): Promise<void> {
    if (checkout.status !== "paid") {
      throw new BadRequestException("The renewal has not been paid");
    }

    const metadata = checkout.metadata || {};
    const invoiceId = metadata.invoiceId as string | undefined;
    const subscriptionId = metadata.subscriptionId as string | undefined;
    const periodStart = metadata.periodStart
      ? new Date(metadata.periodStart as string)
      : undefined;

    let invoice: SubscriptionInvoice | null = null;
    if (invoiceId) {
      invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
      });
    }
    if (!invoice && subscriptionId && periodStart) {
      invoice = await this.invoiceRepository.findOne({
        where: { subscriptionId, periodStart },
      });
    }

    if (!invoice) {
      this.logger.warn(
        `Paid renewal checkout ${checkout.id} has no matching invoice`,
      );
      return;
    }
    if (invoice.status === SubscriptionInvoiceStatus.PAID) return;

    invoice.status = SubscriptionInvoiceStatus.PAID;
    invoice.chargeId = checkout.chargeId;
    invoice.paidAt = new Date();
    invoice.failureReason = null;
    await this.invoiceRepository.save(invoice);

    const subscription = await this.subscriptionRepository.findOne({
      where: { id: invoice.subscriptionId },
      relations: ["business", "planVariant", "planVariant.plan"],
    });
    if (!subscription) {
      this.logger.warn(
        `Paid renewal invoice ${invoice.id} has no subscription ${invoice.subscriptionId}`,
      );
      return;
    }

    await this.advanceSubscription(
      subscription,
      invoice.periodStart,
      invoice.periodEnd,
    );
    await this.recordPayment(subscription, invoice);

    this.logger.log(
      `Renewed subscription ${subscription.id} for period ${this.periodKey(
        invoice.periodStart,
      )} via ${checkout.method}`,
    );
  }

  private async getOrCreateInvoice(
    subscription: PlanSubscription,
    periodStart: Date,
    periodEnd: Date,
    amountMinor: string,
    periodKey: string,
  ): Promise<SubscriptionInvoice> {
    const existing = await this.invoiceRepository.findOne({
      where: { subscriptionId: subscription.id, periodStart },
    });
    if (existing) return existing;

    try {
      return await this.invoiceRepository.save(
        this.invoiceRepository.create({
          subscriptionId: subscription.id,
          periodStart,
          periodEnd,
          amountMinor,
          currency: subscription.price?.currency || "GBP",
          billingMethod:
            subscription.billingMethod || SubscriptionBillingMethod.WALLET,
          status: SubscriptionInvoiceStatus.PENDING,
          attempts: 0,
          metadata: { periodKey },
        }),
      );
    } catch (error) {
      if ((error as any)?.code === "23505") {
        const raced = await this.invoiceRepository.findOne({
          where: { subscriptionId: subscription.id, periodStart },
        });
        if (raced) return raced;
      }
      throw error;
    }
  }

  private async advanceSubscription(
    subscription: PlanSubscription,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<void> {
    subscription.starts_at = periodStart;
    subscription.expires_at = periodEnd;
    subscription.nextBillingAt = periodEnd;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.isActive = true;
    subscription.renewalAttempts = 0;
    subscription.graceUntil = null;
    await this.subscriptionRepository.save(subscription);

    if (subscription.business?.id) {
      await this.businessRepository.update(subscription.business.id, {
        membershipStatus: "active",
      });
    }
  }

  private async markFailure(
    subscription: PlanSubscription,
    invoice: SubscriptionInvoice,
    error: any,
  ): Promise<void> {
    const message = error?.message || "Renewal charge failed";
    const attempt = subscription.renewalAttempts || 0;

    invoice.status = SubscriptionInvoiceStatus.FAILED;
    invoice.failureReason = message;
    await this.invoiceRepository.save(invoice);

    subscription.renewalAttempts = attempt + 1;

    if (attempt < RETRY_DELAYS_DAYS.length) {
      const retryAt = this.addDays(new Date(), RETRY_DELAYS_DAYS[attempt]);
      subscription.status = SubscriptionStatus.PAST_DUE;
      subscription.graceUntil =
        subscription.graceUntil || this.addDays(new Date(), GRACE_DAYS);
      subscription.nextBillingAt = retryAt;
      await this.subscriptionRepository.save(subscription);

      if (subscription.business?.id) {
        await this.businessRepository.update(subscription.business.id, {
          membershipStatus: "past_due",
        });
      }

      this.logger.warn(
        `Renewal failed for subscription ${subscription.id} (attempt ${
          attempt + 1
        }); retry at ${retryAt.toISOString()}: ${message}`,
      );
      return;
    }

    subscription.status = SubscriptionStatus.EXPIRED;
    subscription.isActive = false;
    subscription.autoRenew = false;
    subscription.canceledAt = new Date();
    await this.subscriptionRepository.save(subscription);

    if (subscription.business?.id) {
      await this.businessRepository.update(subscription.business.id, {
        membershipStatus: "expired",
      });
    }

    this.logger.error(
      `Renewal exhausted for subscription ${subscription.id}; access revoked: ${message}`,
    );
  }

  private async recordPayment(
    subscription: PlanSubscription,
    invoice: SubscriptionInvoice,
  ): Promise<void> {
    if (!invoice.chargeId) return;

    const method = this.mapPaymentMethod(invoice.billingMethod);
    try {
      const payment = this.paymentRepository.create({
        business: subscription.business,
        amount: fromMinorUnits(invoice.amountMinor),
        currency: invoice.currency,
        paymentMethod: method,
        transactionId: invoice.chargeId,
        metadata: {
          invoiceId: invoice.id,
          subscriptionId: subscription.id,
          renewal: true,
        },
      });
      await this.paymentRepository.save(payment);
    } catch (error) {
      if ((error as any)?.code !== "23505") {
        this.logger.warn(
          `Could not record renewal payment for invoice ${invoice.id}: ${
            (error as Error)?.message
          }`,
        );
      }
    }
  }

  private mapPaymentMethod(
    method: SubscriptionBillingMethod,
  ): PlanPaymentMethod {
    if (method === SubscriptionBillingMethod.WALLET) {
      return PlanPaymentMethod.MCOM_WALLET;
    }
    if (method === SubscriptionBillingMethod.PAYPAL) {
      return PlanPaymentMethod.PAYPAL;
    }
    return PlanPaymentMethod.STRIPE;
  }

  private nextPeriodEnd(
    subscription: PlanSubscription,
    periodStart: Date,
  ): Date {
    const tierLevel = subscription.planVariant?.tierLevel?.name;
    if (tierLevel) {
      return this.expiryService.calculateExpiryForTierLevel(
        tierLevel,
        periodStart,
      );
    }

    switch (subscription.plan_type) {
      case SubscriptionPlanType.ANNUAL:
        return this.addMonths(periodStart, 12);
      case SubscriptionPlanType.QUARTERLY:
        return this.addMonths(periodStart, 3);
      case SubscriptionPlanType.MONTHLY:
      default:
        return this.addMonths(periodStart, 1);
    }
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const day = result.getUTCDate();
    result.setUTCDate(1);
    result.setUTCMonth(result.getUTCMonth() + months);
    const lastDay = new Date(
      Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
    ).getUTCDate();
    result.setUTCDate(Math.min(day, lastDay));
    return result;
  }

  private periodKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
