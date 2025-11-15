// src/services/analytics/hook.ts
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { GeneralAnalyticsDto, ChartResponseDto, ChartPeriod } from './types';

const ANALYTICS_QUERY_KEY = 'analytics';

// Get General Analytics
const getAnalytics = async (): Promise<GeneralAnalyticsDto> => {
  const { data } = await api.get<GeneralAnalyticsDto>('/analytics');
  return data;
};

export const useGetAnalytics = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY],
    queryFn: getAnalytics,
  });
};

// Get Chart Data
const getChartData = async (period: ChartPeriod): Promise<ChartResponseDto> => {
  const { data } = await api.get<ChartResponseDto>('/analytics/chart', {
    params: { period },
  });
  return data;
};

export const useGetChartData = (period: ChartPeriod) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'chart', period],
    queryFn: () => getChartData(period),
    enabled: !!period,
  });
};
