export interface AdminParticipant {
  id: string;
  name: string;
  email: string;
  badgeLevel: string;
  location: string;
  activity: string;
  campaignsJoined: number;
  rewardsRedeemed: number;
  globalTotalPoints: number;
  matchingPoints: number;
  joinedDate: string;
}

export interface AdminBusiness {
  id: string;
  name: string;
  email: string;
  tier: string;
  sector: string;
  activityStatus: string;
  campaignsCreated: number;
  rewardsAttached: number;
  pointsBalance: number;
  memberSince: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminBusinessDetails {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  sector: {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
  };
  category: {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
  };
  subCategory: {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
  };
  website: string;
  socialMedia: Record<string, unknown>;
  uniqueCode: string;
  role: string;
  referralCapacity: number;
  affiliateCode: string;
  referralPoints: number;
  reputation_points: number;
  isDisabled: boolean;
  stripe_customer_id: string;
  total_points_earned: number;
  total_points_redeemed: number;
  remainingPointBalance: number;
  extraPoints: number;
}
