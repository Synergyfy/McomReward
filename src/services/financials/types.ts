
export interface TierQuotas {
  maxActiveCampaigns: number;
  maxActiveRewards: number;
  maxRewardsPerCampaign: number;
  monthlyPointsAllowance: number;
}

export interface TierFeatureFlags {
  canCreateCampaignFromScratch: boolean;
  canEditAdminTemplates: boolean;
  hasAccessToAdvancedAnalytics: boolean;
  hasAccessToCRM: boolean;
  canUpdateReward: boolean;
}

export interface TierProgressBonuses {
  [key: string]: number;
}

export interface TierVariant {
  quotas?: Partial<TierQuotas>;
  featureFlags?: Partial<TierFeatureFlags>;
  progressBonuses?: Partial<TierProgressBonuses>;
  monthly_price?: number;
  annual_price?: number;
  quaterly_price?: number;
  stripe_monthly_price_id?: string;
  stripe_annual_price_id?: string;
  stripe_quarterly_price_id?: string;
}

export interface TierConfiguration {
  quotas: TierQuotas;
  featureFlags: TierFeatureFlags;
  progressBonuses?: TierProgressBonuses;
  enablePro?: boolean;
  enableProPlus?: boolean;
  pro?: TierVariant;
  pro_plus?: TierVariant;
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
