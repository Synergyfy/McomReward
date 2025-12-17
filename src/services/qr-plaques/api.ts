import api from '@/services/api';
import {
  QrPlaque,
  CreateQrPlaqueRequest,
  UpdateQrPlaqueRequest,
  AdminUpdateQrPlaqueRequest
} from './types';

// Business Endpoints

export const createQrPlaque = async (data: CreateQrPlaqueRequest): Promise<QrPlaque> => {
  const response = await api.post('/qr-plaques', data);
  return response.data;
};

export const getQrPlaques = async (params?: any): Promise<QrPlaque[]> => {
  const response = await api.get('/qr-plaques', { params });
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
  const response = await api.get('/qr-plaques/admin/list', { params });
  return response.data;
};

export const createAdminQrPlaque = async (data: AdminUpdateQrPlaqueRequest): Promise<QrPlaque> => {
    // Assuming a specific admin create endpoint or using the general admin endpoint
    // "POST /api/v1/qr-plaques/admin" (implied pattern)
    // Or reusing Business POST but with admin credentials (unlikely to allow extra fields)
    // Using implied "POST /api/v1/qr-plaques/admin" based on "DELETE /api/v1/qr-plaques/admin/{id}" pattern
    const response = await api.post('/qr-plaques/admin', data);
    return response.data;
};

export const updateAdminQrPlaque = async (id: string, data: AdminUpdateQrPlaqueRequest): Promise<QrPlaque> => {
  const response = await api.patch(`/qr-plaques/admin/${id}`, data);
  return response.data;
};

export const deleteAdminQrPlaque = async (id: string): Promise<void> => {
  await api.delete(`/qr-plaques/admin/${id}`);
};
