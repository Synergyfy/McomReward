export interface CreateRewardRequest {
  title: string;
  points_required: number;
  value: number;
  description: string;
  image: string;
  quantity: number;
  reward_type: string;
  reward_source: string;
  audience: string;
  expiry_datetime: string;
  status: string;
  sector_ids: string[];
  tier_ids: string[];
}

export interface UpdateRewardRequest {
  title?: string;
  pointsRequired?: number;
  value?: number;
  description?: string;
  image?: string;
  quantity?: number;
  disabled?: boolean;
  type?: string;
  status?: string;
  expiry?: string;
  badgeLevel?: string[];
}

export interface RewardResponse {
  id: string;
  title: string;
  pointsRequired: number;
  value: number;
  description: string;
  image: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  disabled: boolean;
  rewardType: string; // Backend uses rewardType (camelCase)
  type: string; // Keep for backward compatibility
  status: string;
  expiry: string;
  badgeLevel: string | string[]; // Can be string or array
}

export interface GetRewardsResponse {
  data: RewardResponse[];
  totalPages: number;
  currentPage: number;
  count: number;
}

export interface AddRewardToBusinessRequest {
  quantity: number;
}
