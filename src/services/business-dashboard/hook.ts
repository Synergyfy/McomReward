import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { GeneralAnalyticsDto, ChartResponseDto, ChartQueryDto } from './types';

const BUSINESS_DASHBOARD_QUERY_KEY = 'businessDashboard';

const getHeaders = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('impersonation_state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.isImpersonating && parsed.businessId) {
          return { 'x-business-id': parsed.businessId };
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return {};
};

// Get General Analytics
const getGeneralAnalytics = async (businessId?: string): Promise<GeneralAnalyticsDto> => {
  // Explicitly merge headers
  const headers = getHeaders();
  const { data } = await api.get<GeneralAnalyticsDto>('/analytics', {
    params: { businessId },
    headers: headers
  });
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
  const headers = getHeaders();
  const { data } = await api.get<ChartResponseDto>('/analytics/chart', {
    params,
    headers: headers
  });
  return data;
};

export const useGetChartData = (params: ChartQueryDto) => {
  return useQuery({
    queryKey: [BUSINESS_DASHBOARD_QUERY_KEY, 'chart', params.period, params.businessId],
    queryFn: () => getChartData(params),
    enabled: !!params.period,
  });
};
