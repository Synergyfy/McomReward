import api from "../api";

export interface InitiatePaypalPaymentPayload {
  tier_id: string;
  plan_type: "monthly" | "annual" | "quarterly" | "seasonal";
  coupon_code?: string;
}

export interface InitiatePaypalPaymentResponse {
  orderId: string;
}

export const initiatePaypalPayment = async (
  payload: InitiatePaypalPaymentPayload
): Promise<InitiatePaypalPaymentResponse> => {
  const { data } = await api.post("/payment/paypal/initiate", payload);
  return data;
};

export interface VerifyPaypalPaymentPayload {
  transaction_id: string;
}

export interface VerifyPaypalPaymentResponse {
  status: "COMPLETED";
  accessToken: string;
  refreshToken: string;
}

export const verifyPaypalPayment = async (
  payload: VerifyPaypalPaymentPayload
): Promise<VerifyPaypalPaymentResponse> => {
  const { data } = await api.post("/payment/paypal/verify", payload);
  return data;
};
