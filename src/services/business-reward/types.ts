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
  is_points_enabled?: boolean;
  is_stamps_enabled?: boolean;
  rewardType?: string;
  is_mall_integrated?: boolean;
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON';
  mall_reward_value?: number;
  createdAt: string;
  updatedAt: string;
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
  stampsRequired?: number;
  stamps_required?: number;
  is_points_enabled?: boolean;
  is_stamps_enabled?: boolean;
  rewardSource?: string;
  audience?: string;
  expiryDatetime?: string;
  status?: string;
  is_mall_integrated?: boolean;
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON';
  mall_reward_value?: number;
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
  expiry_datetime?: Date;
  status?: RewardStatus;
  reward_type?: string;
  stamps_required?: number;
  is_points_enabled?: boolean;
  is_stamps_enabled?: boolean;
  disabled?: boolean;
  is_mall_integrated?: boolean;
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON';
  mall_reward_value?: number;
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
  expiry_datetime?: Date;
  status?: RewardStatus;
  reward_type?: string;
  stamps_required?: number;
  is_points_enabled?: boolean;
  is_stamps_enabled?: boolean;
  disabled?: boolean;
  is_mall_integrated?: boolean;
  mall_reward_type?: 'VOUCHER' | 'GIFT_CARD' | 'COUPON';
  mall_reward_value?: number;
}
