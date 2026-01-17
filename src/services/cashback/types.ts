export type CashbackPlatform = 'MCOM_LOYALTY' | 'MCOM_MALL';
export type CashbackRewardType = 'PERCENTAGE' | 'FIXED';

export interface CashbackRule {
  id: string;
  platform: CashbackPlatform;
  eventType: string;
  rewardType: CashbackRewardType;
  rewardValue: number | string; // API shows "5.00" (string) in GET but 5 (number) in POST. Best to handle both or string.
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
  // API docs imply you can update these, checking scenarios:
  // Scenario 1: Disable a Rule -> { isActive: false }
  // Scenario 2: Update Reward Value -> { rewardValue: 10 }
}

export interface CashbackBalance {
  balance: number;
}
