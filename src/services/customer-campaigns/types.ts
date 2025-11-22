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
  campaignMessage?: string; // Added to support potential schema change
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
  points: number;
  uniqueCode: string;
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
