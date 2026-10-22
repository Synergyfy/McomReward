import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { Business } from "../business/entities/business.entity";
import { CashbackEvent } from "../../common/enums/cashback-event.enum";
import { fromMinorUnits, toMinorUnits } from "../../common/utils/money.util";
import {
  McomChargeResponse,
  McomPaymentsService,
} from "./mcom-payments.service";
import { PaymentCheckoutService } from "./payment-checkout.service";
import {
  PaymentCheckout,
  PaymentCheckoutMethod,
  PaymentCheckoutPurpose,
  PaymentCheckoutStatus,
} from "./entities/payment-checkout.entity";
import { CentralIntegrationService } from "./central-integration.service";

/**
 * Point / stamp package purchases and extra-point top-ups.
 *
 * Every charge is created server-side through MCOM Pay in minor units. The
 * browser only receives a provider handle (clientSecret / approvalUrl).
 */
@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly mcomPayments: McomPaymentsService,
    private readonly checkoutService: PaymentCheckoutService,
    private readonly centralIntegrationService: CentralIntegrationService,
  ) {}

  private mapPayMethod(provider: string): PaymentCheckoutMethod {
    switch ((provider || "").toLowerCase()) {
      case "wallet":
      case "mcom_wallet":
        return PaymentCheckoutMethod.WALLET;
      case "paypal":
        return PaymentCheckoutMethod.PAYPAL;
      default:
        return PaymentCheckoutMethod.STRIPE;
    }
  }

  private async resolvePayerBusiness(userId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: userId },
    });
    if (!business) throw new NotFoundException("Business not found");
    return business;
  }

  private buildChargeResponse(
    checkout: PaymentCheckout,
    response: McomChargeResponse,
  ) {
    return {
      success: true,
      checkoutId: checkout.id,
      chargeId: response.charge.id,
      method: checkout.method,
      amountMinor: checkout.amountMinor,
      currency: checkout.currency,
      status: response.charge.status,
      clientSecret: response.clientSecret,
      approvalUrl: response.approvalUrl,
      ...(checkout.method === PaymentCheckoutMethod.WALLET
        ? { topUpUrl: this.mcomPayments.topUpUrl() }
        : {}),
    };
  }

  private async resolveCheckoutForPayment(
    businessId: string,
    transactionId: string,
    purpose?: PaymentCheckoutPurpose,
    checkoutId?: string,
    chargeId?: string,
  ): Promise<PaymentCheckout> {
    let checkout: PaymentCheckout | null = null;

    if (checkoutId) {
      checkout = await this.checkoutService.findById(checkoutId);
    } else if (chargeId) {
      checkout = await this.checkoutService.findByChargeId(chargeId);
    } else if (transactionId) {
      checkout = await this.checkoutService.findByProviderRef(transactionId);
    }

    if (!checkout) {
      throw new NotFoundException(
        "Payment session not found. Please start the payment again.",
      );
    }
    if (purpose && checkout.purpose !== purpose) {
      throw new BadRequestException("This payment belongs to another purchase");
    }
    if (checkout.businessId && checkout.businessId !== businessId) {
      throw new BadRequestException("This payment belongs to another business");
    }

    return checkout;
  }

  private async ensureCheckoutPaid(
    checkout: PaymentCheckout,
    transactionId: string,
    provider: string,
  ): Promise<void> {
    if (checkout.status === PaymentCheckoutStatus.PAID) return;
    if (!checkout.chargeId) {
      throw new BadRequestException(
        "This payment has no MCOM Pay charge. Please start again.",
      );
    }

    const method = (provider || checkout.method).toLowerCase();
    const handle =
      method === "paypal"
        ? { orderId: transactionId }
        : { paymentIntentId: transactionId };

    let response: McomChargeResponse;
    try {
      response = await this.mcomPayments.confirmCharge(
        checkout.chargeId,
        handle,
      );
    } catch (error) {
      this.mcomPayments.toHttpException(error);
    }

    if (response.charge.status !== "paid") {
      throw new BadRequestException(
        `Payment is not complete (status: ${response.charge.status})`,
      );
    }
    if (
      response.charge.amountMinor &&
      response.charge.amountMinor !== checkout.amountMinor
    ) {
      throw new BadRequestException(
        "Paid amount does not match the expected amount",
      );
    }

    await this.checkoutService.attachCharge(checkout, response);
    await this.checkoutService.markPaid(checkout, response.charge);
  }

  async initiatePointPurchase(
    user: any,
    points: number,
    amount: number,
    provider: string,
  ) {
    const business = await this.resolvePayerBusiness(user.id);
    const method = this.mapPayMethod(provider);
    if (method === PaymentCheckoutMethod.WALLET && !business.mcomUserId) {
      throw new BadRequestException({
        code: "ACCOUNT_NOT_LINKED",
        message: "This business is not linked to an MCOM account.",
      });
    }

    const checkoutId = randomUUID();
    const amountMinor = toMinorUnits(amount);
    const reference = `extra-${business.id}-${checkoutId}`.slice(0, 255);
    const idempotencyKey =
      `mcom-rewards-extra-${business.id}-${points}-${checkoutId}`.slice(0, 255);
    const metadata = {
      businessId: business.id,
      points,
      packageType: "EXTRA_POINTS",
      checkoutId,
    };

    const checkout = await this.checkoutService.getOrCreate({
      businessId: business.id,
      purpose: PaymentCheckoutPurpose.EXTRA_POINTS,
      purposeRef: String(points),
      amountMinor,
      method,
      idempotencyKey,
      reference,
      metadata,
    });

    let response: McomChargeResponse;
    try {
      response = await this.mcomPayments.createCharge({
        amountMinor,
        method,
        reference,
        description: `Extra Points: ${points} Points`,
        mcomUserId:
          method === PaymentCheckoutMethod.WALLET
            ? business.mcomUserId
            : undefined,
        externalCustomerId: business.id,
        metadata: { ...metadata, localCheckoutId: checkout.id },
        idempotencyKey,
      });
    } catch (error) {
      await this.checkoutService.markFailed(
        checkout,
        (error as Error)?.message,
      );
      this.mcomPayments.toHttpException(error);
    }

    const updated = await this.checkoutService.attachCharge(checkout, response);
    return this.buildChargeResponse(updated, response);
  }

  async verifyPointPurchase(
    user: any,
    transactionId: string,
    provider: string,
    checkoutId?: string,
    chargeId?: string,
  ) {
    const checkout = await this.resolveCheckoutForPayment(
      user.id,
      transactionId,
      PaymentCheckoutPurpose.EXTRA_POINTS,
      checkoutId,
      chargeId,
    );

    await this.ensureCheckoutPaid(checkout, transactionId, provider);

    const points = Number(
      checkout.metadata?.points || checkout.purposeRef || 0,
    );
    const amount = fromMinorUnits(checkout.amountMinor);

    await this.processCashback(
      user.id,
      amount,
      CashbackEvent.POINT_PACKAGE_PURCHASE,
      checkout.chargeId || checkout.id,
    );

    return {
      status: "succeeded",
      points,
      amount,
      transactionId: checkout.chargeId || checkout.id,
    };
  }

  async initiatePackagePurchase(
    user: any,
    packageId: string,
    amount: number,
    provider: string,
    packageType: string,
    packageName: string,
  ) {
    const business = await this.resolvePayerBusiness(user.id);
    const method = this.mapPayMethod(provider);
    if (method === PaymentCheckoutMethod.WALLET && !business.mcomUserId) {
      throw new BadRequestException({
        code: "ACCOUNT_NOT_LINKED",
        message: "This business is not linked to an MCOM account.",
      });
    }

    const purpose =
      packageType === "STAMP"
        ? PaymentCheckoutPurpose.STAMP_PACKAGE
        : PaymentCheckoutPurpose.POINT_PACKAGE;
    const checkoutId = randomUUID();
    const amountMinor = toMinorUnits(amount);
    const reference =
      `${packageType.toLowerCase()}-${business.id}-${packageId}-${checkoutId}`.slice(
        0,
        255,
      );
    const idempotencyKey =
      `mcom-rewards-${packageType.toLowerCase()}-${business.id}-${packageId}-${checkoutId}`.slice(
        0,
        255,
      );
    const metadata = {
      businessId: business.id,
      packageId,
      packageType,
      packageName,
      checkoutId,
    };

    const checkout = await this.checkoutService.getOrCreate({
      businessId: business.id,
      purpose,
      purposeRef: packageId,
      amountMinor,
      method,
      idempotencyKey,
      reference,
      metadata,
    });

    let response: McomChargeResponse;
    try {
      response = await this.mcomPayments.createCharge({
        amountMinor,
        method,
        reference,
        description: `${packageType} Package: ${packageName}`,
        mcomUserId:
          method === PaymentCheckoutMethod.WALLET
            ? business.mcomUserId
            : undefined,
        externalCustomerId: business.id,
        metadata: { ...metadata, localCheckoutId: checkout.id },
        idempotencyKey,
      });
    } catch (error) {
      await this.checkoutService.markFailed(
        checkout,
        (error as Error)?.message,
      );
      this.mcomPayments.toHttpException(error);
    }

    const updated = await this.checkoutService.attachCharge(checkout, response);
    return this.buildChargeResponse(updated, response);
  }

  async verifyPackagePurchase(
    user: any,
    transactionId: string,
    provider: string,
    checkoutId?: string,
    chargeId?: string,
  ) {
    const checkout = await this.resolveCheckoutForPayment(
      user.id,
      transactionId,
      undefined,
      checkoutId,
      chargeId,
    );

    if (
      checkout.purpose !== PaymentCheckoutPurpose.POINT_PACKAGE &&
      checkout.purpose !== PaymentCheckoutPurpose.STAMP_PACKAGE
    ) {
      throw new BadRequestException("This payment is not a package purchase");
    }

    await this.ensureCheckoutPaid(checkout, transactionId, provider);

    const packageType = String(
      checkout.metadata?.packageType ||
        (checkout.purpose === PaymentCheckoutPurpose.STAMP_PACKAGE
          ? "STAMP"
          : "POINT"),
    );
    const amount = fromMinorUnits(checkout.amountMinor);

    await this.processCashback(
      user.id,
      amount,
      packageType === "STAMP"
        ? CashbackEvent.STAMP_PACKAGE_PURCHASE
        : CashbackEvent.POINT_PACKAGE_PURCHASE,
      checkout.chargeId || checkout.id,
    );

    return {
      status: "succeeded",
      packageId: String(
        checkout.metadata?.packageId || checkout.purposeRef || "",
      ),
      packageType,
      amount,
      transactionId: checkout.chargeId || checkout.id,
    };
  }

  private async processCashback(
    businessId: string,
    amount: number,
    eventType: CashbackEvent,
    transactionReference: string,
  ): Promise<void> {
    try {
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });
      if (business?.email) {
        await this.centralIntegrationService.processCashback(
          business.email,
          amount,
          eventType,
          transactionReference,
        );
      }
    } catch {
      // Cashback must never block a completed purchase.
    }
  }
}
