import api from '@/services/api';
import {
  QrPlaque,
  CreateQrPlaqueRequest,
  UpdateQrPlaqueRequest,
  AdminUpdateQrPlaqueRequest
} from './types';

// Helper to serialize params without brackets for arrays: status=A&status=B
const paramsSerializer = (params: any) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v));
    } else {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

// Shared Endpoints

export const createQrPlaque = async (data: CreateQrPlaqueRequest): Promise<QrPlaque> => {
  const response = await api.post('/qr-plaques', data);
  return response.data;
};

// Business Endpoints

export const getQrPlaques = async (params?: any): Promise<QrPlaque[]> => {
  const response = await api.get('/qr-plaques', {
    params,
    paramsSerializer: (p) => paramsSerializer(p)
  });
  return response.data;
};

export const updateQrPlaque = async (id: string, data: UpdateQrPlaqueRequest): Promise<QrPlaque> => {
  const response = await api.patch(`/qr-plaques/${id}`, data);
  return response.data;
};

export const getQrPlaqueByCode = async (code: string): Promise<QrPlaque> => {
  const response = await api.get(`/qr-plaques/${code}`);
  return response.data;
};

// Admin Endpoints

export const getAdminQrPlaques = async (params?: any): Promise<QrPlaque[]> => {
  const response = await api.get('/qr-plaques/admin/list', {
    params,
    paramsSerializer: (p) => paramsSerializer(p)
  });
  return response.data;
};

// Admin Create uses the shared POST /qr-plaques
export const createAdminQrPlaque = async (data: CreateQrPlaqueRequest): Promise<QrPlaque> => {
    const response = await api.post('/qr-plaques', data);
    return response.data;
};

export const updateAdminQrPlaque = async (id: string, data: AdminUpdateQrPlaqueRequest): Promise<QrPlaque> => {
  const response = await api.patch(`/qr-plaques/admin/${id}`, data);
  return response.data;
};

export const deleteAdminQrPlaque = async (id: string): Promise<void> => {
  await api.delete(`/qr-plaques/admin/${id}`);
};
