
'use client'

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { initiatePaypalPayment, verifyPaypalPayment } from "@/services/payment/paypal";
import { PayPalVerifyResponse } from "@/services/payment/types";

// From @paypal/react-paypal-js types
interface OnApproveData {
  orderID: string;
  payerID?: string;
  subscriptionID?: string;
}

interface PurchaseUnit {
  amount: {
    currency_code: string;
    value: string;
  };
  description?: string;
  // and other properties as needed
}

interface OrderResponseBody {
  id: string;
  status: string;
  purchase_units: PurchaseUnit[];
  payer: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    payer_id: string;
  };
}

interface OnApproveActions {
  order: {
    capture(): Promise<OrderResponseBody>;
    // Other potential methods might exist, but capture is the most common
  };
}


interface PayPalButtonProps {
  tier_id: string;
  plan_type: "monthly" | "annual" | "quaterly";
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
      const details = await verifyPaypalPayment({ transaction_id: data.orderID });
      onPaymentSuccess(details, data.orderID);
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
