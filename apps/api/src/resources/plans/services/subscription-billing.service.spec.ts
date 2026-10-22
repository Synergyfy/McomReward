import {
  SubscriptionBillingMethod,
  SubscriptionPlanType,
  SubscriptionStatus,
} from "../entities/plan-subscription.entity";
import {
  SubscriptionInvoice,
  SubscriptionInvoiceStatus,
} from "../entities/subscription-invoice.entity";
import { SubscriptionBillingService } from "./subscription-billing.service";

const periodStart = new Date("2026-11-01T00:00:00.000Z");

const subscription = (overrides: Record<string, any> = {}) => ({
  id: "sub-1",
  business: { id: "business-1", mcomUserId: "mcom-user-1" },
  planVariantId: "variant-1",
  planVariant: {
    plan: { name: "Gold" },
    tierLevel: { name: "PRO" },
  },
  price: { amount: 50, currency: "GBP" },
  plan_type: SubscriptionPlanType.QUARTERLY,
  status: SubscriptionStatus.ACTIVE,
  isActive: true,
  starts_at: new Date("2026-08-01T00:00:00.000Z"),
  expires_at: periodStart,
  billingAnchor: new Date("2026-08-01T00:00:00.000Z"),
  nextBillingAt: periodStart,
  billingMethod: SubscriptionBillingMethod.WALLET,
  renewalAttempts: 0,
  graceUntil: null,
  canceledAt: null,
  ...overrides,
});

describe("SubscriptionBillingService", () => {
  let service: SubscriptionBillingService;
  let invoiceRepository: any;
  let subscriptionRepository: any;
  let paymentRepository: any;
  let businessRepository: any;
  let centralWallet: any;
  let checkoutService: any;
  let mcomPayments: any;
  let expiryService: any;
  let fulfillmentService: any;

  beforeEach(() => {
    invoiceRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => ({ id: "invoice-1", ...data })),
      save: jest.fn(async (data) => data),
    };
    subscriptionRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(async (data) => data),
    };
    paymentRepository = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => data),
    };
    businessRepository = { update: jest.fn() };
    centralWallet = {
      debit: jest.fn().mockResolvedValue({
        transactionId: "wallet-txn-1",
        amount: 50,
      }),
    };
    checkoutService = {
      getOrCreate: jest.fn(),
      attachCharge: jest.fn(),
    };
    mcomPayments = {
      isConfigured: jest.fn().mockReturnValue(true),
      createCharge: jest.fn(),
    };
    expiryService = {
      calculateExpiryForTierLevel: jest.fn((_tier: string, start: Date) => {
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 180);
        return end;
      }),
    };
    fulfillmentService = {
      register: jest.fn(),
      fulfill: jest.fn(),
    };

    service = new SubscriptionBillingService(
      subscriptionRepository,
      invoiceRepository,
      paymentRepository,
      businessRepository,
      {} as any,
      expiryService,
      centralWallet,
      mcomPayments,
      checkoutService,
      fulfillmentService,
    );
  });

  it("auto-debits a wallet renewal with a per-period idempotency key", async () => {
    const sub = subscription();

    const result = await (service as any).renewSubscription(sub);

    expect(result).toBe("paid");
    expect(centralWallet.debit).toHaveBeenCalledWith(
      "mcom-user-1",
      50,
      expect.objectContaining({
        category: "SUBSCRIPTION",
        idempotencyKey: "mcom-rewards-sub-sub-1-2026-11-01",
      }),
    );
    expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
    expect(sub.expires_at).toBeInstanceOf(Date);
    expect(sub.nextBillingAt).toEqual(sub.expires_at);
    expect(sub.renewalAttempts).toBe(0);
    expect(paymentRepository.save).toHaveBeenCalled();
  });

  it("moves a failed wallet renewal to past_due with a retry date", async () => {
    const sub = subscription();
    centralWallet.debit.mockRejectedValue(new Error("INSUFFICIENT_BALANCE"));

    const result = await (service as any).renewSubscription(sub);

    expect(result).toBe("failed");
    expect(sub.status).toBe(SubscriptionStatus.PAST_DUE);
    expect(sub.renewalAttempts).toBe(1);
    expect(sub.graceUntil).toBeInstanceOf(Date);
    expect(sub.nextBillingAt.getTime()).toBeGreaterThan(Date.now());
    expect(businessRepository.update).toHaveBeenCalledWith("business-1", {
      membershipStatus: "past_due",
    });
  });

  it("does not re-charge an invoice that is already paid", async () => {
    const sub = subscription();
    invoiceRepository.findOne.mockResolvedValue({
      id: "invoice-1",
      status: SubscriptionInvoiceStatus.PAID,
    });

    const result = await (service as any).renewSubscription(sub);

    expect(result).toBe("paid");
    expect(centralWallet.debit).not.toHaveBeenCalled();
  });

  it("does not burn a dunning attempt while a card renewal awaits payment", async () => {
    const sub = subscription({
      billingMethod: SubscriptionBillingMethod.STRIPE,
    });
    const invoice: Partial<SubscriptionInvoice> = {
      id: "invoice-1",
      status: SubscriptionInvoiceStatus.PENDING,
      chargeId: "ch_pending",
      attempts: 1,
    };
    invoiceRepository.findOne.mockResolvedValue(invoice);

    const result = await (service as any).renewSubscription(sub);

    expect(result).toBe("skipped");
    expect(invoiceRepository.save).not.toHaveBeenCalled();
    expect(sub.renewalAttempts).toBe(0);
  });

  it("creates a fresh MCOM Pay charge for a card renewal", async () => {
    const sub = subscription({
      billingMethod: SubscriptionBillingMethod.STRIPE,
    });
    checkoutService.getOrCreate.mockResolvedValue({ id: "checkout-1" });
    mcomPayments.createCharge.mockResolvedValue({
      charge: { id: "ch_1", status: "pending", amountMinor: "5000" },
      clientSecret: "pi_1_secret_x",
    });

    const result = await (service as any).renewSubscription(sub);

    expect(result).toBe("skipped");
    expect(mcomPayments.createCharge).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: "5000",
        method: "stripe",
        idempotencyKey: "mcom-rewards-sub-sub-1-2026-11-01",
      }),
    );
  });
});
