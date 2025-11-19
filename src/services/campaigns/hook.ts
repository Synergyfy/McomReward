import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api';
import {
  CreateCampaignRequest,
  CampaignResponse,
  PaginatedCampaignsResponse,
  BusinessCampaign,
  PaginatedCampaignAnalyticsResponse,
  DetailedCampaignAnalytics,
  PaginatedCustomerActivityResponseDto,
} from './types';

const CAMPAIGNS_QUERY_KEY = 'campaigns';
const ANALYTICS_QUERY_KEY = 'campaign-analytics';
const CUSTOMER_ACTIVITIES_QUERY_KEY = 'customer-activities';

// Create Campaign
const createCampaign = async (campaignData: CreateCampaignRequest): Promise<CampaignResponse> => {
  const { data } = await api.post<CampaignResponse>('/campaigns/business/campaigns', campaignData);
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

// Get All Campaigns By Business
const getAllCampaignsByBusiness = async (
  businessId: string,
  page: number,
  limit: number,
): Promise<PaginatedCampaignsResponse> => {
  const { data } = await api.get<PaginatedCampaignsResponse>(`/campaigns/business/${businessId}`, {
    params: { page, limit },
  });
  return data;
};

export const useGetAllCampaignsByBusiness = (businessId: string, page: number, limit: number) => {
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

// Get Customer Activities
const getCustomerActivities = async (page: number, limit: number): Promise<PaginatedCustomerActivityResponseDto> => {
  const { data } = await api.get<PaginatedCustomerActivityResponseDto>('/business/campaigns/activities', {
    params: { page, limit },
  });
  return data;
};

export const useGetCustomerActivities = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedCustomerActivityResponseDto>({
    queryKey: [CUSTOMER_ACTIVITIES_QUERY_KEY, { page, limit }],
    queryFn: () => getCustomerActivities(page, limit),
  });
};

// Get Participant Activity Timeline
const getParticipantActivity = async (
  participantId: string,
  page: number,
  limit: number,
): Promise<PaginatedCustomerActivityResponseDto> => {
  const { data } = await api.get<PaginatedCustomerActivityResponseDto>(`/business/campaigns/activities/${participantId}`, {
    params: { page, limit },
  });
  return data;
};

export const useGetParticipantActivity = (participantId: string, page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedCustomerActivityResponseDto>({
    queryKey: [CUSTOMER_ACTIVITIES_QUERY_KEY, 'participant', participantId, { page, limit }],
    queryFn: () => getParticipantActivity(participantId, page, limit),
    enabled: !!participantId,
  });
};
