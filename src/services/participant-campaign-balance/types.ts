export type TransactionType = 'EARN' | 'REDEEM';

export interface ScanParticipantPayload {
  participantCode: string;
  campaignId: string;
  points?: number;
  type: TransactionType;
  rewardId?: string;
}

export interface GenerateCodePayload {
  campaignId: string;
  points?: number;
  type: TransactionType;
  expiresAt: string;
  rewardId?: string;
}

export interface DualScanPayload {
  staffOrBusinessCode: string;
  participantCode: string;
  campaignId: string;
  points?: number;
  type: TransactionType;
  rewardId?: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  newBalance?: number;
  transactionId?: string;
}

export interface GeneratedCodeResponse {
  code: string;
  expiresAt?: string;
}
