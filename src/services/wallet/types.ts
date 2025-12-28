export interface WalletTransaction {
  id: string;
  amount: string | number;
  type: string;
  reference: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  tierBalance: string | number;
  topupBalance: string | number;
  transactions?: WalletTransaction[];
}

export interface InitiateWalletTopupResponse {
  clientSecret?: string; // Stripe
  orderId?: string; // PayPal
}

export interface VerifyWalletTopupResponse {
  status: string;
  amount: number;
  transactionId: string;
}

export interface PointHistoryRecord {
  id: string;
  points: number;
  type: 'earned' | 'spent' | 'purchase' | 'referral_bonus' | 'manual_adjustment';
  description: string;
  timestamp: string;
  campaign?: {
    id: string;
    title: string;
  };
}

export interface PaginatedPointHistory {
  data: PointHistoryRecord[];
  total: number;
  page: number;
  limit: number;
}
