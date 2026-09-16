import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  Escrow,
  PayoutRequest,
  FinancialAnalytics,
  PaginatedFinancialsResponse,
} from './admin-types';

const FINANCIALS_QUERY_KEY = 'adminFinancials';

const mapEscrow = (item: any): Escrow => ({
  id: item.id,
  campaignId: item.campaign_id ?? item.campaignId,
  campaignName: item.campaign_name ?? item.campaignName,
  businessId: item.business_id ?? item.businessId,
  businessName: item.business_name ?? item.businessName,
  amount: Number(item.amount ?? 0),
  status: item.status,
  createdAt: new Date(item.created_at ?? item.createdAt ?? new Date()),
  releasedAt: item.released_at ?? item.releasedAt ? new Date(item.released_at ?? item.releasedAt) : undefined,
});

const mapPayout = (item: any): PayoutRequest => ({
  id: item.id,
  businessId: item.business_id ?? item.businessId,
  businessName: item.business_name ?? item.businessName,
  amount: Number(item.amount ?? 0),
  status: item.status,
  requestedAt: new Date(item.requested_at ?? item.requestedAt ?? new Date()),
  processedAt: item.processed_at ?? item.processedAt ? new Date(item.processed_at ?? item.processedAt) : undefined,
});

export const useGetEscrows = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: [FINANCIALS_QUERY_KEY, 'escrows', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedFinancialsResponse<Escrow>>('/admin/financials/escrows', { params });
      return { ...data, data: (data.data ?? []).map(mapEscrow) };
    },
  });
};

export const useUpdateEscrowStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'release' | 'refund' }) => {
      const { data } = await api.patch<Escrow>(`/admin/financials/escrows/${id}/${action}`);
      return mapEscrow(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FINANCIALS_QUERY_KEY, 'escrows'] });
    },
  });
};

export const useGetPayoutRequests = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: [FINANCIALS_QUERY_KEY, 'payouts', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedFinancialsResponse<PayoutRequest>>('/admin/financials/payout-requests', { params });
      return { ...data, data: (data.data ?? []).map(mapPayout) };
    },
  });
};

export const useUpdatePayoutStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      const { data } = await api.patch<PayoutRequest>(`/admin/financials/payout-requests/${id}/${action}`);
      return mapPayout(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FINANCIALS_QUERY_KEY, 'payouts'] });
    },
  });
};

export const useGetFinancialAnalytics = () => {
  return useQuery({
    queryKey: [FINANCIALS_QUERY_KEY, 'analytics'],
    queryFn: async () => {
      const { data } = await api.get<FinancialAnalytics>('/admin/financials/analytics');
      return data;
    },
  });
};