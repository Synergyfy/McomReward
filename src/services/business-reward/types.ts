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
}

export interface GetBusinessRewardsResponse extends PaginationMeta {
  data: BusinessReward[];
}

export interface CreateBusinessRewardDto {
  quantity?: number;
  point_required: number;
}
