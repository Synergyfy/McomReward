import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  Tier,
  TierCreateInput,
  TierUpdateInput,
  PaymentHistoryItem,
  PointPackage,
  PointPackageCreateInput,
  PointPackageUpdateInput,
  PaginatedResponse,
  PaymentHistorySearchParams,
} from './types';


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

const getPaymentHistory = async (params: PaymentHistorySearchParams): Promise<PaginatedResponse<PaymentHistoryItem>> => {
  const { data } = await api.get<PaginatedResponse<PaymentHistoryItem>>('/payment-history', {
    params,
  });
  return data;
};

export const useGetPaymentHistory = (params: PaymentHistorySearchParams) => {
  return useQuery<PaginatedResponse<PaymentHistoryItem>, Error>({
    queryKey: [PAYMENT_HISTORY_QUERY_KEY, params],
    queryFn: () => getPaymentHistory(params),
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

// Point Packages
const POINT_PACKAGE_QUERY_KEY = 'point-packages';

// Fetch all point packages with pagination
const getPointPackages = async (page: number, limit: number): Promise<PointPackage[]> => {
  const { data } = await api.get<PaginatedResponse<PointPackage>>('/point-packages/all', {
    params: { page, limit },
  });
  // Extract the data array from the paginated response
  return data.data;
};

export const useGetPointPackages = (page: number, limit: number) => {
  return useQuery<PointPackage[], Error>({
    queryKey: [POINT_PACKAGE_QUERY_KEY, page, limit],
    queryFn: () => getPointPackages(page, limit),
  });
};

// Create a new point package
const createPointPackage = async (packageData: PointPackageCreateInput): Promise<PointPackage> => {
  const { data } = await api.post('/point-packages/admin', packageData);
  return data;
};

export const useCreatePointPackage = () => {
  const queryClient = useQueryClient();
  return useMutation<PointPackage, Error, PointPackageCreateInput>({
    mutationFn: createPointPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POINT_PACKAGE_QUERY_KEY] });
    },
  });
};

// Update an existing point package
const updatePointPackage = async ({ id, ...packageData }: PointPackageUpdateInput & { id: string }): Promise<PointPackage> => {
  const { data } = await api.patch(`/point-packages/admin/${id}`, packageData);
  return data;
};

export const useUpdatePointPackage = () => {
  const queryClient = useQueryClient();
  return useMutation<PointPackage, Error, PointPackageUpdateInput & { id: string }>({
    mutationFn: updatePointPackage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [POINT_PACKAGE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [POINT_PACKAGE_QUERY_KEY, variables.id] });
    },
  });
};

// Delete a point package
const deletePointPackage = async (id: string): Promise<void> => {
  await api.delete(`/point-packages/admin/${id}`);
};

export const useDeletePointPackage = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePointPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POINT_PACKAGE_QUERY_KEY] });
    },
  });
};