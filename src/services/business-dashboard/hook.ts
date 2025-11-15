import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { GeneralAnalyticsDto, ChartResponseDto, ChartQueryDto } from './types';

const BUSINESS_DASHBOARD_QUERY_KEY = 'businessDashboard';

// Get General Analytics
const getGeneralAnalytics = async (): Promise<GeneralAnalyticsDto> => {
  const { data } = await api.get<GeneralAnalyticsDto>('/analytics');
  return data;
};

export const useGetGeneralAnalytics = () => {
  return useQuery({
    queryKey: [BUSINESS_DASHBOARD_QUERY_KEY, 'general'],
    queryFn: getGeneralAnalytics,
  });
};

// Get Chart Data
const getChartData = async (params: ChartQueryDto): Promise<ChartResponseDto> => {
  const { data } = await api.get<ChartResponseDto>('/analytics/chart', { params });
  return data;
};

export const useGetChartData = (params: ChartQueryDto) => {
  return useQuery({
    queryKey: [BUSINESS_DASHBOARD_QUERY_KEY, 'chart', params.period],
    queryFn: () => getChartData(params),
    enabled: !!params.period,
  });
};
