export interface CreateRewardRequest {
  title: string;
  max_points?: number;
  max_stamps_required?: number;
  value: number;
  description: string;
  image: string;
  gallery?: string[];
  quantity: number;
  reward_type: string;
  // reward_source: string;
  audience: string;
  expiry_datetime: string;
  status: string;
  sector_ids: string[];
  tier_ids: string[];
  is_points_enabled: boolean;
  is_stamps_enabled: boolean;
  stamp_emoji?: string;
  image_source_type?: string;
  library_asset_id?: string;
  sector_id?: string;
  category_id?: string;
  sub_category_id?: string;
  emoji?: string;
}

export interface UpdateRewardRequest {
  title?: string;
  pointsRequired?: number;
  max_points?: number;
  max_stamps_required?: number;
  value?: number;
  description?: string;
  image?: string;
  gallery?: string[];
  quantity?: number;
  disabled?: boolean;
  type?: string;
  status?: string;
  expiry?: string;
  badgeLevel?: string[];
  is_points_enabled?: boolean;
  is_stamps_enabled?: boolean;
  stamp_emoji?: string;
  image_source_type?: string;
  library_asset_id?: string;
  sector_id?: string;
  category_id?: string;
  sub_category_id?: string;
  emoji?: string;
  audience?: string;
  sector_ids?: string[];
  tier_ids?: string[];
}

export interface RewardResponse {
  id: string;
  title: string;
  pointRequired: number;
  maxPoints: number; // Corrected to match backend payload
  max_points?: number; // Kept as optional just in case
  max_stamps_required?: number;
  value: number;
  description: string;
  image: string;
  gallery?: string[];
  quantity: number;
  remainingQuantity: number;
  createdAt: string;
  updatedAt: string;
  disabled: boolean;
  rewardType: string;
  type: string;
  status: string;
  expiry: string;
  expiryDatetime?: string; // Corrected to match backend payload
  badgeLevel: string | string[];
  is_points_enabled: boolean;
  is_stamps_enabled: boolean;
  stamp_emoji?: string;
  audience?: string;
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
