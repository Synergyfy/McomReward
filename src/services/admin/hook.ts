import api from '../api';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AdminParticipant, AdminBusiness, PaginatedResponse } from './types';

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
