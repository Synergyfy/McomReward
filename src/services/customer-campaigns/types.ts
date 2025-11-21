import { RewardResponse } from "@/services/rewards/types";

export interface PublicCampaign {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  banner_url: string;
  logo_url: string | null;
  campaign_type: string;
  rewards: RewardResponse[];
  audience_type: string;
  tagline?: string;
  howToEarn?: string[];
  termsAndConditions?: string[];
  rewardsAvailable?: number;
  stopAfterClaims?: number;
  category?: string;
  badgeLevel?: string;
  wishlistItemId?: string;
  contactUsPageTitle?: string;
  contactUsPageDescription?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  redeemRewardPageTitle?: string;
  redeemRewardPageDescription?: string;
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
