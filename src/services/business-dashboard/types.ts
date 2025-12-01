export interface Activity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  type: 'EARN' | 'REDEEM';
  points: number;
  redemptionCode: string | null;
  description: string;
  participant: {
    id: string;
    name: string;
    email: string;
  };
  campaign: {
    id: string;
    name: string;
  };
}

export interface GeneralAnalyticsDto {
  totalCustomers: number;
  totalCampaigns: number;
  totalActiveCampaigns: number;
  totalRewardsRedeemed: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  activeCampaigns: {
    name: string;
    customerCount: number;
  }[];
  lastTenActivities: Activity[];
}

export interface ChartQueryDto {
  period?: '7d' | '30d' | '3m' | '6m' | '1y';
  businessId?: string;
}

export interface ChartData {
  date: string;
  pointsEarned: number;
  pointsRedeemed: number;
}

export interface ChartResponseDto {
  data: ChartData[];
}
