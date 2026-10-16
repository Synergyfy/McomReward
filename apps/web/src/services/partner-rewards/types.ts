export type PartnerRewardStatus =
  | 'ISSUED'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'FAILED';

export interface PartnerRewardRecipient {
  email: string;
  mcomUserId: string | null;
  userId: string | null;
  userType: string | null;
  name: string | null;
  resolved: boolean;
}

export interface PartnerReward {
  id: string;
  rewardId: string | null;
  businessRewardId: string | null;
  rewardTitle: string | null;
  issuerClientId: string;
  externalRef: string | null;
  recipient: PartnerRewardRecipient;
  code: string | null;
  status: PartnerRewardStatus;
  rewardType: string | null;
  value: number;
  pointsAwarded: number | null;
  mallReference: string | null;
  quantity: number;
  expiresAt: string | null;
  redeemedAt: string | null;
  revokedAt: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerRewardsQuery {
  page?: number;
  limit?: number;
  status?: PartnerRewardStatus;
}

export interface PaginatedPartnerRewards {
  data: PartnerReward[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
