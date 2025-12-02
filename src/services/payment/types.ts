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
    configuration?: TierConfiguration;
}

export interface TierConfiguration {
    quotas?: TierQuotas;
    featureFlags?: TierFeatureFlags;
    pro?: TierProgressionLevel;
    pro_plus?: TierProgressionLevel;
}

export interface TierProgressionLevel {
    conditions: TierConditions;
    benefits: TierBenefits;
}

export interface TierConditions {
    minCampaignsCreated?: number;
    minRewardsCreated?: number;
    minPointsUsed?: number;
    minCustomerScans?: number;
    minParticipants?: number;
    minTasksCompleted?: number;
    minPurchases?: number;
    minDaysActive?: number;
    profileCompleted?: boolean;
    kycVerified?: boolean;
    minCustomerInteractions?: number;
    minReviews?: number;
    minRedeemedRewards?: number;
    minRevenue?: number;
}

export interface TierBenefits {
    quotas?: TierQuotas;
    featureFlags?: TierFeatureFlags;
    bonusPoints?: number;
    unlockNextTierPreview?: {
        percentNextTierPoints?: number;
        additionalTeamMembers?: number;
        analytics?: boolean;
        segmentation?: boolean;
    };
}

export interface TierQuotas {
    maxActiveCampaigns?: number;
    maxActiveRewards?: number;
    maxRewardsPerCampaign?: number;
    monthlyPointsAllowance?: number;
    maxTeamMembers?: number;
}

export interface TierFeatureFlags {
    canCreateCampaignFromScratch?: boolean;
    canEditAdminTemplates?: boolean;
    hasAccessToAdvancedAnalytics?: boolean;
    hasAccessToCRM?: boolean;
    canUpdateReward?: boolean;
}

export interface UpdateTierProgressionDto {
    pro?: TierProgressionLevel;
    pro_plus?: TierProgressionLevel;
}

export enum PlanType {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUALLY = 'annual',
}

export enum PaymentProvider {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
}

// Stripe Payment Types
export interface StripeInitiateRequest {
    tier_id: string;
    plan_type: string; // "monthly" | "quarterly" | "annual"
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
    plan_type: string; // "monthly" | "quarterly" | "annual"
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
