import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  PlaqueSale,
  CreatePlaqueSaleDto,
  GetSalesParams,
  PaginatedSalesResponse,
  SalesAnalytics,
  PayoutStatus,
} from './types';

const SALES_QUERY_KEY = 'adminSales';

const mapSale = (item: any): PlaqueSale => ({
  id: item.id,
  plaqueId: item.plaque_id ?? item.plaqueId,
  plaqueName: item.plaque_name ?? item.plaqueName,
  sellerId: item.seller_id ?? item.sellerId,
  sellerName: item.seller_name ?? item.sellerName,
  buyerId: item.buyer_id ?? item.buyerId,
  buyerName: item.buyer_name ?? item.buyerName,
  saleDate: item.sale_date ?? item.saleDate ?? item.created_at,
  salePrice: Number(item.sale_price ?? item.salePrice ?? 0),
  commissionPercentage: Number(item.commission_percentage ?? item.commissionPercentage ?? 0),
  commissionAmount: Number(item.commission_amount ?? item.commissionAmount ?? 0),
  payoutStatus: item.payout_status ?? item.payoutStatus,
  status: item.status,
});

export const useGetAdminSales = (params: GetSalesParams) => {
  return useQuery({
    queryKey: [SALES_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedSalesResponse>('/admin/sales', { params });
      return { ...data, data: (data.data ?? []).map(mapSale) };
    },
  });
};

export const useGetAdminSalesAnalytics = () => {
  return useQuery({
    queryKey: [SALES_QUERY_KEY, 'analytics'],
    queryFn: async () => {
      const { data } = await api.get<SalesAnalytics>('/admin/sales/analytics');
      return data;
    },
  });
};

export const useGetSaleById = (id: string) => {
  return useQuery({
    queryKey: [SALES_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<PlaqueSale>(`/admin/sales/${id}`);
      return mapSale(data);
    },
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePlaqueSaleDto) => {
      const { data } = await api.post<PlaqueSale>('/admin/sales', payload);
      return mapSale(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_QUERY_KEY] });
    },
  });
};

export const useMarkSalePaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payoutStatus }: { id: string; payoutStatus: PayoutStatus }) => {
      const { data } = await api.patch<PlaqueSale>(`/admin/sales/${id}/payout`, { payoutStatus });
      return mapSale(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_QUERY_KEY] });
    },
  });
};