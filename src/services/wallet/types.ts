export interface Wallet {
  balance: number;
}

export interface PointHistoryRecord {
  id: string;
  points: number;
  type: 'earned' | 'spent';
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
