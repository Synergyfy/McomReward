export interface Reward {
  id: string;
  title: string;
  pointsRequired: number;
  points_required?: number;
  maxPoints: number;
  max_points?: number;
  value: number;
  description: string;
  image: string;
  gallery?: string[];
  quantity: number;
  disabled: boolean;
  stampsRequired?: number;
  stamps_required?: number;
  maxStampsRequired?: number;
  is_points_enabled?: boolean;
  is_stamps_enabled?: boolean;
  rewardType?: string;
  reward_type?: string;
  is_mall_integrated?: boolean;
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON';
  mall_reward_value?: number;
  mall_target_scope?: 'SPECIFIC' | 'ALL';
  mall_target_product_ids?: string[];
  mall_target_service_ids?: string[];
  mall_discount_type?: 'percentage' | 'fixed';
  mall_discount_value?: number;
  mall_max_discount?: number;
  mall_min_spend?: number;
  createdAt: string;
  updatedAt: string;
  expiry_datetime?: string;
  stamp_emoji?: string;
  stampEmoji?: string;
  image_source_type?: 'BUSINESS_LOGO' | 'LIBRARY_ASSET' | 'EMOJI' | 'CUSTOM_URL';
  isPointsEnabled?: boolean;
  isStampsEnabled?: boolean;
  emoji?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  next: number | null;
  previous: number | null;
}

export interface GetRewardsResponse extends PaginationMeta {
  data: Reward[];
}

export interface BusinessReward {
  id: string;
  quantity: number | null;
  pointRequired: number;
  pointsRequired?: number;
  points_required?: number;

  reward: Reward;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  image: string;
  gallery?: string[];
  value: number;
  disabled: boolean;
  rewardType?: string;
  reward_type?: string;
  stampsRequired?: number;
  stamps_required?: number;
  is_points_enabled?: boolean;
  is_stamps_enabled?: boolean;
  isPointsEnabled?: boolean;
  isStampsEnabled?: boolean;
  rewardSource?: string;
  audience?: string;
  expiryDatetime?: string;
  expiry_datetime?: string;
  status?: string;
  is_mall_integrated?: boolean;
  isMallIntegrated?: boolean;
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON';
  mallRewardType?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON';
  mall_reward_value?: number;
  mallRewardValue?: number;
  mall_target_scope?: 'SPECIFIC' | 'ALL';
  mallTargetScope?: 'SPECIFIC' | 'ALL';
  mall_target_product_ids?: string[];
  mallTargetProductIds?: string[];
  mall_target_service_ids?: string[];
  mallTargetServiceIds?: string[];
  mall_discount_type?: 'percentage' | 'fixed';
  mallDiscountType?: 'percentage' | 'fixed';
  mall_discount_value?: number;
  mallDiscountValue?: number;
  mall_max_discount?: number;
  mallMaxDiscount?: number;
  mall_min_spend?: number;
  mallMinSpend?: number;
  totalRedemptions?: number;
  totalPointsRedeemed?: number;
  stamp_emoji?: string;
  stampEmoji?: string;
  image_source_type?: 'BUSINESS_LOGO' | 'LIBRARY_ASSET' | 'EMOJI' | 'CUSTOM_URL';
  emoji?: string;
}


export interface GetBusinessRewardsResponse extends PaginationMeta {
  data: BusinessReward[];
}

export interface MallRewardHistoryRecord {
  id: string;
  type: string;
  points: number;
  redemption_code: string;
  description: string;
  created_at: string;
  participant: {
    id: string;
    name: string;
    email: string;
  };
  businessReward: BusinessReward;
}

export interface GetMallRewardHistoryResponse extends PaginationMeta {
  data: MallRewardHistoryRecord[];
}

export interface MallRewardStats {
  totalValue: number;
  totalCount: number;
  giftCardsCount: number;
  giftCardsValue: number;
  vouchersCount: number;
  vouchersValue: number;
  couponsCount: number;
  couponsValue: number;
}

export interface CreateBusinessRewardDto {
  quantity?: number;
  points_required: number;
  title?: string;
  description?: string;
  image?: string;
  gallery?: string[];
  expiry_datetime?: string;
  status?: RewardStatus;
  reward_type?: string;
  stamps_required?: number;
  is_points_enabled?: boolean;
  is_stamps_enabled?: boolean;
  disabled?: boolean;
  is_mall_integrated?: boolean;
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON';
  mall_reward_value?: number;
  mall_target_scope?: 'SPECIFIC' | 'ALL';
  mall_target_product_ids?: string[];
  mall_target_service_ids?: string[];
  mall_discount_type?: 'percentage' | 'fixed';
  mall_discount_value?: number;
  mall_max_discount?: number;
  mall_min_spend?: number;
  stamp_emoji?: string;
  image_source_type?: 'BUSINESS_LOGO' | 'LIBRARY_ASSET' | 'EMOJI' | 'CUSTOM_URL';
  emoji?: string;
}

export enum RewardStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
}

export interface UpdateBusinessRewardDto {
  quantity?: number;
  points_required?: number;
  title?: string;
  description?: string;
  image?: string;
  gallery?: string[];
  expiry_datetime?: string;
  status?: RewardStatus;
  reward_type?: string;
  stamps_required?: number;
  is_points_enabled?: boolean;
  is_stamps_enabled?: boolean;
  disabled?: boolean;
  is_mall_integrated?: boolean;
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON';
  mall_reward_value?: number;
  mall_target_scope?: 'SPECIFIC' | 'ALL';
  mall_target_product_ids?: string[];
  mall_target_service_ids?: string[];
  mall_discount_type?: 'percentage' | 'fixed';
  mall_discount_value?: number;
  mall_max_discount?: number;
  mall_min_spend?: number;
  stamp_emoji?: string;
  image_source_type?: 'BUSINESS_LOGO' | 'LIBRARY_ASSET' | 'EMOJI' | 'CUSTOM_URL';
  emoji?: string;
}

// ─── MCOM Mall catalog (for mall-discount targeting) ──────────────────────────

export interface MallCatalogProduct {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  salePrice: number | null;
  productType: string | null;
  status: string | null;
  image: string | null;
}

export interface MallCatalogService {
  id: string;
  name: string;
  category: string | null;
  pricingModel: string;
  fixedPrice: number | null;
  basePrice: number | null;
  status: string | null;
  image: string | null;
}

export interface MallCatalogBusiness {
  business: {
    id: string;
    name: string;
    email: string | null;
    mcomUserId: string | null;
  };
  products: MallCatalogProduct[];
  services: MallCatalogService[];
}
