// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  next: number | null;
  previous: number | null;
}

export interface TierQuotas {
  maxActiveCampaigns: number;
  maxActiveRewards: number;
  maxRewardsPerCampaign: number;
  monthlyPointsAllowance: number;
  maxTeamMembers: number;
}

export interface TierFeatureFlags {
  canCreateCampaignFromScratch: boolean;
  canEditAdminTemplates: boolean;
  hasAccessToAdvancedAnalytics: boolean;
  hasAccessToCRM: boolean;
  canUpdateReward: boolean;
  canCreateRewardFromScratch: boolean;
}

export interface TierProgressBonuses {
  [key: string]: number;
}

export interface ProgressionConditions {
  minCampaignsCreated?: number;
  minRewardsCreated?: number;
  minPointsUsed?: number;
  minCustomerScans?: number;
  minParticipants?: number;
  minCustomerInteractions?: number;
  minDaysActive?: number;
  profileCompleted?: boolean;
  kycVerified?: boolean;
}

export interface ProgressionBenefits {
  quotas?: Partial<TierQuotas>;
  featureFlags?: Partial<TierFeatureFlags>;
  bonusPoints?: number;
  unlockNextTierPreview?: {
    percentNextTierPoints?: number;
    additionalTeamMembers?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export interface ProgressionLevel {
  conditions: ProgressionConditions;
  benefits: ProgressionBenefits;
}

export interface SeasonalVariant {
  price?: number;
  stripe_price_id?: string;
  paypal_plan_id?: string;
  quotas?: Partial<TierQuotas>;
  featureFlags?: Partial<TierFeatureFlags>;
  progressBonuses?: Partial<TierProgressBonuses>;
  pro?: Partial<ProgressionLevel>;
  pro_plus?: Partial<ProgressionLevel>;
}

export interface TrialConfiguration {
  quotas?: Partial<TierQuotas>;
  featureFlags?: Partial<TierFeatureFlags>;
}

export interface TierConfiguration {
  quotas: TierQuotas;
  featureFlags: TierFeatureFlags;
  progressBonuses?: TierProgressBonuses;
  pro?: ProgressionLevel;
  pro_plus?: ProgressionLevel;
  winter?: SeasonalVariant;
  summer?: SeasonalVariant;
  autumn?: SeasonalVariant;
  spring?: SeasonalVariant;
  trial?: TrialConfiguration;
}

export interface Tier {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
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
  configuration: TierConfiguration;
}

export interface TierCreateInput {
  name: string;
  monthly_price: number;
  quaterly_price: number;
  annual_price: number;
  features: string[];
  configuration: TierConfiguration;
}

export interface TierUpdateInput {
  name?: string;
  monthly_price?: number;
  quaterly_price?: number;
  annual_price?: number;
  features?: string[];
  configuration?: TierConfiguration;
}

// Membership and Payment history types returned by `/payment-history` endpoint
export interface Membership {
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
  tier: Tier;
}

export interface PaymentHistoryItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  userType: string;
  amount: string;
  paymentProvider: string;
  transactionId: string;
  status: string;
  membership: Membership;
}

export interface PaymentHistorySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment_provider?: string;
  user_type?: string;
  purchase_type?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface PointPackage {
  id: string;
  name: string;
  description: string;
  points: number;
  price: string; // Backend returns price as string
  currency: string;
  tiers: Tier[];
  isActive: boolean; // Changed from is_active to match backend
  createdAt: string; // Changed from created_at to match backend
  updatedAt: string; // Changed from updated_at to match backend
  deletedAt: string | null;
}

export interface PointPackageCreateInput {
  name: string;
  description?: string;
  points: number;
  price: number;
  currency?: string;
  tier_ids: string[]; // Keep snake_case for API input
  is_active?: boolean; // Keep snake_case for API input
}

export interface PointPackageUpdateInput {
  name?: string;
  description?: string;
  points?: number;
  price?: number;
  currency?: string;
  tier_ids?: string[]; // Keep snake_case for API input
  is_active?: boolean; // Keep snake_case for API input
}