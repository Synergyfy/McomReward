import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditsRule,
  CreateCreditsRulePayload,
  UpdateCreditsRulePayload,
  CreditsBalance,
  CreditsHistoryResponse,
  AdminCreditsHistoryResponse
} from './types';
import {
  mockCreditsRules,
  mockCreditsBalance,
  mockCreditsEvents,
  mockCreditsHistory
} from '@/lib/mock-data/cashback';

export const CREDITS_RULES_QUERY_KEY = 'creditsRules';
export const CREDITS_BALANCE_QUERY_KEY = 'creditsBalance';
export const CREDITS_EVENTS_QUERY_KEY = 'creditsEvents';
export const CREDITS_HISTORY_QUERY_KEY = 'creditsHistory';
export const ADMIN_CREDITS_HISTORY_QUERY_KEY = 'adminCreditsHistory';

export const useGetCreditsRules = () => {
  return useQuery<CreditsRule[], Error>({
    queryKey: [CREDITS_RULES_QUERY_KEY],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockCreditsRules;
    },
  });
};

export const useCreateCreditsRule = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, CreateCreditsRulePayload>({
    mutationFn: async (payload) => {
      await new Promise(resolve => setTimeout(resolve, 800));
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
      await new Promise(resolve => setTimeout(resolve, 800));
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
      await new Promise(resolve => setTimeout(resolve, 800));
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
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockCreditsBalance;
    },
  });
};

export const useGetCreditsEvents = () => {
  return useQuery<string[], Error>({
    queryKey: [CREDITS_EVENTS_QUERY_KEY],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockCreditsEvents;
    },
  });
};

export const useGetCreditsHistory = (page = 1, limit = 10) => {
  return useQuery<CreditsHistoryResponse, Error>({
    queryKey: [CREDITS_HISTORY_QUERY_KEY, page, limit],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        data: (mockCreditsHistory as any[]).slice((page - 1) * limit, page * limit),
        meta: {
          total: mockCreditsHistory.length,
          page,
          limit,
          totalPages: Math.ceil(mockCreditsHistory.length / limit)
        }
      };
    },
  });
};

export const useGetAdminCreditsHistory = (page = 1, limit = 10, email?: string) => {
  return useQuery<AdminCreditsHistoryResponse, Error>({
    queryKey: [ADMIN_CREDITS_HISTORY_QUERY_KEY, page, limit, email],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
      const filtered = email
        ? mockCreditsHistory.filter(h => (h as any).wallet?.user?.email?.includes(email))
        : mockCreditsHistory;

      return {
        data: filtered.slice((page - 1) * limit, page * limit) as any,
        meta: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit)
        }
      };
    },
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
