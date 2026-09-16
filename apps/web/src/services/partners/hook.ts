import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  Partner,
  CreatePartnerDto,
  UpdatePartnerDto,
  GetPartnersParams,
  PartnersResponse,
  PartnerStatus,
} from './types';

const PARTNERS_QUERY_KEY = 'adminPartners';

const mapPartner = (item: any): Partner => ({
  id: item.id,
  name: item.name,
  type: item.type,
  status: item.status,
  brandingPermissions: {
    logo: item.branding_logo ?? item.brandingLogo ?? false,
    colors: item.branding_colors ?? item.brandingColors ?? false,
    textLock: item.branding_text_lock ?? item.brandingTextLock ?? false,
  },
  subdomain: item.subdomain,
  domainRouting: item.domain_routing ?? item.domainRouting ?? undefined,
  revenueSharing: item.revenue_sharing ?? item.revenueSharing ?? '',
  performanceMetrics:
    item.performance_total_users != null ||
    item.performance_total_rewards_claimed != null ||
    item.performance_revenue_generated != null
      ? {
          totalUsers: Number(item.performance_total_users ?? 0),
          totalRewardsClaimed: Number(item.performance_total_rewards_claimed ?? 0),
          revenueGenerated: Number(item.performance_revenue_generated ?? 0),
        }
      : undefined,
  createdAt: new Date(item.created_at ?? item.createdAt ?? new Date()),
  updatedAt: new Date(item.updated_at ?? item.updatedAt ?? new Date()),
});

export const useGetAdminPartners = (params: GetPartnersParams) => {
  return useQuery({
    queryKey: [PARTNERS_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<PartnersResponse>('/admin/partners', { params });
      return {
        ...data,
        data: (data.data ?? []).map(mapPartner),
      };
    },
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePartnerDto) => {
      const { data } = await api.post<Partner>('/admin/partners', payload);
      return mapPartner(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTNERS_QUERY_KEY] });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePartnerDto & { id: string }) => {
      const { data } = await api.patch<Partner>(`/admin/partners/${id}`, payload);
      return mapPartner(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTNERS_QUERY_KEY] });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTNERS_QUERY_KEY] });
    },
  });
};

export const useTogglePartnerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PartnerStatus }) => {
      const { data } = await api.patch<Partner>(`/admin/partners/${id}/status`, { status });
      return mapPartner(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTNERS_QUERY_KEY] });
    },
  });
};