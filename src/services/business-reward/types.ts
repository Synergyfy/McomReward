export interface Reward {
  id: string;
  title: string;
  points_required: number;
  value: number;
  description: string;
  image: string;
  quantity: number;
  disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetRewardsResponse {
  data: Reward[];
  total: number;
}

export interface BusinessReward {
    id: string;
    point_cost: number;
    stock: number;
    created_at: string;
    updated_at: string;
    reward: Reward;
}

export interface GetBusinessRewardsResponse {
  data: BusinessReward[];
  total: number;
}

export interface CreateBusinessRewardDto {
  quantity?: number;
  point_required: number;
}
