export interface RevenueOverview {
  plaqueSales: number;
  offerRedemptions: number;
  commissions: number;
  pendingPayouts: number;
}

export interface EarningsChartData {
  name: string; // e.g., 'Jan'
  earnings: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: string; // e.g., 'Plaque Sale', 'Offer Redemption'
  amount: number;
  status: string; // e.g., 'Completed', 'Pending'
}

export interface RevenueAnalyticsResponse {
  overview: RevenueOverview;
  earningsChart: EarningsChartData[];
  transactions: Transaction[];
}

export interface RevenueQueryDto {
    businessId?: string; // For admin impersonation
    // Add other filters like timeRange if needed later
}