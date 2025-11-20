import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api';
import {
  CreateCampaignRequest,
  CreateCampaignPayload,
  CampaignResponse,
  PaginatedCampaignsResponse,
  BusinessCampaign,
  PaginatedCampaignAnalyticsResponse,
  DetailedCampaignAnalytics,
} from './types';

const CAMPAIGNS_QUERY_KEY = 'campaigns';
const ANALYTICS_QUERY_KEY = 'campaign-analytics';

// Create Campaign
const createCampaign = async (campaignData: CreateCampaignPayload): Promise<CampaignResponse> => {
  const { data } = await api.post<CampaignResponse>('/campaigns', campaignData);
  return data;
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
    },
  });
};

// Get All Campaigns By Business (Legacy/Admin?)
const getAllCampaignsByBusiness = async (
  businessId: string,
  page: number,
  limit: number,
): Promise<PaginatedCampaignsResponse> => {
  const { data } = await api.get<PaginatedCampaignsResponse>(
    `/campaigns/business/${businessId}`,
    {
      params: { page, limit },
    },
  );
  return data;
};

export const useGetAllCampaignsByBusiness = (
  businessId: string,
  page: number,
  limit: number,
) => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'business', businessId, { page, limit }],
    queryFn: () => getAllCampaignsByBusiness(businessId, page, limit),
    enabled: !!businessId,
  });
};

// Get Claimable Campaigns
const getClaimableCampaigns = async (page: number, limit: number): Promise<PaginatedCampaignsResponse> => {
  const { data } = await api.get<PaginatedCampaignsResponse>('/business/campaigns/claimable', {
    params: { page, limit },
  });
  return data;
};

export const useGetClaimableCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'claimable', { page, limit }],
    queryFn: () => getClaimableCampaigns(page, limit),
  });
};

// Claim Campaign
const claimCampaign = async (campaignId: string): Promise<BusinessCampaign> => {
  const { data } = await api.post<BusinessCampaign>(`/business/campaigns/${campaignId}/claim`);
  return data;
};

export const useClaimCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
    },
  });
};

// Get My Created Campaigns
const getMyCreatedCampaigns = async (page: number, limit: number): Promise<PaginatedCampaignsResponse> => {
  const { data } = await api.get<PaginatedCampaignsResponse>('/business/campaigns/my-created-campaigns', {
    params: { page, limit },
  });
  return data;
};

export const useGetMyCreatedCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'my-created', { page, limit }],
    queryFn: () => getMyCreatedCampaigns(page, limit),
  });
};

// Get My Claimed Campaigns
const getMyClaimedCampaigns = async (page: number, limit: number): Promise<PaginatedCampaignsResponse> => {
  const { data } = await api.get<PaginatedCampaignsResponse>('/business/campaigns/my-claimed-campaigns', {
    params: { page, limit },
  });
  return data;
};

export const useGetMyClaimedCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'my-claimed', { page, limit }],
    queryFn: () => getMyClaimedCampaigns(page, limit),
  });
};

// Get All Public Campaigns for Admin
const getAllPublicCampaigns = async (page: number, limit: number): Promise<PaginatedCampaignsResponse> => {
  const { data } = await api.get<PaginatedCampaignsResponse>('/campaigns/all/public', {
    params: { page, limit },
  });
  return data;
};

export const useGetAllPublicCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'all-public', { page, limit }],
    queryFn: () => getAllPublicCampaigns(page, limit),
  });
};

// Get Campaign Analytics
const getCampaignAnalytics = async (page: number, limit: number): Promise<PaginatedCampaignAnalyticsResponse> => {
  const { data } = await api.get<PaginatedCampaignAnalyticsResponse>('/business/campaigns/analytics', {
    params: { page, limit },
  });
  return data;
};

export const useGetCampaignAnalytics = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'list', { page, limit }],
    queryFn: () => getCampaignAnalytics(page, limit),
  });
};

// Get Detailed Campaign Analytics
const getDetailedCampaignAnalytics = async (campaignId: string): Promise<DetailedCampaignAnalytics> => {
  const { data } = await api.get<DetailedCampaignAnalytics>(`/business/campaigns/${campaignId}/analytics/detailed`);
  return data;
};

export const useGetDetailedCampaignAnalytics = (campaignId: string) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'detailed', campaignId],
    queryFn: () => getDetailedCampaignAnalytics(campaignId),
    enabled: !!campaignId,
  });
};