
export interface Tier {
  id: string;
  name: string;
  monthlyPrice: string;
  quaterlyPrice: string;
  annualPrice: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TierCreateInput {
  name: string;
  monthly_price: number;
  quaterly_price: number;
  annual_price: number;
  features: string[];
}

export interface TierUpdateInput {
  name?: string;
  monthly_price?: number;
  quaterly_price?: number;
  annual_price?: number;
  features?: string[];
}

// Membership and Payment history types returned by `/payment-history` endpoint
export interface Membership {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  userType: string;
  status: string;
  planType: string;
  startsAt: string;
  expiresAt: string;
  isTrial: boolean;
  tier: Tier;
}

export interface PaymentHistoryItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  userType: string;
  amount: string;
  paymentProvider: string;
  transactionId: string;
  status: string;
  membership: Membership;
}
