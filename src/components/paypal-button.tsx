
'use client'

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { OnApproveData, OnApproveActions } from "@paypal/paypal-js/types/components/buttons"; // Import directly from paypal-js types
import { initiatePaypalPayment, verifyPaypalPayment } from "@/services/payment/paypal";
import { PayPalVerifyResponse } from "@/services/payment/types";

interface PayPalButtonProps {
  tier_id: string;
  plan_type: "monthly" | "annual" | "quarterly";
  coupon_code: string;
  onPaymentSuccess: (details: PayPalVerifyResponse, orderId: string) => void;
  onPaymentError: (error: Error) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  tier_id,
  plan_type,
  coupon_code,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const createOrder = async () => {
    try {
      const { orderId } = await initiatePaypalPayment({ tier_id, plan_type, coupon_code });
      if (orderId) {
        return orderId;
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      onPaymentError(error as Error);
      throw error;
    }
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    try {
      // Ensure actions.order is available before calling capture
      if (!actions.order) {
        throw new Error("PayPal order actions not available.");
      }
      const orderDetail = await actions.order.capture(); // Use the captured order details
      const details = await verifyPaypalPayment({ transaction_id: orderDetail.id });
      onPaymentSuccess(details, orderDetail.id);
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
      onPaymentError(error as Error);
    }
  };

  const onError = (err: Error) => {
    console.error("PayPal error:", err);
    onPaymentError(err);
  };

  if (!paypalClientId) {
    return (
      <div className="text-center text-red-500">
        PayPal client ID is not configured. Please contact support.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "GBP",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
