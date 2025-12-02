import api from '../api';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AdminParticipant, AdminBusiness, PaginatedResponse, AdminBusinessDetails } from './types';
import type { ParticipantHistoryItem } from '../customer-campaigns/types';

// Admin Participants
const getAdminParticipants = async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<AdminParticipant>> => {
  const params: Record<string, string | number> = { page, limit };
  if (search) {
    params.search = search;
  }

  const { data } = await api.get<PaginatedResponse<AdminParticipant>>('/admin/participants', {
    params,
  });
  return data;
};

export const useAdminParticipants = (page = 1, limit = 10, search = '') => {
  return useQuery<PaginatedResponse<AdminParticipant>>({
    queryKey: ['admin-participants', page, limit, search],
    queryFn: () => getAdminParticipants(page, limit, search),
    placeholderData: keepPreviousData,
  });
};

const getAdminParticipantDetails = async (id: string): Promise<AdminParticipant> => {
    const { data } = await api.get<AdminParticipant>(`/admin/participants/${id}`);
    return data;
}

export const useAdminParticipantDetails = (id: string) => {
    return useQuery<AdminParticipant>({
        queryKey: ['admin-participant', id],
        queryFn: () => getAdminParticipantDetails(id),
        enabled: !!id,
    });
};

const getAdminParticipantHistory = async (id: string, page = 1, limit = 10): Promise<PaginatedResponse<ParticipantHistoryItem>> => {
    const { data } = await api.get<PaginatedResponse<ParticipantHistoryItem>>(`/admin/participants/${id}/history`, {
        params: { page, limit }
    });
    return data;
}

export const useAdminParticipantHistory = (id: string, page = 1, limit = 10) => {
    return useQuery<PaginatedResponse<ParticipantHistoryItem>>({
        queryKey: ['admin-participant-history', id, page, limit],
        queryFn: () => getAdminParticipantHistory(id, page, limit),
        enabled: !!id,
        placeholderData: keepPreviousData,
    });
};

// Admin Businesses
const getAdminBusinesses = async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<AdminBusiness>> => {
  const params: Record<string, string | number> = { page, limit };
  if (search) {
    params.search = search;
  }

  const { data } = await api.get<PaginatedResponse<AdminBusiness>>('/admin/businesses', {
    params,
  });
  return data;
};

export const useAdminBusinesses = (page = 1, limit = 10, search = '') => {
  return useQuery<PaginatedResponse<AdminBusiness>>({
    queryKey: ['admin-businesses', page, limit, search],
    queryFn: () => getAdminBusinesses(page, limit, search),
    placeholderData: keepPreviousData,
  });
};

// Get a single Admin Business by ID
const getAdminBusinessById = async (id: string): Promise<AdminBusinessDetails> => {
  const { data } = await api.get<AdminBusinessDetails>(`/admin/businesses/${id}`);
  return data;
};

export const useAdminBusinessById = (id: string | null) => {
  return useQuery<AdminBusinessDetails>({
    queryKey: ['admin-business', id],
    queryFn: () => getAdminBusinessById(id!),
    enabled: !!id, // Only run query if id is not null
  });
};
