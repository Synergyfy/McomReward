export interface CreateRewardRequest {
  title: string;
  points_required: number;
  value: number;
  description: string;
  image: string;
  quantity: number;
}

export interface UpdateRewardRequest extends Partial<CreateRewardRequest> {}

export interface RewardResponse {
  id: string;
  title: string;
  points_required: number;
  value: number;
  description: string;
  image: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetRewardsResponse {
  rewards: RewardResponse[];
  totalPages: number;
  currentPage: number;
  count: number;
}

export interface AddRewardToBusinessRequest {
  quantity: number;
}
