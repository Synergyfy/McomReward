export interface CreateCampaignRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  rewardId: string;
}

export interface CampaignResponse {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  rewardId: string;
  createdAt: string;
  updatedAt: string;
}
