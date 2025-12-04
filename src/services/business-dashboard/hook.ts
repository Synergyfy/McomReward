import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { GeneralAnalyticsDto, ChartResponseDto, ChartQueryDto } from './types';

const BUSINESS_DASHBOARD_QUERY_KEY = 'businessDashboard';

// Get General Analytics
const getGeneralAnalytics = async (businessId?: string): Promise<GeneralAnalyticsDto> => {
  const { data } = await api.get<GeneralAnalyticsDto>('/business/analytics', { params: { businessId } });
  return data;
};

export const useGetGeneralAnalytics = (businessId?: string) => {
  return useQuery({
    queryKey: [BUSINESS_DASHBOARD_QUERY_KEY, 'general', businessId],
    queryFn: () => getGeneralAnalytics(businessId),
  });
};

// Get Chart Data
const getChartData = async (params: ChartQueryDto): Promise<ChartResponseDto> => {
  const { data } = await api.get<ChartResponseDto>('/business/analytics/chart', { params });
  return data;
};

export const useGetChartData = (params: ChartQueryDto) => {
  return useQuery({
    queryKey: [BUSINESS_DASHBOARD_QUERY_KEY, 'chart', params.period, params.businessId],
    queryFn: () => getChartData(params),
    enabled: !!params.period,
  });
};
