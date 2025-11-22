export interface PointLog {
  name: string;
  email: string;
  points: number;
  description: string;
  type: string;
  date: string;
}

export interface GetPointLogsResponse {
  data: PointLog[];
  total: number;
  page: number;
  limit: number;
}

export interface SystemOverview {
  totalCampaigns: number;
  totalParticipants: number;
  totalRedemptions: number;
  totalBusiness: number;
  totalMatchingPoints: number;
}

export interface TopBusiness {
  id: string;
  name: string;
  totalPointsRedeemed: number;
  totalPointsEarned: number;
}

export interface TopReward {
  name: string;
  totalRedemptions: number;
}

export interface TierBreakdown {
  id: string;
  name: string;
  businessCount: number;
  monthlyPrice: string;
  annualPrice: string;
  quaterlyPrice: string;
  features: string[];
  status: string;
}

export interface GrowthActivityChartResponse {
  labels: string[];
  registrations: number[];
  activities: number[];
}
