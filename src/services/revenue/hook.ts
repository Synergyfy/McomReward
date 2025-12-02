import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { RevenueAnalyticsResponse, RevenueQueryDto } from './types';

const REVENUE_ANALYTICS_QUERY_KEY = 'revenueAnalytics';

const fetchRevenueAnalytics = async (params: RevenueQueryDto): Promise<RevenueAnalyticsResponse> => {
  // Assuming a single API endpoint that returns all revenue analytics data
  // The actual endpoint might be different, or require multiple calls
  const { data } = await api.get<RevenueAnalyticsResponse>('/revenue/analytics', { params });
  return data;
};

export const useGetRevenueAnalytics = (params: RevenueQueryDto = {}) => {
  return useQuery({
    queryKey: [REVENUE_ANALYTICS_QUERY_KEY, params.businessId],
    queryFn: () => fetchRevenueAnalytics(params),
  });
};