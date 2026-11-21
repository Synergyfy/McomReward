import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PaymentAdminController } from "./payment-admin.controller";
import { PaymentCheckoutStatus } from "./entities/payment-checkout.entity";

const paidCheckout = {
  id: "checkout-1",
  chargeId: "ch_1",
  amountMinor: "10270",
  status: PaymentCheckoutStatus.PAID,
  currency: "GBP",
};

function build() {
  const mcomPayments = {
    refundCharge: jest.fn().mockResolvedValue({
      charge: { id: "ch_1", status: "refunded" },
    }),
    getBalance: jest.fn().mockResolvedValue({
      success: true,
      data: { availableMinor: "1000" },
    }),
    toHttpException: jest.fn((error) => {
      throw error;
    }),
  };
  const checkoutService = {
    findById: jest.fn().mockResolvedValue({ ...paidCheckout }),
    findByChargeId: jest.fn().mockResolvedValue({ ...paidCheckout }),
    markRefunded: jest.fn().mockResolvedValue(undefined),
  };
  const controller = new PaymentAdminController(
    mcomPayments as any,
    checkoutService as any,
  );
  return { controller, mcomPayments, checkoutService };
}

describe("PaymentAdminController", () => {
  it("refunds a paid checkout and marks it refunded", async () => {
    const { controller, mcomPayments, checkoutService } = build();

    const result = await controller.refundCheckout("checkout-1", {
      amountMinor: "10270",
      reason: "Customer requested refund",
    });

    expect(mcomPayments.refundCharge).toHaveBeenCalledWith(
      "ch_1",
      "10270",
      "Customer requested refund",
    );
    expect(checkoutService.markRefunded).toHaveBeenCalledWith(
      expect.objectContaining({ id: "checkout-1" }),
      expect.objectContaining({ id: "ch_1", status: "refunded" }),
    );
    expect(result).toMatchObject({
      success: true,
      fullRefund: true,
      refundedMinor: "10270",
    });
  });

  it("supports a partial refund without flipping the checkout status", async () => {
    const { controller, checkoutService } = build();

    const result = await controller.refundCheckout("checkout-1", {
      amountMinor: "5000",
    });

    expect(checkoutService.markRefunded).not.toHaveBeenCalled();
    expect(result.fullRefund).toBe(false);
  });

  it("refuses to refund more than the original charge", async () => {
    const { controller, mcomPayments } = build();

    await expect(
      controller.refundCheckout("checkout-1", { amountMinor: "20000" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mcomPayments.refundCharge).not.toHaveBeenCalled();
  });

  it("refuses to refund a checkout that was never paid", async () => {
    const { controller, checkoutService } = build();
    checkoutService.findById.mockResolvedValue({
      ...paidCheckout,
      status: PaymentCheckoutStatus.PENDING,
    } as any);

    await expect(
      controller.refundCheckout("checkout-1", {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns the app payable balance", async () => {
    const { controller } = build();

    const result = await controller.getBalance();

    expect(result).toMatchObject({
      data: { availableMinor: "1000" },
    });
  });

  it("throws when the checkout does not exist", async () => {
    const { controller, checkoutService } = build();
    checkoutService.findById.mockResolvedValue(null);

    await expect(
      controller.refundCheckout("missing", {}),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
