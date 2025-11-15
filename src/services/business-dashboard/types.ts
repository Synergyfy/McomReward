export interface GeneralAnalyticsDto {
  totalCustomers: number;
  totalCampaigns: number;
  totalActiveCampaigns: number;
  totalRewardsRedeemed: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  activeCampaigns: {
    campaignName: string;
    customerCount: number;
  }[];
  lastTenActivities: {
    activity: string;
    timestamp: string;
  }[];
}

export interface ChartQueryDto {
  period?: '7d' | '30d' | '3m' | '6m' | '1y';
}

export interface ChartData {
  date: string;
  pointsEarned: number;
  pointsRedeemed: number;
}

export interface ChartResponseDto {
  data: ChartData[];
}
