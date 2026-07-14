export type TransactionType = 'EARN' | 'REDEEM' | 'STAMP_EARN';

export interface ScanParticipantPayload {
  participantCode: string;
  campaignId: string;
  points?: number;
  stamps?: number;
  type: TransactionType;
  rewardId?: string;
  redemptionMethod?: 'points' | 'stamps';
  idempotencyKey?: string;
}

export interface GenerateCodePayload {
  campaignId: string;
  points?: number;
  stamps?: number;
  type: TransactionType;
  expiresAt: string;
  rewardId?: string;
}

export interface DualScanPayload {
  staffOrBusinessCode: string;
  participantCode: string;
  campaignId: string;
  points?: number;
  stamps?: number;
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
