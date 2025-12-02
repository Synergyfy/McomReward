export interface Reward {
  id: string;
  title: string;
  pointsRequired: number;
  value: number;
  description: string;
  image: string;
  quantity: number;
  disabled: boolean;
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
  reward: Reward;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  image: string;
  value: number;
  disabled: boolean;
  rewardType?: string;
  rewardSource?: string;
  audience?: string;
  expiryDatetime?: string;
  status?: string;
}

export interface GetBusinessRewardsResponse extends PaginationMeta {
  data: BusinessReward[];
}

export interface CreateBusinessRewardDto {
  quantity?: number;
  point_required: number;
}

export enum RewardStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface UpdateBusinessRewardDto {
  quantity?: number;
  point_required?: number;
  title?: string;
  description?: string;
  image?: string;
  value?: number;
  expiry_datetime?: Date;
  status?: RewardStatus;
  disabled?: boolean;
}
