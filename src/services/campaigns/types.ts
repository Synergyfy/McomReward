export interface CreateCampaignRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  rewardId: string;
  thumbnailUrl: string;
  subImageUrls: string[];
}

export interface CampaignResponse {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  rewardId: string;
  thumbnailUrl: string;
  subImageUrls: string[];
  createdAt: string;
  updatedAt: string;
}
