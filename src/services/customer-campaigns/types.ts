import { RewardResponse } from "@/services/rewards/types";

export interface CampaignBusiness {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  socialMedia: any[] | null;
  uniqueCode: string;
  role: string;
  referralCapacity: any | null;
  affiliateCode: string;
  referralPoints: string;
  reputationPoints: string;
  profileImage: string | null;
  banner: string | null;
  isDisabled: boolean;
  stripeCustomerId: string | null;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  extraPoints: number;
  matchingPoints: number;
  isEmailVerified: boolean;
  sectorName: string | null;
  categoryName: string | null;
  subCategoryName: string | null;
}

export interface PublicCampaign {
  id: string;
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
  rewards: RewardResponse[];
  tagline?: string;
  howToEarn?: string[];
  termsAndConditions?: string[];
  rewardsAvailable?: number;
  stopAfterClaims?: number;
  category?: string;
  badgeLevel?: string;
  wishlistItemId?: string;
  initialAudienceSize: number | null;
  business?: CampaignBusiness;
}

export interface PublicCampaignSummary {
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
  initialAudienceSize: number | null;
  business?: CampaignBusiness;
}

export interface PaginatedPublicCampaigns {
  data: PublicCampaignSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface JoinCampaignResponse {
  message: string;
}

export interface IsJoinedResponse {
  isJoined: boolean;
}

export interface ParticipantBalance {
  campaignId: string;
  campaignName: string;
  balance: number;
}

export interface ParticipantGlobalBalanceResponse {
  globalTotalPoints: number;
  matchingPoints: number;
  campaignBalances: ParticipantBalance[];
}

export interface ParticipantProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  uniqueCode: string;
  global_total_points: number;
  matching_points: number;
  point_utilization: number;
  total_points_earned: number;
  total_points_redeemed: number;
  isDisabled: boolean;
  created_at: string;
  updated_at: string;
  campaign_balances: {
    campaign_id: string;
    campaign_name: string;
    balance: number;
  }[];
}

export interface ClaimCodePayload {
  code: string;
  campaignId: string;
}

export interface ClaimCodeResponse {
  message: string;
  pointsAwarded: number;
}

export interface RedeemRewardPayload {
  staffId: string;
  participantId: string;
  rewardId: string;
  redemptionCode: string;
}

export interface RedeemRewardResponse {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

// Staff Endpoints Types
export interface ScanParticipantPayload {
  participantCode: string;
  campaignId?: string;
  points?: number;
  type: 'EARN' | 'REDEEM';
  rewardId?: string; // For REDEEM type
}

export interface ScanParticipantResponse {
  message: string;
  newBalance?: number;
}

export interface GenerateCodePayload {
  points: number;
  type: 'EARN';
  campaignId: string;
}

export interface GenerateCodeResponse {
  code: string;
  expiresAt: string;
}

export interface DualScanPayload {
  staffOrBusinessCode: string;
  participantCode: string;
  points: number;
  type: 'EARN';
  campaignId: string;
}

export interface DualScanResponse {
  message: string;
  pointsAwarded: number;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  campaignId: string;
}

export interface SignUpResponse {
  message: string;
  participantId?: string;
}

export interface UniqueCodeResponse {
  uniqueCode: string;
}

export interface ParticipantHistoryItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  type: 'EARN' | 'REDEEM';
  points: number;
  redemptionCode: string | null;
  description: string;
  campaign: {
    id: string;
    name: string;
  };
  reward: {
    title: string;
  } | null;
  business: {
    name: string;
  };
}

export interface ParticipantHistoryResponse {
  data: ParticipantHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface MyCampaign {
  id: string;
  name: string;
  campaignMessage: string;
  balance: number;
  regularPointsThreshold: number;
  bannerUrl: string;
}

export interface MyCampaignsResponse {
  data: MyCampaign[];
  total: number;
  page: number;
  limit: number;
}
