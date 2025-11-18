import { Campaign } from '../campaigns/types';

export interface TopBusiness {
  id: string;
  name: string;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
}

export interface SystemOverview {
  totalCampaigns: number;
  totalParticipants: number;
  totalRedemptions: number;
  totalBusiness: number;
  totalMatchingPoints: number;
}

export interface TopReward {
  id: string;
  name: string;
  totalRedemptions: number;
}

export interface CampaignPerformanceData {
  campaign: Campaign;
  totalParticipants: number;
  totalPointsAwarded: number;
  totalRewardsRedeemed: number;
  redemptionRate: number;
}

export interface PaginatedCampaignPerformanceResponse {
  data: CampaignPerformanceData[];
  total: number;
  page: number;
  limit: number;
}
