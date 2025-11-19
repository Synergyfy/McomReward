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

