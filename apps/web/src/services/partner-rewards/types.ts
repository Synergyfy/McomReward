export type PartnerRewardStatus =
  | 'ISSUED'
  | 'RESERVED'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'FAILED';

export interface PartnerMallTargets {
  scope?: 'SPECIFIC' | 'ALL';
  businessMcomUserId?: string;
  businessId?: string;
  productIds?: string[];
  serviceIds?: string[];
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  maxDiscount?: number;
  minSpend?: number;
}

export interface PartnerMallTargetProduct {
  id: string;
  title: string;
  price?: number | null;
  salePrice?: number | null;
  image?: string | null;
}

export interface PartnerMallTargetService {
  id: string;
  name: string;
  fixedPrice?: number | null;
  basePrice?: number | null;
  image?: string | null;
}

export interface PartnerMallTargetDetails {
  scope: 'SPECIFIC' | 'ALL';
  discountType?: 'percentage' | 'fixed' | null;
  discountValue?: number | null;
  maxDiscount?: number | null;
  minSpend?: number | null;
  productIds?: string[];
  serviceIds?: string[];
  business?: {
    id: string;
    name: string;
    email?: string | null;
    mcomUserId?: string | null;
  } | null;
  products: PartnerMallTargetProduct[];
  services: PartnerMallTargetService[];
}

export interface PartnerRewardRecipient {
  email: string;
  mcomUserId: string | null;
  userId: string | null;
  userType: string | null;
  name: string | null;
  resolved: boolean;
}

export interface PartnerReward {
  id: string;
  rewardId: string | null;
  businessRewardId: string | null;
  rewardTitle: string | null;
  issuerClientId: string;
  externalRef: string | null;
  recipient: PartnerRewardRecipient;
  code: string | null;
  status: PartnerRewardStatus;
  rewardType: string | null;
  value: number;
  pointsAwarded: number | null;
  mallReference: string | null;
  quantity: number;
  expiresAt: string | null;
  redeemedAt: string | null;
  revokedAt: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerRewardsQuery {
  page?: number;
  limit?: number;
  status?: PartnerRewardStatus;
}

export interface PaginatedPartnerRewards {
  data: PartnerReward[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
