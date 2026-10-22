import {
  PaymentCheckoutMethod,
  PaymentCheckoutPurpose,
  PaymentCheckoutStatus,
} from "./entities/payment-checkout.entity";
import { PaymentCheckoutService } from "./payment-checkout.service";

const baseCheckout = (overrides: Record<string, any> = {}) => ({
  id: "checkout-1",
  businessId: "business-1",
  purpose: PaymentCheckoutPurpose.PLAN,
  purposeRef: "variant-1",
  status: PaymentCheckoutStatus.PENDING,
  amountMinor: "5000",
  currency: "GBP",
  method: PaymentCheckoutMethod.STRIPE,
  idempotencyKey: "key-1",
  ...overrides,
});

describe("PaymentCheckoutService", () => {
  let service: PaymentCheckoutService;
  let repository: any;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn((data) => ({ ...data })),
      save: jest.fn(async (data) => data),
    };
    service = new PaymentCheckoutService(repository);
  });

  it("returns the existing checkout for the same idempotency key", async () => {
    const existing = baseCheckout();
    repository.findOne.mockResolvedValue(existing);

    const result = await service.getOrCreate({
      businessId: "business-1",
      purpose: PaymentCheckoutPurpose.PLAN,
      purposeRef: "variant-1",
      amountMinor: "5000",
      method: PaymentCheckoutMethod.STRIPE,
      idempotencyKey: "key-1",
    });

    expect(result).toBe(existing);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("creates a pending checkout when no key exists", async () => {
    repository.findOne.mockResolvedValue(null);

    const result = await service.getOrCreate({
      businessId: "business-1",
      purpose: PaymentCheckoutPurpose.PLAN,
      purposeRef: "variant-1",
      amountMinor: "5000",
      method: PaymentCheckoutMethod.STRIPE,
      idempotencyKey: "key-1",
    });

    expect(result.status).toBe(PaymentCheckoutStatus.PENDING);
    expect(result.amountMinor).toBe("5000");
    expect(repository.save).toHaveBeenCalled();
  });

  it("attaches a paid charge and records fee/net", async () => {
    const checkout = baseCheckout();

    const result = await service.attachCharge(checkout as any, {
      charge: {
        id: "ch_1",
        status: "paid",
        amountMinor: "5000",
        feeMinor: "145",
        netMinor: "4855",
        providerRef: "pi_1",
      } as any,
    });

    expect(result.chargeId).toBe("ch_1");
    expect(result.providerRef).toBe("pi_1");
    expect(result.status).toBe(PaymentCheckoutStatus.PAID);
    expect(result.feeMinor).toBe("145");
    expect(result.netMinor).toBe("4855");
    expect(result.paidAt).toBeInstanceOf(Date);
  });

  it("marks paid only once so fulfillment stays idempotent", async () => {
    const checkout = baseCheckout();

    expect(await service.markPaid(checkout as any)).toBe(true);
    expect(checkout.status).toBe(PaymentCheckoutStatus.PAID);
    expect(await service.markPaid(checkout as any)).toBe(false);
  });

  it("does not overwrite a paid checkout with a stale pending charge", async () => {
    const checkout = baseCheckout({
      status: PaymentCheckoutStatus.PAID,
      chargeId: "ch_1",
    });

    await service.attachCharge(checkout as any, {
      charge: {
        id: "ch_1",
        status: "pending",
        amountMinor: "5000",
      } as any,
    });

    expect(checkout.status).toBe(PaymentCheckoutStatus.PAID);
  });
});
