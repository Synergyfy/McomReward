export interface Tier {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    type: 'standard' | 'seasonal'; // Added
    startDate?: string; // Added
    endDate?: string; // Added
    fixedPrice?: number; // Added
    colorCode?: string; // Added
    monthlyPrice: string;
    annualPrice: string;
    quaterlyPrice: string;
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
    progressBonuses?: Record<string, number>;
    pro?: TierProgressionLevel;
    pro_plus?: TierProgressionLevel;
    winter?: SeasonalVariant;
    summer?: SeasonalVariant;
    autumn?: SeasonalVariant;
    spring?: SeasonalVariant;
    trial?: TrialConfiguration;
}

export interface SeasonalVariant {
    price?: number;
    stripe_price_id?: string;
    paypal_plan_id?: string;
    quotas?: TierQuotas;
    featureFlags?: TierFeatureFlags;
    progressBonuses?: Record<string, number>;
    pro?: TierProgressionLevel;
    pro_plus?: TierProgressionLevel;
}

export interface TrialConfiguration {
    quotas?: TierQuotas;
    featureFlags?: TierFeatureFlags;
    progressBonuses?: Record<string, number>;
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
    monthlyRewardBudget?: number;
    maxTeamMembers?: number;
}

export interface TierFeatureFlags {
    canCreateCampaignFromScratch?: boolean;
    canEditAdminTemplates?: boolean;
    hasAccessToAdvancedAnalytics?: boolean;
    hasAccessToCRM?: boolean;
    canUpdateReward?: boolean;
    canCreateRewardFromScratch?: boolean;
}


// Trial Subscription Types
export interface JoinTrialDto {
    tier_id: string;
    payment_token?: string;
    provider: 'stripe' | 'paypal';
    return_url?: string;
    cancel_url?: string;
}

export interface TrialSubscriptionResponse {
    id: string;
    status: string;
    planType: string;
    startsAt: string;
    expiresAt: string;
    isTrial: boolean;
    variant: string;
    progressionLevel: string;
    business: {
        id: string;
    };
    tier: Tier;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

// Point Package Types
export interface PointPackage {
    id: string;
    name: string;
    description?: string;
    points: number;
    price: string;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface BuyPackageDto {
    /** ID of the package to purchase */
    packageId: string;

    /** Payment provider ('stripe' or 'paypal') */
    provider: string;
}

export interface ConfirmPurchaseDto {
    /** Transaction ID from the payment provider */
    transactionId: string;

    /** Payment provider ('stripe' or 'paypal') */
    provider: string;
}

export interface ConfirmPurchaseResponse {
    transactionId: string;
    provider: string;
}

// Minimal Business interface for Point Package types, assuming it's defined in detail elsewhere.
// This prevents direct circular dependencies if Business is fully detailed and imports Payment types.
export interface Business {
    id: string;
    name: string;
}

export interface BusinessPointPackage {
    id: string;
    business: Business;
    package: PointPackage;
    name: string; // Snapshot of package name
    initial_points: number;
    remaining_points: number;
    purchase_date: Date;
    status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED';
    transaction_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface PointPackageListResponse {
    data: PointPackage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

export enum PaymentProvider {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
}

export enum PlanType {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUALLY = 'annual',
    SEASONAL = 'seasonal',
}

// Payment Request/Response Types
export interface StripeInitiateRequest {
    tier_id: string;
    plan_type: string;
    coupon_code?: string;
    point_package_ids?: string[];
}

export interface StripeInitiateResponse {
    clientSecret: string;
}

export interface StripeVerifyRequest {
    transaction_id: string;
}

export interface StripeVerifyResponse {
    status: string;
    accessToken: string;
    refreshToken: string;
}

export interface PayPalInitiateRequest {
    tier_id: string;
    plan_type: string;
    coupon_code?: string;
    point_package_ids?: string[];
}

export interface PayPalInitiateResponse {
    orderId: string;
    approveLink?: string;
}

export interface PayPalVerifyRequest {
    transactionId: string;
}

export interface PayPalVerifyResponse {
    status: string;
    accessToken: string;
    refreshToken: string;
}

export interface UpdateTierProgressionDto {
    configuration: TierConfiguration;
}