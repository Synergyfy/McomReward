export interface CreateRewardRequest {
    title: string;
    points_required: number;
    value: number;
    description: string;
    image: string;
    quantity: number;
    disabled: boolean;
}

export interface UpdateRewardRequest {
  title?: string;
  points_required?: number;
  value?: number;
  description?: string;
  image?: string;
  quantity?: number;
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

