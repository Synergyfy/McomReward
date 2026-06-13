export type CreditsPlatform = 'MCOM_LOYALTY' | 'MCOM_MALL';
export type CreditsRewardType = 'PERCENTAGE' | 'FIXED';
export type CreditsEvent = string;

export interface CreditsRule {
  id: string;
  platform: CreditsPlatform;
  eventType: string;
  rewardType: CreditsRewardType;
  rewardValue: number | string;
  isActive: boolean;
  level?: number;
  createdAt: string;
}

export interface CreateCreditsRulePayload {
  platform: CreditsPlatform;
  eventType: string | string[]; // Support multi-select
  rewardType: CreditsRewardType;
  rewardValue: number;
  isActive?: boolean;
  level?: number;
}

export interface UpdateCreditsRulePayload {
  isActive?: boolean;
  rewardValue?: number;
}

export interface CreditsLevel {
  level: number;
  creditsNeeded: number;
  matchingContribution: number;
  totalCashback: number;
}

export interface CreditProgression {
  currentCredits: number;
  currentLevel: number;
  nextLevel?: CreditsLevel;
  allLevels: CreditsLevel[];
}

export interface CreditsBalance {
  credits: number;
  availableCashback: number; // The actual wallet balance (claimed from credits)
  progression: CreditProgression;
  pendingAmount: number;
  expiringSoon: number;
}

export interface CreditsPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreditsHistoryItem {
  id: string;
  amount: number | string; // Could be credits or money depending on context
  type: string; // 'CREDIT' | 'DEBIT' 
  unit: 'CREDITS' | 'GBP';
  sourcePlatform?: CreditsPlatform;
  eventType?: string;
  description?: string;
  createdAt: string;
  status?: string;
}

export interface CreditsHistoryResponse {
  data: CreditsHistoryItem[];
  meta: CreditsPaginationMeta;
}

// Admin specific types
export interface AdminCreditsHistoryItem extends CreditsHistoryItem {
  referenceId?: string;
  wallet?: {
    id: string;
    user?: {
      id: string;
      email: string;
    }
  }
}

export interface AdminCreditsHistoryResponse {
  data: AdminCreditsHistoryItem[];
  meta: CreditsPaginationMeta;
}
