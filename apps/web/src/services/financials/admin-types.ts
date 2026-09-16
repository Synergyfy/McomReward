export type EscrowStatus = 'held' | 'released' | 'refunded';

export interface Escrow {
  id: string;
  campaignId: string;
  campaignName: string;
  businessId: string;
  businessName: string;
  amount: number;
  status: EscrowStatus;
  createdAt: Date;
  releasedAt?: Date;
}

export type PayoutStatus = 'pending' | 'approved' | 'rejected';

export interface PayoutRequest {
  id: string;
  businessId: string;
  businessName: string;
  amount: number;
  status: PayoutStatus;
  requestedAt: Date;
  processedAt?: Date;
}

export interface FinancialAnalytics {
  revenueOverTime: { month: string; revenue: number }[];
  payoutsVsSubscriptions: { name: string; value: number }[];
}

export interface PaginatedFinancialsResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}