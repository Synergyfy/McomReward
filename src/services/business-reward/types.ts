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

export interface GetRewardsResponse {
  data: Reward[];
  total: number;
}

export interface BusinessReward {
  id: string;
  quantity: number | null;
  pointRequired: number;
  reward: Reward;
  createdAt: string;
  updatedAt: string;
}

export interface GetBusinessRewardsResponse {
  data: BusinessReward[];
  total: number;
}

export interface CreateBusinessRewardDto {
  quantity?: number;
  point_required: number;
}
