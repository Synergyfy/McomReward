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
