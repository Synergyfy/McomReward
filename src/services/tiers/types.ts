export interface TierResponse {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    monthlyPrice?: string;
    annualPrice?: string;
    quaterlyPrice?: string;
    features?: string[];
    stripeMonthlyPriceId?: string | null;
    stripeQuarterlyPriceId?: string | null;
    stripeAnnualPriceId?: string | null;
    paypalMonthlyPlanId?: string | null;
    paypalQuarterlyPlanId?: string | null;
    paypalAnnualPlanId?: string | null;
    qrCodeCount?: number;
    deletedAt?: string | null;
}

export interface GetTiersResponse {
    data: TierResponse[];
    total: number;
    page: number;
    limit: number;
}

export interface Subscription {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    userId: string;
    userType: string;
    status: string;
    planType: string;
    startsAt: string;
    expiresAt: string;
    isTrial: boolean;
    tier: TierResponse;
}

export interface BillingHistory {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    userType: string;
    amount: string;
    paymentProvider: string;
    transactionId: string;
    status: string;
    membership: Subscription;
}
