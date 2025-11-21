import { RewardResponse } from "@/services/rewards/types";

export interface PublicCampaign {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  reward?: RewardResponse;
  rewards?: RewardResponse[];
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

export interface ParticipantBalance {
  points: number;
  uniqueCode: string;
}

export interface ClaimCodePayload {
  code: string;
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
