import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { CashbackRule, CreateCashbackRulePayload, UpdateCashbackRulePayload, CashbackBalance } from './types';

export const CASHBACK_RULES_QUERY_KEY = 'cashbackRules';
export const CASHBACK_BALANCE_QUERY_KEY = 'cashbackBalance';

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
