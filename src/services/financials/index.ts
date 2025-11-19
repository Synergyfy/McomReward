
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Tier, TierCreateInput, TierUpdateInput, PaymentHistoryItem } from './types';


const TIER_QUERY_KEY = 'tiers';

// Fetch all tiers
const getTiers = async (): Promise<Tier[]> => {
  const { data } = await api.get('/tier');
  return data;
};

export const useGetTiers = () => {
  return useQuery<Tier[], Error>({
    queryKey: [TIER_QUERY_KEY],
    queryFn: getTiers,
  });
};

// Payment history
const PAYMENT_HISTORY_QUERY_KEY = 'payment-history';

const getPaymentHistory = async (): Promise<PaymentHistoryItem[]> => {
  const { data } = await api.get('/payment-history');
  return data;
};

export const useGetPaymentHistory = () => {
  return useQuery<PaymentHistoryItem[], Error>({
    queryKey: [PAYMENT_HISTORY_QUERY_KEY],
    queryFn: getPaymentHistory,
  });
};

// Create a new tier
const createTier = async (tierData: TierCreateInput): Promise<Tier> => {
  const { data } = await api.post('/tier', tierData);
  return data;
};

export const useCreateTier = () => {
  const queryClient = useQueryClient();
  return useMutation<Tier, Error, TierCreateInput>({
    mutationFn: createTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEY] });
    },
  });
};

// Update an existing tier
const updateTier = async ({ id, ...tierData }: TierUpdateInput & { id: string }): Promise<Tier> => {
  const { data } = await api.patch(`/tier/${id}`, tierData);
  return data;
};

export const useUpdateTier = () => {
  const queryClient = useQueryClient();
  return useMutation<Tier, Error, TierUpdateInput & { id: string }>({
    mutationFn: updateTier,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEY, variables.id] });
    },
  });
};

// Delete a tier
const deleteTier = async (id: string): Promise<void> => {
  await api.delete(`/tier/${id}`);
};

export const useDeleteTier = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEY] });
    },
  });
};
