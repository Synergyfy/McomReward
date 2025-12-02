// src/lib/mock-data/financials.ts

export interface Transaction {
  id: string;
  businessId: string;
  businessName: string;
  type: 'subscription' | 'payout' | 'refund' | 'commission';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
}

export interface Escrow {
  id: string;
  campaignId: string;
  campaignName: string;
  businessId: string;
  businessName: string;
  amount: number;
  status: 'held' | 'released' | 'refunded';
  createdAt: Date;
  releasedAt?: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // Monthly price
  features: string[];
  isPopular: boolean;
}

export interface PayoutRequest {
  id: string;
  businessId: string;
  businessName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
}

export const mockTransactions: Transaction[] = [
  { id: 'txn-1', businessId: 'biz-123', businessName: 'The Coffee Spot', type: 'subscription', amount: 50, status: 'completed', date: new Date('2024-11-01') },
  { id: 'txn-2', businessId: 'biz-456', businessName: 'Local Threads', type: 'payout', amount: 500, status: 'completed', date: new Date('2024-11-05') },
  { id: 'txn-3', businessId: 'biz-789', businessName: 'Quick Bites', type: 'refund', amount: 20, status: 'completed', date: new Date('2024-11-06') },
  { id: 'txn-4', businessId: 'biz-101', businessName: 'Tech Innovators', type: 'commission', amount: 150, status: 'pending', date: new Date('2024-11-08') },
];

export const mockEscrows: Escrow[] = [
  { id: 'esc-1', campaignId: 'camp-001', campaignName: 'Summer Savings', businessId: 'biz-123', businessName: 'The Coffee Spot', amount: 1000, status: 'held', createdAt: new Date('2024-10-01') },
  { id: 'esc-2', campaignId: 'camp-002', campaignName: 'Winter Deals', businessId: 'biz-456', businessName: 'Local Threads', amount: 2500, status: 'released', createdAt: new Date('2024-09-01'), releasedAt: new Date('2024-10-01') },
  { id: 'esc-3', campaignId: 'camp-003', campaignName: 'New Year Fitness', businessId: 'biz-101', businessName: 'Tech Innovators', amount: 500, status: 'refunded', createdAt: new Date('2024-08-15'), releasedAt: new Date('2024-09-15') },
];

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  { id: 'plan-1', name: 'Starter', price: 29, features: ['Basic Analytics', '5 Campaigns/Month', 'Standard Support'], isPopular: false },
  { id: 'plan-2', name: 'Pro', price: 79, features: ['Advanced Analytics', 'Unlimited Campaigns', 'Priority Support', 'API Access'], isPopular: true },
  { id: 'plan-3', name: 'Enterprise', price: 199, features: ['All Pro Features', 'Dedicated Account Manager', 'Custom Integrations'], isPopular: false },
];

export const mockPayoutRequests: PayoutRequest[] = [
  { id: 'payout-1', businessId: 'biz-123', businessName: 'The Coffee Spot', amount: 350, status: 'pending', requestedAt: new Date('2024-11-07') },
  { id: 'payout-2', businessId: 'biz-456', businessName: 'Local Threads', amount: 1200, status: 'approved', requestedAt: new Date('2024-10-28'), processedAt: new Date('2024-11-02') },
  { id: 'payout-3', businessId: 'biz-789', businessName: 'Quick Bites', amount: 150, status: 'rejected', requestedAt: new Date('2024-10-25'), processedAt: new Date('2024-10-26') },
];

export const mockFinancialAnalytics = {
  revenueOverTime: [
    { month: 'Jan', revenue: 2500 },
    { month: 'Feb', revenue: 2800 },
    { month: 'Mar', revenue: 3200 },
    { month: 'Apr', revenue: 3000 },
    { month: 'May', revenue: 3500 },
    { month: 'Jun', revenue: 4000 },
  ],
  payoutsVsSubscriptions: [
    { name: 'Total Payouts', value: 15500 },
    { name: 'Total Subscriptions', value: 25000 },
  ],
};
