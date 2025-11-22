import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { GetPointLogsResponse, GrowthActivityChartResponse, SystemOverview, TierBreakdown, TopBusiness, TopReward } from './types';

const POINT_LOGS_QUERY_KEY = 'point_logs';
const SYSTEM_OVERVIEW_QUERY_KEY = 'system_overview';
const TOP_BUSINESSES_QUERY_KEY = 'top_businesses';
const TOP_REWARDS_QUERY_KEY = 'top_rewards';
const TIER_BREAKDOWN_QUERY_KEY = 'tier_breakdown';
const GROWTH_ACTIVITY_CHART_QUERY_KEY = 'growth_activity_chart';

// Get Point Logs
const getPointLogs = async (page: number, limit: number): Promise<GetPointLogsResponse> => {
  const { data } = await api.get<GetPointLogsResponse>('/admin/analytics/point-logs', {
    params: { page, limit },
  });
  return data;
};

export const useGetPointLogs = (page: number, limit: number) => {
  return useQuery({
    queryKey: [POINT_LOGS_QUERY_KEY, page, limit],
    queryFn: () => getPointLogs(page, limit),
  });
};

// System Overview
const getSystemOverview = async (): Promise<SystemOverview> => {
  const { data } = await api.get<SystemOverview>('/admin/analytics/system-overview');
  return data;
};

export const useSystemOverview = () => {
  return useQuery({
    queryKey: [SYSTEM_OVERVIEW_QUERY_KEY],
    queryFn: getSystemOverview,
  });
};

// Top Businesses
const getTopBusinesses = async (): Promise<TopBusiness[]> => {
  const { data } = await api.get<TopBusiness[]>('/admin/analytics/top-businesses');
  return data;
};

export const useTopBusinesses = () => {
  return useQuery({
    queryKey: [TOP_BUSINESSES_QUERY_KEY],
    queryFn: getTopBusinesses,
  });
};

// Top Rewards
const getTopRewards = async (): Promise<TopReward[]> => {
  const { data } = await api.get<TopReward[]>('/admin/analytics/top-rewards');
  return data;
};

export const useTopRewards = () => {
  return useQuery({
    queryKey: [TOP_REWARDS_QUERY_KEY],
    queryFn: getTopRewards,
  });
};

// Tier Breakdown
const getTierBreakdown = async (): Promise<TierBreakdown[]> => {
  const { data } = await api.get<TierBreakdown[]>('/tier/breakdown');
  return data;
};

export const useTierBreakdown = () => {
  return useQuery({
    queryKey: [TIER_BREAKDOWN_QUERY_KEY],
    queryFn: getTierBreakdown,
  });
};

// Growth Activity Chart
const getGrowthActivityChart = async (startDate?: string, endDate?: string): Promise<GrowthActivityChartResponse> => {
  const { data } = await api.get<GrowthActivityChartResponse>('/admin/analytics/growth-activity-chart', {
    params: { startDate, endDate },
  });
  return data;
};

export const useGrowthActivityChart = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [GROWTH_ACTIVITY_CHART_QUERY_KEY, startDate, endDate],
    queryFn: () => getGrowthActivityChart(startDate, endDate),
  });
};
