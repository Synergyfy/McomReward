import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import {
  CreateQrPlaqueRequest,
  UpdateQrPlaqueRequest,
  AdminUpdateQrPlaqueRequest
} from './types';
import { toast } from 'sonner';

export const QR_PLAQUES_KEY = ['qr-plaques'];
export const ADMIN_QR_PLAQUES_KEY = ['admin-qr-plaques'];

// Business Hooks

export const useGetQrPlaques = (params?: any) => {
  return useQuery({
    queryKey: [...QR_PLAQUES_KEY, params],
    queryFn: () => api.getQrPlaques(params),
  });
};

export const useGetQrPlaqueByCode = (code: string | null) => {
  return useQuery({
    queryKey: [...QR_PLAQUES_KEY, 'code', code],
    queryFn: () => api.getQrPlaqueByCode(code!),
    enabled: !!code,
  });
};

export const useCreateQrPlaque = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQrPlaqueRequest) => api.createQrPlaque(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_PLAQUES_KEY });
      toast.success('QR Plaque created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create QR Plaque');
    },
  });
};

export const useUpdateQrPlaque = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQrPlaqueRequest }) =>
      api.updateQrPlaque(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_PLAQUES_KEY });
      toast.success('QR Plaque updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update QR Plaque');
    },
  });
};

// Admin Hooks

export const useGetAdminQrPlaques = (params?: any) => {
  return useQuery({
    queryKey: [...ADMIN_QR_PLAQUES_KEY, params],
    queryFn: () => api.getAdminQrPlaques(params),
  });
};

export const useUpdateAdminQrPlaque = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateQrPlaqueRequest }) =>
      api.updateAdminQrPlaque(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QR_PLAQUES_KEY });
      toast.success('QR Plaque updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update QR Plaque');
    },
  });
};

export const useDeleteAdminQrPlaque = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAdminQrPlaque(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QR_PLAQUES_KEY });
      toast.success('QR Plaque deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete QR Plaque');
    },
  });
};
