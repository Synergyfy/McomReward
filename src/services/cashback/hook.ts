import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  CashbackRule,
  CreateCashbackRulePayload,
  UpdateCashbackRulePayload,
  CashbackBalance,
  CashbackEvent,
  CashbackHistoryResponse,
  AdminCashbackHistoryResponse
} from './types';

export const CASHBACK_RULES_QUERY_KEY = 'cashbackRules';
export const CASHBACK_BALANCE_QUERY_KEY = 'cashbackBalance';
export const CASHBACK_EVENTS_QUERY_KEY = 'cashbackEvents';
export const CASHBACK_HISTORY_QUERY_KEY = 'cashbackHistory';
export const ADMIN_CASHBACK_HISTORY_QUERY_KEY = 'adminCashbackHistory';

export const useGetCashbackRules = () => {
  return useQuery<CashbackRule[], Error>({
    queryKey: [CASHBACK_RULES_QUERY_KEY],
    queryFn: async () => {
      const { data } = await api.get('/cashback/rules');
      return data;
    },
  });
};

export const useCreateCashbackRule = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, CreateCashbackRulePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/cashback/rules', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASHBACK_RULES_QUERY_KEY] });
    },
  });
};

export const useUpdateCashbackRule = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, { id: string } & UpdateCashbackRulePayload>({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch(`/cashback/rules/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASHBACK_RULES_QUERY_KEY] });
    },
  });
};

export const useDeleteCashbackRule = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/cashback/rules/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASHBACK_RULES_QUERY_KEY] });
    },
  });
};

export const useGetCashbackBalance = () => {
  return useQuery<CashbackBalance, Error>({
    queryKey: [CASHBACK_BALANCE_QUERY_KEY],
    queryFn: async () => {
      const { data } = await api.get('/cashback/balance');
      return data;
    },
  });
};

export const useGetCashbackEvents = () => {
  return useQuery<CashbackEvent[], Error>({
    queryKey: [CASHBACK_EVENTS_QUERY_KEY],
    queryFn: async () => {
      const { data } = await api.get('/cashback/events');
      return data;
    },
  });
};

export const useGetCashbackHistory = (page = 1, limit = 10) => {
  return useQuery<CashbackHistoryResponse, Error>({
    queryKey: [CASHBACK_HISTORY_QUERY_KEY, page, limit],
    queryFn: async () => {
      const { data } = await api.get('/cashback/history', {
        params: { page, limit }
      });
      return data;
    },
  });
};

export const useGetAdminCashbackHistory = (page = 1, limit = 10, email?: string) => {
  return useQuery<AdminCashbackHistoryResponse, Error>({
    queryKey: [ADMIN_CASHBACK_HISTORY_QUERY_KEY, page, limit, email],
    queryFn: async () => {
      const { data } = await api.get('/cashback/admin/history', {
        params: { page, limit, email }
      });
      return data;
    },
  });
};
