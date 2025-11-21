export interface Tier {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    monthly_price: number;
    annual_price: number;
    quaterly_price: number;
    features: string[];
    status: string;
    qrCodeCount: number;
    description?: string; // Added optional description as it might be useful for UI
    includesNfc?: boolean; // Added optional field for UI compatibility
}

export enum PlanType {
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    ANNUALLY = 'ANNUALLY',
}

export enum PaymentProvider {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
}

export interface SubscribeDto {
    tier_id: string;
    plan_type: PlanType;
    provider?: PaymentProvider;
    payment_token?: string; // Required for Stripe
    return_url?: string;    // Required for PayPal
    cancel_url?: string;    // Required for PayPal
    is_trial?: boolean;
}

export interface StripeSubscriptionResponse {
    status: string;
    clientSecret: string;
    subscriptionId: string;
}

export interface PayPalSubscriptionResponse {
    status: string;
    orderId: string;
    approveLink: string;
}

export type SubscriptionResponse = StripeSubscriptionResponse | PayPalSubscriptionResponse;
