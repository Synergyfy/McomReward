import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Wallet, InitiateWalletTopupResponse, VerifyWalletTopupResponse, PaginatedPointHistory, PointHistoryRecord } from './types';

const WALLET_QUERY_KEY = 'wallet';
const POINT_HISTORY_QUERY_KEY = 'pointHistory';

export const useGetWallet = () => {
  return useQuery<Wallet, Error>({
    queryKey: [WALLET_QUERY_KEY],
    queryFn: async () => {
      const { data } = await api.get('/wallet/my-balance');
      return data;
    },
  });
};

export const useInitiateWalletTopup = () => {
  return useMutation<InitiateWalletTopupResponse, Error, { amount: number; provider: 'stripe' | 'paypal' }>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/payment/wallet/initiate', payload);
      return data;
    },
  });
};

export const useVerifyWalletTopup = () => {
  const queryClient = useQueryClient();
  return useMutation<VerifyWalletTopupResponse, Error, { transaction_id: string; provider: 'stripe' | 'paypal' }>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/payment/wallet/verify', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WALLET_QUERY_KEY] });
    },
  });
};

// Point history — backed by the participant-campaign-balance history endpoints.
const POINT_HISTORY_TYPES = ['EARN', 'REDEEM', 'MATCHING', 'PURCHASED_EXTRA', 'STAMP_EARN', 'STAMP_REDEEM'] as const;
type PointHistoryApiType = typeof POINT_HISTORY_TYPES[number];

interface PointHistoryApiItem {
  id: string;
  type: PointHistoryApiType;
  points: number;
  description: string;
  created_at: string;
  createdAt?: string;
  campaign?: { id: string; name: string } | null;
  reward?: { title: string } | null;
  business?: { name: string } | null;
}

interface PointHistoryApiResponse {
  data: PointHistoryApiItem[];
  total: number;
  page: number;
  limit: number;
}

const mapPointHistoryItem = (item: PointHistoryApiItem): PointHistoryRecord => {
  let type: PointHistoryRecord['type'] = 'earned';
  if (item.type === 'REDEEM' || item.type === 'STAMP_REDEEM') {
    type = 'spent';
  } else if (item.type === 'PURCHASED_EXTRA') {
    type = 'purchase';
  }
  const description =
    item.description ||
    item.reward?.title ||
    item.campaign?.name ||
    item.business?.name ||
    'Points transaction';
  return {
    id: item.id,
    points: item.points,
    type,
    description,
    timestamp: item.created_at || item.createdAt || new Date().toISOString(),
    campaign: item.campaign
      ? { id: item.campaign.id, title: item.campaign.name }
      : undefined,
  };
};

export const useGetPointHistory = (page: number, limit: number, campaignId?: string) => {
  return useQuery<PaginatedPointHistory, Error>({
    queryKey: [POINT_HISTORY_QUERY_KEY, page, limit, campaignId],
    queryFn: async () => {
      const url = campaignId
        ? `/participant-campaign-balance/history/${campaignId}`
        : '/participant-campaign-balance/history';
      const { data } = await api.get<PointHistoryApiResponse>(url, {
        params: { page, limit },
      });
      return {
        data: data.data.map(mapPointHistoryItem),
        total: data.total,
        page: data.page,
        limit: data.limit,
      };
    },
  });
};