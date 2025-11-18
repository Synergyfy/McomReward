import { useQuery } from '@tanstack/react-query';
import api from '../api';
import {
  TopBusiness,
  SystemOverview,
  TopReward,
  PaginatedCampaignPerformanceResponse,
} from './types';

const ANALYTICS_QUERY_KEY = 'analytics';

// Get Top Performing Businesses
const getTopBusinesses = async (): Promise<TopBusiness[]> => {
  const { data } = await api.get<TopBusiness[]>('/admin/analytics/top-businesses');
  return data;
};

export const useTopBusinesses = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'top-businesses'],
    queryFn: getTopBusinesses,
  });
};

// Get System Overview
const getSystemOverview = async (): Promise<SystemOverview> => {
  const { data } = await api.get<SystemOverview>('/admin/analytics/system-overview');
  return data;
};

export const useSystemOverview = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'system-overview'],
    queryFn: getSystemOverview,
  });
};

// Get Top Rewards
const getTopRewards = async (): Promise<TopReward[]> => {
  const { data } = await api.get<TopReward[]>('/admin/analytics/top-rewards');
  return data;
};

export const useTopRewards = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'top-rewards'],
    queryFn: getTopRewards,
  });
};

// Get Campaign Performance
export const useGetCampaignPerformance = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedCampaignPerformanceResponse, Error>({
    queryKey: [ANALYTICS_QUERY_KEY, 'campaign-performance', page, limit],
    queryFn: async () => {
      const response = await api.get('/business/campaigns/performance', {
        params: { page, limit },
      });
      return response.data;
    },
  });
};
