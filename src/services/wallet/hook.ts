import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { PaginatedPointHistory, Wallet } from './types';

const WALLET_QUERY_KEY = 'wallet';
const POINT_HISTORY_QUERY_KEY = 'pointHistory';

// Get Wallet Balance
const getWallet = async (): Promise<Wallet> => {
  const { data } = await api.get<Wallet>('/wallet');
  return data;
};

export const useGetWallet = () => {
  return useQuery({
    queryKey: [WALLET_QUERY_KEY],
    queryFn: getWallet,
  });
};

// Get Point History
const getPointHistory = async (page: number, limit: number, campaignId?: string): Promise<PaginatedPointHistory> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (campaignId) {
    params.append('campaignId', campaignId);
  }
  const { data } = await api.get<PaginatedPointHistory>(`/wallet/history?${params.toString()}`);
  return data;
};

export const useGetPointHistory = (page: number, limit: number, campaignId?: string) => {
  return useQuery({
    queryKey: [POINT_HISTORY_QUERY_KEY, page, limit, campaignId],
    queryFn: () => getPointHistory(page, limit, campaignId),
    placeholderData: (previousData) => previousData, // Useful for pagination to avoid flickering
  });
};
