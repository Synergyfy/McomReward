import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  CreateDealDto,
  Deal,
  DeactivateDealDto,
  FilterDealDto,
  PaginatedDealsResponse,
  UpdateDealDto,
} from './types';

const DEALS_QUERY_KEY = 'deals';

const createDeal = async (dealData: CreateDealDto): Promise<Deal> => {
  const { data } = await api.post<Deal>('/deals', dealData);
  return data;
};

const getDeals = async (
  params: FilterDealDto,
): Promise<PaginatedDealsResponse> => {
  const { data } = await api.get<PaginatedDealsResponse>('/deals', { params });
  return data;
};

const getDeal = async (id: string): Promise<Deal> => {
  const { data } = await api.get<Deal>(`/deals/${id}`);
  return data;
};

const updateDeal = async ({
  id,
  ...dealData
}: UpdateDealDto & { id: string }): Promise<Deal> => {
  const { data } = await api.patch<Deal>(`/deals/${id}`, dealData);
  return data;
};

const deleteDeal = async (id: string): Promise<void> => {
  await api.delete(`/deals/${id}`);
};

const deactivateDeal = async ({
  id,
  ...dealData
}: DeactivateDealDto & { id: string }): Promise<Deal> => {
  const { data } = await api.patch<Deal>(`/deals/${id}/deactivate`, dealData);
  return data;
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEALS_QUERY_KEY] });
    },
  });
};

export const useGetDeals = (params: FilterDealDto) => {
  return useQuery({
    queryKey: [DEALS_QUERY_KEY, params],
    queryFn: () => getDeals(params),
  });
};

export const useGetDeal = (id: string) => {
  return useQuery({
    queryKey: [DEALS_QUERY_KEY, id],
    queryFn: () => getDeal(id),
    enabled: !!id,
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDeal,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [DEALS_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: [DEALS_QUERY_KEY] });
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEALS_QUERY_KEY] });
    },
  });
};

export const useDeactivateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateDeal,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [DEALS_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: [DEALS_QUERY_KEY] });
    },
  });
};
