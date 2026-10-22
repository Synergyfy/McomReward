import { PaymentService } from "./payment.service";
import {
  PaymentCheckoutMethod,
  PaymentCheckoutPurpose,
  PaymentCheckoutStatus,
} from "./entities/payment-checkout.entity";

describe("PaymentService (MCOM Pay packages)", () => {
  let service: PaymentService;
  let businessRepository: any;
  let mcomPayments: any;
  let checkoutService: any;
  let centralIntegration: any;

  const business = { id: "business-1", email: "owner@example.com" };

  beforeEach(() => {
    businessRepository = {
      findOne: jest.fn().mockResolvedValue(business),
    };
    mcomPayments = {
      createCharge: jest.fn(),
      confirmCharge: jest.fn(),
      topUpUrl: jest
        .fn()
        .mockReturnValue("http://localhost:3000/dashboard/wallet"),
      toHttpException: jest.fn((error) => {
        throw error;
      }),
    };
    checkoutService = {
      getOrCreate: jest.fn(),
      attachCharge: jest.fn(),
      markFailed: jest.fn(),
      markPaid: jest.fn(),
      findById: jest.fn(),
      findByChargeId: jest.fn(),
      findByProviderRef: jest.fn(),
    };
    centralIntegration = {
      processCashback: jest.fn().mockResolvedValue({ success: true }),
    };

    service = new PaymentService(
      businessRepository,
      mcomPayments,
      checkoutService,
      centralIntegration,
    );
  });

  it("creates a point-package charge server-side in minor units", async () => {
    const checkout = {
      id: "checkout-1",
      businessId: business.id,
      purpose: PaymentCheckoutPurpose.POINT_PACKAGE,
      amountMinor: "2500",
      currency: "GBP",
      method: PaymentCheckoutMethod.STRIPE,
    };
    checkoutService.getOrCreate.mockResolvedValue(checkout);
    checkoutService.attachCharge.mockImplementation(async (c) => c);
    mcomPayments.createCharge.mockResolvedValue({
      charge: {
        id: "ch_1",
        status: "pending",
        amountMinor: "2500",
        method: "stripe",
      },
      clientSecret: "pi_1_secret_x",
    });

    const result = await service.initiatePackagePurchase(
      { id: business.id },
      "pkg-1",
      25,
      "stripe",
      "POINT",
      "Gold Points",
    );

    expect(result.checkoutId).toBe("checkout-1");
    expect(result.chargeId).toBe("ch_1");
    expect(result.clientSecret).toBe("pi_1_secret_x");
    expect(mcomPayments.createCharge).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: "2500",
        method: "stripe",
        reference: expect.stringContaining("point-business-1-pkg-1"),
      }),
    );
  });

  it("confirms the charge and returns the package metadata", async () => {
    const checkout = {
      id: "checkout-1",
      businessId: business.id,
      purpose: PaymentCheckoutPurpose.POINT_PACKAGE,
      chargeId: "ch_1",
      amountMinor: "2500",
      currency: "GBP",
      method: PaymentCheckoutMethod.STRIPE,
      status: PaymentCheckoutStatus.PENDING,
      purposeRef: "pkg-1",
      metadata: { packageId: "pkg-1", packageType: "POINT" },
    };
    checkoutService.findByProviderRef.mockResolvedValue(checkout);
    mcomPayments.confirmCharge.mockResolvedValue({
      charge: { id: "ch_1", status: "paid", amountMinor: "2500" },
    });
    checkoutService.attachCharge.mockResolvedValue(checkout);

    const result = await service.verifyPackagePurchase(
      { id: business.id },
      "pi_1",
      "stripe",
    );

    expect(result.status).toBe("succeeded");
    expect(result.packageId).toBe("pkg-1");
    expect(result.amount).toBe(25);
    expect(centralIntegration.processCashback).toHaveBeenCalledWith(
      business.email,
      25,
      "POINT_PACKAGE_PURCHASE",
      "ch_1",
    );
  });

  it("rejects a payment that belongs to another business", async () => {
    checkoutService.findByProviderRef.mockResolvedValue({
      id: "checkout-1",
      businessId: "someone-else",
      purpose: PaymentCheckoutPurpose.POINT_PACKAGE,
      amountMinor: "2500",
      status: PaymentCheckoutStatus.PENDING,
    });

    await expect(
      service.verifyPackagePurchase({ id: business.id }, "pi_1", "stripe"),
    ).rejects.toThrow("another business");
  });
});
