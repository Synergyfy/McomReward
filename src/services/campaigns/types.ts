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

export enum CampaignType {
  QR_CODE = 'qr_code',
  LINK = 'link',
  BOTH = 'both',
}

export enum AudienceType {
  ALL = 'all',
  MEMBERS = 'members',
}

export interface PublicCampaignResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  campaignType: CampaignType;
  campaignMessage: string;
  startDate: string;
  endDate: string;
  quantity: number;
  audienceType: AudienceType;
  bannerUrl: string;
  logoUrl: string | null;
  ctaText: string;
  ctaBackgroundColor: string;
  ctaTextColor: string;
  disabled: boolean;
  textColor: string;
  backgroundColor: string;
  signUpPoint: number | null;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  rewardType: string; // Assuming string based on response
  regularPointsThreshold: number | null;
  matchingPointsThreshold: number | null;
  totalMatchingPointsEarned: number;
  matchingPointsDisabledByAdmin: boolean;
  business: {
    logoUrl: string;
  };
  rewards: {
    name: string;
  }[];
}

// The structure of the paginated response
export interface PaginatedCampaignsResponse {
  data: PublicCampaignResponse[];
  total: number;
  page: number;
  limit: number;
}
