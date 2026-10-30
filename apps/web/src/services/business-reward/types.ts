// ─── Ecosystem fulfilment (MCOM Mall / MCOM Central) ─────────────────────────

export type RewardFulfilmentProvider = 'NONE' | 'MALL' | 'CENTRAL';

export type RewardFulfilmentKind =
  | 'MALL_DISCOUNT'
  | 'MALL_GIFT_CARD'
  | 'MALL_VOUCHER'
  | 'MALL_COUPON'
  | 'CENTRAL_MEMBERSHIP'
  | 'CENTRAL_ACCESS_PASS'
  | 'CENTRAL_COUPON';

export interface RewardFulfilmentScope {
  mode?: 'ALL' | 'LISTINGS' | 'ITEMS' | 'NO_SCOPE';
  listingIds?: string[];
  productIds?: string[];
  serviceIds?: string[];
  planIds?: string[];
  accessPlanIds?: string[];
}

export interface RewardFulfilmentValue {
  amount?: number;
  currency?: string;
  discountType?: 'percentage' | 'fixed' | 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  maxDiscount?: number;
  minSpend?: number;
}

/**
 * Payload accepted by the API when a reward is attached to a fulfilment
 * provider. The backend flattens this into the `fulfilment_*` columns.
 */
export interface RewardFulfilmentInput {
  provider: RewardFulfilmentProvider;
  kind: RewardFulfilmentKind | string;
  delivery?: 'CODE' | 'DIRECT_GRANT' | 'CHECKOUT_APPLY';
  templateRef?: { system: 'MALL' | 'CENTRAL'; id: string } | null;
  businessId?: string | null;
  businessMcomUserId?: string | null;
  businessName?: string | null;
  scope?: RewardFulfilmentScope | null;
  value?: RewardFulfilmentValue | null;
  validity?: { expiresInDays?: number; expiresAt?: string } | null;
  grant?: {
    planId?: string;
    tier?: string;
    durationDays?: number;
    extendExisting?: boolean;
    replaceExisting?: boolean;
  } | null;
  coupon?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  fundingSource?: 'BUSINESS_WALLET' | 'PLATFORM';
}

/**
 * Fulfilment fields as returned by the API (the response interceptor
 * camel-cases the flattened `fulfilment_*` columns).
 */
export interface RewardFulfilmentStored {
  fulfilmentProvider?: RewardFulfilmentProvider | null;
  fulfilmentKind?: string | null;
  fulfilmentConfig?: (Omit<RewardFulfilmentInput, 'provider' | 'kind'> & Record<string, any>) | null;
  fulfilmentTemplateId?: string | null;
  fulfilmentBusinessRef?: string | null;
  fulfilmentFundingSource?: string | null;
}

export interface RewardFulfilmentStoredSnake {
  fulfilment_provider?: RewardFulfilmentProvider | null;
  fulfilment_kind?: string | null;
  fulfilment_config?: (Omit<RewardFulfilmentInput, 'provider' | 'kind'> & Record<string, any>) | null;
  fulfilment_template_id?: string | null;
  fulfilment_business_ref?: string | null;
  fulfilment_funding_source?: string | null;
}

export interface Reward extends RewardFulfilmentStored, RewardFulfilmentStoredSnake {
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
  createdAt: string;
  updatedAt: string;
  expiry_datetime?: string;
  stamp_emoji?: string;
  stampEmoji?: string;
  image_source_type?: 'BUSINESS_LOGO' | 'LIBRARY_ASSET' | 'EMOJI' | 'CUSTOM_URL';
  isPointsEnabled?: boolean;
  isStampsEnabled?: boolean;
  emoji?: string;
  /** Normalised fulfilment attachment, built by the UI before saving. */
  fulfilment?: RewardFulfilmentInput;
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

export interface BusinessReward extends RewardFulfilmentStored, RewardFulfilmentStoredSnake {
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
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON' | null;
  mall_reward_value?: number;
  mall_target_scope?: 'SPECIFIC' | 'ALL';
  mall_target_product_ids?: string[];
  mall_target_service_ids?: string[];
  mall_discount_type?: 'percentage' | 'fixed';
  mall_discount_value?: number;
  mall_max_discount?: number | null;
  mall_min_spend?: number | null;
  stamp_emoji?: string;
  image_source_type?: 'BUSINESS_LOGO' | 'LIBRARY_ASSET' | 'EMOJI' | 'CUSTOM_URL';
  emoji?: string;
  fulfilment?: RewardFulfilmentInput;
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
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON' | null;
  mall_reward_value?: number;
  mall_target_scope?: 'SPECIFIC' | 'ALL';
  mall_target_product_ids?: string[];
  mall_target_service_ids?: string[];
  mall_discount_type?: 'percentage' | 'fixed';
  mall_discount_value?: number;
  mall_max_discount?: number | null;
  mall_min_spend?: number | null;
  stamp_emoji?: string;
  image_source_type?: 'BUSINESS_LOGO' | 'LIBRARY_ASSET' | 'EMOJI' | 'CUSTOM_URL';
  emoji?: string;
  fulfilment?: RewardFulfilmentInput;
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
