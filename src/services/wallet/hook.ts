import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Wallet, InitiateWalletTopupResponse, VerifyWalletTopupResponse, PaginatedPointHistory } from './types';

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

// Keeping this as a placeholder or separate query if there's a dedicated history endpoint later
// For now, wallet.transactions has the data.
export const useGetPointHistory = (page: number, limit: number, campaignId?: string) => {
   // Placeholder implementation or one that fetches from a different endpoint if exists
   return useQuery<PaginatedPointHistory, Error>({
    queryKey: [POINT_HISTORY_QUERY_KEY, page, limit, campaignId],
    queryFn: async () => {
        // Mock or implement if there's a separate endpoint
         return {
            data: [],
            total: 0,
            page,
            limit,
         }
    },
    enabled: false // Disabled for now
  });
};