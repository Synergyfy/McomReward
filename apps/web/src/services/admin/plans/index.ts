import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

export interface AdminPlanPrice {
  id: string;
  amount: number;
  currency: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface AdminPlanVariant {
  id: string;
  tierLevel?: {
    id: string;
    name: 'STANDARD' | 'PRO' | 'PRO_PLUS' | string;
    sortOrder: number;
    durationDays?: number | null;
    isCalendarYear: boolean;
  };
  isActive: boolean;
  features: string[];
  configuration: {
    quotas?: Record<string, number | boolean>;
    featureFlags?: Record<string, boolean>;
    [key: string]: any;
  };
  prices: AdminPlanPrice[];
}

export interface AdminPlan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  variants: AdminPlanVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanPayload {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  variants: {
    tier: 'STANDARD' | 'PRO' | 'PRO_PLUS';
    price: number;
    features: string[];
    configuration: {
      quotas: Record<string, any>;
      featureFlags: Record<string, boolean>;
    };
  }[];
}

export interface AddPricePayload {
  variantId: string;
  amount: number;
  currency?: string;
}

export interface UpdatePlanPayload {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  variants?: CreatePlanPayload['variants'];
}

const ADMIN_PLANS_KEY = 'admin-plans';

export const getAdminPlans = async (): Promise<AdminPlan[]> => {
  const { data } = await api.get<AdminPlan[]>('/plans/admin');
  return data;
};

export const useGetAdminPlans = () => {
  return useQuery({
    queryKey: [ADMIN_PLANS_KEY],
    queryFn: getAdminPlans,
  });
};

export const getAdminPlan = async (id: string): Promise<AdminPlan> => {
  const { data } = await api.get<AdminPlan>(`/plans/${id}`);
  return data;
};

export const useGetAdminPlan = (id?: string) => {
  return useQuery({
    queryKey: [ADMIN_PLANS_KEY, id],
    queryFn: () => getAdminPlan(id as string),
    enabled: Boolean(id),
  });
};

export const getPlanSchema = async () => {
  const { data } = await api.get('/plans/schema');
  return data;
};

export const useGetPlanSchema = () => {
  return useQuery({
    queryKey: ['plan-schema'],
    queryFn: getPlanSchema,
  });
};

export const createPlan = async (payload: CreatePlanPayload): Promise<AdminPlan> => {
  const { data } = await api.post<AdminPlan>('/plans', payload);
  return data;
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PLANS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['mcom-packages'] });
    },
  });
};

export const updatePlan = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePlanPayload;
}): Promise<AdminPlan> => {
  const { data } = await api.patch<AdminPlan>(`/plans/${id}`, payload);
  return data;
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlan,
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PLANS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PLANS_KEY, plan?.id] });
      queryClient.invalidateQueries({ queryKey: ['mcom-packages'] });
    },
  });
};

export const addVariantPrice = async ({
  variantId,
  amount,
  currency,
}: AddPricePayload) => {
  const { data } = await api.post(`/plans/variants/${variantId}/prices`, {
    amount,
    currency,
  });
  return data;
};

export const useAddVariantPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addVariantPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PLANS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['mcom-packages'] });
    },
  });
};

export const deletePlan = async (id: string) => {
  const { data } = await api.delete(`/plans/${id}`);
  return data;
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PLANS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['mcom-packages'] });
    },
  });
};
