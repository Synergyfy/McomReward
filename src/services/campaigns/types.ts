export interface CreateCampaignRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  rewardId: string;
  thumbnailUrl: string;
  subImageUrls: string[];
}

export interface CreateCampaignPayload {
  name: string;
  campaign_type: string;
  campaign_message: string;
  start_date: string;
  end_date: string;
  quantity: number;
  audience_type: string;
  signUpPoint: number;
  banner_url: string;
  logo_url: string;
  cta_text: string;
  cta_background_color: string;
  cta_text_color: string;
  text_color: string;
  background_color: string;
  reward_type: string;
  regular_points_threshold: number;
  matching_points_threshold: number;
  earn_point_page_title: string;
  earn_point_page_description: string;
  redeem_reward_page_title: string;
  redeem_reward_page_description: string;
  contact_us_page_title: string;
  contact_us_page_description: string;
  contact_email: string;
  contact_phone_number: string;
  footer_text: string;
  business_reward_ids: string[];
}

export interface CampaignResponse {
  id: string;
  name: string;
  campaignType: string;
  campaignMessage: string;
  startDate: string;
  endDate: string;
  quantity: number;
  audienceType: string;
  bannerUrl: string;
  logoUrl: string;
  ctaText: string;
  ctaBackgroundColor: string;
  ctaTextColor: string;
  textColor: string;
  backgroundColor: string;
  signUpPoint: number;
  rewardType: string;
  regularPointsThreshold: number;
  matchingPointsThreshold: number;
  earnPointPageTitle: string;
  earnPointPageDescription: string;
  redeemRewardPageTitle: string;
  redeemRewardPageDescription: string;
  contactUsPageTitle: string;
  contactUsPageDescription: string;
  contactEmail: string;
  contactPhoneNumber: string;
  footerText: string;
  rewards: Reward[];
  uniqueCode: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  disabled: boolean;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalMatchingPointsEarned: number;
  matchingPointsDisabledByAdmin: boolean;
}

export enum CampaignType {
  QR_CODE = 'qr_code',
  LINK = 'link',
  BOTH = 'both',
  REFERRAL = 'referral',
}

export enum AudienceType {
  ALL = 'all',
  MEMBERS = 'members',
}

export interface Reward {
  id: string;
  title: string;
  points_required: number;
  value: number;
  description: string;
  image: string;
  quantity: number;
  disabled: boolean;
}

export interface PublicCampaignResponse {
  id: string;
  name: string;
  campaign_type: string; // API returns string, but we can map to enum if needed
  campaign_message: string;
  start_date: string;
  end_date: string;
  quantity: number;
  audience_type: string;
  banner_url: string;
  logo_url: string | null;
  cta_text: string;
  cta_background_color: string;
  cta_text_color: string;
  text_color: string;
  background_color: string;
  disabled: boolean;
  rewards: Reward[];
  uniqueCode?: string; // Present in my-created-campaigns example
}

export interface Business {
  id: string;
  name: string;
}

export interface BusinessCampaign {
  id: string;
  uniqueCode: string;
  business: Business;
  campaign: PublicCampaignResponse;
}

export interface PaginatedCampaignsResponse {
  data: PublicCampaignResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface OngoingCampaignReward {
  id: string;
  title: string;
  pointsRequired: number;
  value: number;
  description: string;
  image: string;
  quantity: number;
  disabled: boolean;
  rewardType: string;
  badgeLevel: string;
  rewardSource: string;
  audience: string;
  expiryDatetime: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OngoingCampaign {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  campaignType: string;
  campaignMessage: string;
  startDate: string;
  endDate: string;
  quantity: number;
  audienceType: string;
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
  rewardType: string;
  regularPointsThreshold: number | null;
  matchingPointsThreshold: number | null;
  totalMatchingPointsEarned: number;
  matchingPointsDisabledByAdmin: boolean;
  uniqueCode: string | null;
  earnPointPageTitle: string | null;
  earnPointPageDescription: string | null;
  redeemRewardPageTitle: string | null;
  redeemRewardPageDescription: string | null;
  contactUsPageTitle: string | null;
  contactUsPageDescription: string | null;
  contactEmail: string | null;
  contactPhoneNumber: string | null;
  footerText: string | null;
  business: {
    id: string;
    name: string;
  };
  rewards: OngoingCampaignReward[];
  participantCount: number;
}

export interface PaginatedOngoingCampaignsResponse {
  data: OngoingCampaign[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedAdminCampaignsResponse {
  data: CampaignResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CampaignAnalytics {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  disabled: boolean;
  sector: string | null;
  status: 'active' | 'inactive';
  totalParticipants: string;
  totalPointsAwarded: string;
  totalRewardsRedeemed: string;
  redemptionRate: number;
}

export interface PaginatedCampaignAnalyticsResponse {
  data: CampaignAnalytics[];
  total: number;
  page: number;
  limit: number;
}

export interface WeeklyChartData {
  date: string;
  pointsAwarded: string;
  rewardsRedeemed: string;
  newParticipants: string;
}

export interface RankedParticipant {
  id: string;
  pName: string;
  pEmail: string;
  totalPointsEarned: string;
  totalRedemptions: string;
}

export interface TopReward {
  id: string;
  rTitle: string;
  rPointsRequired: number;
  totalRedemptions: string;
}

export interface DetailedCampaignAnalytics {
  totalParticipants: string;
  totalRewardsRedeemed: string;
  totalPointsAwarded: string | null;
  redemptionRate: number;
  weeklyChartData: WeeklyChartData[];
  rankedParticipants: RankedParticipant[];
  topRewards: TopReward[];
}

export enum PointHistoryType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  MATCHING = 'MATCHING',
}

export interface CustomerActivityResponseDto {
  participantName: string;
  participantId?: string;
  activityType: PointHistoryType;
  details: string;
  campaignName: string;
  date: Date;

}

export interface PaginatedCustomerActivityResponseDto {
  data: CustomerActivityResponseDto[];
  total: number;
  page: number;
  limit: number;
}
