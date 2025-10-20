import { RewardResponse } from "@/services/rewards/types";

export interface PublicCampaign {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  reward: RewardResponse;
}

export interface PaginatedPublicCampaigns {
    data: PublicCampaign[];
    total: number;
    page: number;
    limit: number;
}

export interface JoinCampaignResponse {
  message: string;
}
