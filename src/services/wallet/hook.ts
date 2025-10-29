import { useQuery } from '@tanstack/react-query';
import { PaginatedPointHistory, PointHistoryRecord, Wallet } from './types';

const POINT_HISTORY_QUERY_KEY = 'pointHistory';
const WALLET_QUERY_KEY = 'wallet';

// --- Mock Data ---
const mockPointHistoryData: PointHistoryRecord[] = [
  { id: '1', timestamp: '2025-10-26T10:00:00Z', description: 'Joined Summer Bonanza', type: 'earned', points: 100, campaign: { id: '1', title: 'Summer Bonanza' } },
  { id: '2', timestamp: '2025-10-25T14:30:00Z', description: 'Redeemed: Free Coffee', type: 'spent', points: 50 },
  { id: '3', timestamp: '2025-10-24T09:00:00Z', description: 'Joined Winter Wonderland', type: 'earned', points: 150, campaign: { id: '2', title: 'Winter Wonderland Deals' } },
  { id: '4', timestamp: '2025-10-23T18:00:00Z', description: 'Admin bonus', type: 'earned', points: 20 },
  { id: '5', timestamp: '2025-10-22T11:00:00Z', description: 'Joined Loyalty Exclusive', type: 'earned', points: 200, campaign: { id: '3', title: 'Loyalty Members Exclusive' } },
  { id: '6', timestamp: '2025-10-21T16:45:00Z', description: 'Redeemed: 10% Discount', type: 'spent', points: 100 },
  { id: '11', timestamp: '2025-10-16T10:00:00Z', description: 'Welcome bonus', type: 'earned', points: 500 },
];
// --- End of Mock Data ---

// Get Wallet Balance
const getWallet = async (): Promise<Wallet> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { balance: 1250 }; // Mock data
};

export const useGetWallet = () => {
  return useQuery<Wallet, Error>({
    queryKey: [WALLET_QUERY_KEY],
    queryFn: getWallet,
  });
};

// Get Point History
const getPointHistory = async (page: number, limit: number, campaignId?: string): Promise<PaginatedPointHistory> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredData = mockPointHistoryData;
  if (campaignId) {
    filteredData = mockPointHistoryData.filter(record => record.campaign?.id === campaignId);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total: filteredData.length,
    page,
    limit,
  };
};

export const useGetPointHistory = (page: number, limit: number, campaignId?: string) => {
  return useQuery<PaginatedPointHistory, Error>({
    queryKey: [POINT_HISTORY_QUERY_KEY, page, limit, campaignId],
    queryFn: () => getPointHistory(page, limit, campaignId),
    placeholderData: (previousData) => previousData, // Useful for pagination to avoid flickering
  });
};
