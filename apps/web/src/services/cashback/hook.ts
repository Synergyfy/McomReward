import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditsRule,
  CreateCreditsRulePayload,
  UpdateCreditsRulePayload,
  CreditsBalance,
  CreditsHistoryResponse,
  AdminCreditsHistoryResponse
} from './types';
import api from '../api';

export const CREDITS_RULES_QUERY_KEY = 'creditsRules';
export const CREDITS_BALANCE_QUERY_KEY = 'creditsBalance';
export const CREDITS_EVENTS_QUERY_KEY = 'creditsEvents';
export const CREDITS_HISTORY_QUERY_KEY = 'creditsHistory';
export const ADMIN_CREDITS_HISTORY_QUERY_KEY = 'adminCreditsHistory';

const fetchCreditsRules = async (): Promise<CreditsRule[]> => {
  const { data } = await api.get<CreditsRule[]>('/business/credits/rules');
  return data;
};

const createCreditsRule = async (payload: CreateCreditsRulePayload) => {
  const { data } = await api.post('/business/credits/rules', payload);
  return data;
};

const updateCreditsRule = async ({ id, ...payload }: { id: string } & UpdateCreditsRulePayload) => {
  const { data } = await api.put(`/business/credits/rules/${id}`, payload);
  return data;
};

const deleteCreditsRule = async (id: string) => {
  await api.delete(`/business/credits/rules/${id}`);
};

const fetchCreditsBalance = async (): Promise<CreditsBalance> => {
  const { data } = await api.get<CreditsBalance>('/business/credits/balance');
  return data;
};

const fetchCreditsEvents = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>('/business/credits/events');
  return data;
};

const fetchCreditsHistory = async (page = 1, limit = 10): Promise<CreditsHistoryResponse> => {
  const { data } = await api.get<CreditsHistoryResponse>('/business/credits/history', {
    params: { page, limit },
  });
  return data;
};

const fetchAdminCreditsHistory = async (page = 1, limit = 10, email?: string): Promise<AdminCreditsHistoryResponse> => {
  const { data } = await api.get<AdminCreditsHistoryResponse>('/admin/credits/history', {
    params: { page, limit, email },
  });
  return data;
};

export const useGetCreditsRules = () => {
  return useQuery<CreditsRule[], Error>({
    queryKey: [CREDITS_RULES_QUERY_KEY],
    queryFn: fetchCreditsRules,
  });
};

export const useCreateCreditsRule = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, CreateCreditsRulePayload>({
    mutationFn: async (payload) => {
      await createCreditsRule(payload);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CREDITS_RULES_QUERY_KEY] });
    },
  });
};

export const useUpdateCreditsRule = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, { id: string } & UpdateCreditsRulePayload>({
    mutationFn: async ({ id, ...payload }) => {
      await updateCreditsRule({ id, ...payload });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CREDITS_RULES_QUERY_KEY] });
    },
  });
};

export const useDeleteCreditsRule = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      await deleteCreditsRule(id);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CREDITS_RULES_QUERY_KEY] });
    },
  });
};

export const useGetCreditsBalance = () => {
  return useQuery<CreditsBalance, Error>({
    queryKey: [CREDITS_BALANCE_QUERY_KEY],
    queryFn: fetchCreditsBalance,
  });
};

export const useGetCreditsEvents = () => {
  return useQuery<string[], Error>({
    queryKey: [CREDITS_EVENTS_QUERY_KEY],
    queryFn: fetchCreditsEvents,
  });
};

export const useGetCreditsHistory = (page = 1, limit = 10) => {
  return useQuery<CreditsHistoryResponse, Error>({
    queryKey: [CREDITS_HISTORY_QUERY_KEY, page, limit],
    queryFn: () => fetchCreditsHistory(page, limit),
  });
};

export const useGetAdminCreditsHistory = (page = 1, limit = 10, email?: string) => {
  return useQuery<AdminCreditsHistoryResponse, Error>({
    queryKey: [ADMIN_CREDITS_HISTORY_QUERY_KEY, page, limit, email],
    queryFn: () => fetchAdminCreditsHistory(page, limit, email),
  });
};

// Backwards compatibility aliases
export const useGetCashbackBalance = useGetCreditsBalance;
export const useGetCashbackRules = useGetCreditsRules;
export const useGetCashbackHistory = useGetCreditsHistory;
export const useGetAdminCashbackHistory = useGetAdminCreditsHistory;
export const useCreateCashbackRule = useCreateCreditsRule;
export const useUpdateCashbackRule = useUpdateCreditsRule;
export const useDeleteCashbackRule = useDeleteCreditsRule;
export const useGetCashbackEvents = useGetCreditsEvents;
