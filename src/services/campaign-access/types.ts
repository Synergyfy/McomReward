export interface CampaignAccessRecord {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  campaign: {
    id: string;
    title: string;
  };
  joinedAt: string;
}

export interface PaginatedCampaignAccess {
  data: CampaignAccessRecord[];
  total: number;
  page: number;
  limit: number;
}
