export interface Tier {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    monthlyPrice: string; // API returns string "45.00"
    annualPrice: string; // API returns string "540.00"
    quaterlyPrice: string; // API returns string "135.00"
    features: string[];
    status: string;
    stripeMonthlyPriceId: string;
    stripeQuarterlyPriceId: string;
    stripeAnnualPriceId: string;
    paypalMonthlyPlanId: string;
    paypalQuarterlyPlanId: string;
    paypalAnnualPlanId: string;
    qrCodeCount: number;
    description?: string;
    includesNfc?: boolean;
}

export enum PlanType {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUALLY = 'annually',
}

export enum PaymentProvider {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
}

// Stripe Payment Types
export interface StripeInitiateRequest {
    tier_id: string;
    plan_type: string; // "monthly" | "quarterly" | "annually"
    coupon_code?: string;
}

export interface StripeInitiateResponse {
    clientSecret: string;
}

export interface StripeVerifyRequest {
    transaction_id: string;
}

export interface StripeVerifyResponse {
    status: string;
}

// PayPal Payment Types
export interface PayPalInitiateRequest {
    tier_id: string;
    plan_type: string; // "monthly" | "quarterly" | "annually"
    coupon_code?: string;
}

export interface PayPalInitiateResponse {
    orderId: string;
    approveLink?: string; // PayPal approval URL to redirect user to
}

export interface PayPalVerifyRequest {
    transaction_id: string;
}

export interface PayPalVerifyResponse {
    status: string;
}
