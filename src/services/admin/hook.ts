import api from '../api';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AdminParticipant, AdminBusiness, PaginatedResponse, AdminBusinessDetails } from './types';
import type { ParticipantHistoryItem, MyCampaign } from '../customer-campaigns/types';
import { GetMallRewardHistoryResponse } from '../business-reward/types';
import { WishlistItem } from '../wishlist/types';
import { ConsumerStampCard, DiscoverableStampReward, StampStats } from '../consumer-stamp-rewards/types';

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

const getAdminParticipantHistory = async (id: string, page = 1, limit = 10, historyType: 'both' | 'points' | 'stamps' = 'both'): Promise<PaginatedResponse<ParticipantHistoryItem>> => {
    const { data } = await api.get<PaginatedResponse<ParticipantHistoryItem>>(`/admin/participants/${id}/history`, {
        params: { page, limit, type: historyType }
    });
    return data;
}

export const useAdminParticipantHistory = (id: string, page = 1, limit = 10, historyType: 'both' | 'points' | 'stamps' = 'both') => {
    return useQuery<PaginatedResponse<ParticipantHistoryItem>>({
        queryKey: ['admin-participant-history', id, page, limit, historyType],
        queryFn: () => getAdminParticipantHistory(id, page, limit, historyType),
        enabled: !!id,
        placeholderData: keepPreviousData,
    });
};

// Admin Participant Sub-resources

// Mall Rewards
const getAdminParticipantMallRewards = async (id: string, page = 1, limit = 10): Promise<GetMallRewardHistoryResponse> => {
    const { data } = await api.get<GetMallRewardHistoryResponse>(`/admin/participants/${id}/mall-rewards`, {
        params: { page, limit }
    });
    return data;
};

export const useAdminParticipantMallRewards = (id: string, page = 1, limit = 10) => {
    return useQuery<GetMallRewardHistoryResponse>({
        queryKey: ['admin-participant-mall-rewards', id, page, limit],
        queryFn: () => getAdminParticipantMallRewards(id, page, limit),
        enabled: !!id,
        placeholderData: keepPreviousData,
    });
};

// Campaigns
const getAdminParticipantCampaigns = async (id: string, page = 1, limit = 10): Promise<PaginatedResponse<MyCampaign>> => {
    const { data } = await api.get<PaginatedResponse<MyCampaign>>(`/admin/participants/${id}/campaigns`, {
        params: { page, limit }
    });
    return data;
};

export const useAdminParticipantCampaigns = (id: string, page = 1, limit = 10) => {
    return useQuery<PaginatedResponse<MyCampaign>>({
        queryKey: ['admin-participant-campaigns', id, page, limit],
        queryFn: () => getAdminParticipantCampaigns(id, page, limit),
        enabled: !!id,
        placeholderData: keepPreviousData,
    });
};

// Wishlist
const getAdminParticipantWishlist = async (id: string, page = 1, limit = 10): Promise<PaginatedResponse<WishlistItem>> => {
    const { data } = await api.get<PaginatedResponse<WishlistItem>>(`/admin/participants/${id}/wishlist`, {
        params: { page, limit }
    });
    return data;
};

export const useAdminParticipantWishlist = (id: string, page = 1, limit = 10) => {
    return useQuery<PaginatedResponse<WishlistItem>>({
        queryKey: ['admin-participant-wishlist', id, page, limit],
        queryFn: () => getAdminParticipantWishlist(id, page, limit),
        enabled: !!id,
        placeholderData: keepPreviousData,
    });
};

// Stamp Cards
const getAdminParticipantStampCards = async (id: string, status?: 'in_progress' | 'completed' | 'redeemed' | 'all', page = 1, limit = 10): Promise<PaginatedResponse<ConsumerStampCard>> => {
    const { data } = await api.get<PaginatedResponse<ConsumerStampCard>>(`/admin/participants/${id}/stamp-cards`, {
        params: { status, page, limit }
    });
    return data;
};

export const useAdminParticipantStampCards = (id: string, status?: 'in_progress' | 'completed' | 'redeemed' | 'all', page = 1, limit = 10) => {
    return useQuery<PaginatedResponse<ConsumerStampCard>>({
        queryKey: ['admin-participant-stamp-cards', id, status, page, limit],
        queryFn: () => getAdminParticipantStampCards(id, status, page, limit),
        enabled: !!id,
        placeholderData: keepPreviousData,
    });
};

// Stamp Stats
const getAdminParticipantStampStats = async (id: string): Promise<StampStats> => {
    const { data } = await api.get<StampStats>(`/admin/participants/${id}/stamp-stats`);
    return data;
};

export const useAdminParticipantStampStats = (id: string) => {
    return useQuery<StampStats>({
        queryKey: ['admin-participant-stamp-stats', id],
        queryFn: () => getAdminParticipantStampStats(id),
        enabled: !!id,
    });
};

// Discoverable Rewards (Assuming this is global, but maybe context aware)
// For now we will use the same endpoint as customer but mocked if needed, or if admin has a specific one.
// Let's assume Admin just sees what's available globally or if there is an admin endpoint.
// Given strict patterns, let's try `/admin/participants/${id}/discoverable-stamp-rewards`
const getAdminDiscoverableStampRewards = async (id: string): Promise<DiscoverableStampReward[]> => {
    const { data } = await api.get<DiscoverableStampReward[]>(`/admin/participants/${id}/discoverable-stamp-rewards`);
    return data;
};

export const useAdminDiscoverableStampRewards = (id: string) => {
    return useQuery<DiscoverableStampReward[]>({
        queryKey: ['admin-discoverable-stamp-rewards', id],
        queryFn: () => getAdminDiscoverableStampRewards(id),
        enabled: !!id,
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
