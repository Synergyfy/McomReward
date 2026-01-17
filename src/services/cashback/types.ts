export type CashbackPlatform = 'MCOM_LOYALTY' | 'MCOM_MALL';
export type CashbackRewardType = 'PERCENTAGE' | 'FIXED';
export type CashbackEvent = string;

export interface CashbackRule {
  id: string;
  platform: CashbackPlatform;
  eventType: string;
  rewardType: CashbackRewardType;
  rewardValue: number | string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCashbackRulePayload {
  platform: CashbackPlatform;
  eventType: string;
  rewardType: CashbackRewardType;
  rewardValue: number;
  isActive?: boolean;
}

export interface UpdateCashbackRulePayload {
  isActive?: boolean;
  rewardValue?: number;
}

export interface CashbackBalance {
  balance: number;
}

export interface CashbackPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CashbackHistoryItem {
  id: string;
  amount: number | string;
  type: string; // 'CREDIT' | 'DEBIT' etc
  sourcePlatform?: CashbackPlatform;
  eventType?: string;
  description?: string;
  createdAt: string;
  status?: string;
}

export interface CashbackHistoryResponse {
  data: CashbackHistoryItem[];
  meta: CashbackPaginationMeta;
}

// Admin specific types
export interface AdminCashbackHistoryItem extends CashbackHistoryItem {
  referenceId?: string;
  wallet?: {
    id: string;
    user?: {
      id: string;
      email: string;
    }
  }
}

export interface AdminCashbackHistoryResponse {
  data: AdminCashbackHistoryItem[];
  meta: CashbackPaginationMeta;
}
