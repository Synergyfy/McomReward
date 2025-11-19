export interface CreateRewardRequest {
    title: string;
    pointsRequired: number;
    value: number;
    description: string;
    image: string;
    quantity: number;
    disabled: boolean;
    type: string;
    status: string;
    expiry: string;
    badgeLevel: string[];
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
  type: string;
  status: string;
  expiry: string;
  badgeLevel: string[];
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

