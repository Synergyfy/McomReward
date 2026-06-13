import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import api from '../api';
import {
  CreateCampaignRequest,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  CampaignResponse,
  BusinessCampaign,
  PaginatedCampaignsResponse,
  PaginatedCampaignAnalyticsResponse,
  DetailedCampaignAnalytics,
  CampaignTierAnalyticsResponse,
  PaginatedAdminCampaignsResponse,
  PaginatedCustomerActivityResponseDto,
  PaginatedOngoingCampaignsResponse,
  OngoingCampaign,
  ParticipantCampaignSearchResponse,
} from './types';

const CAMPAIGNS_QUERY_KEY = 'campaigns';
const ANALYTICS_QUERY_KEY = 'campaign-analytics';
const CUSTOMER_ACTIVITIES_QUERY_KEY = 'customer-activities';

// Create Campaign
const createCampaign = async (campaignData: CreateCampaignPayload): Promise<BusinessCampaign> => {
  const { data } = await api.post<BusinessCampaign>('/campaigns', campaignData);
  return data;
};

// Update Business Campaign
const updateBusinessCampaign = async ({ id, data }: { id: string; data: UpdateCampaignPayload }): Promise<BusinessCampaign> => {
  const { data: response } = await api.patch<BusinessCampaign>(`/business/campaigns/${id}`, data);
  return response;
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  return useMutation({
    mutationFn: (data: CreateCampaignPayload) => {
      const payload = { ...data };
      if (pathname?.includes('/dashboard/campaigns/create')) {
        if (payload.reward_ids) {
          payload.business_reward_ids = payload.reward_ids;
          delete payload.reward_ids;
        }
      }
      return createCampaign(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['businessTierUsage'] });
      queryClient.invalidateQueries({ queryKey: ['generalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessSetupStatus'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBusinessCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['businessTierUsage'] });
      queryClient.invalidateQueries({ queryKey: ['generalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessSetupStatus'] });
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
interface ClaimCampaignPayload {
  business_reward_ids?: string[];
  start_date?: string;
  end_date?: string;
  total_slots?: number;
}

const claimCampaign = async ({ campaignId, payload }: { campaignId: string; payload: ClaimCampaignPayload }): Promise<BusinessCampaign> => {
  const { data } = await api.post<BusinessCampaign>(`/business/campaigns/${campaignId}/claim`, payload);
  return data;
};

export const useClaimCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['businessTierUsage'] });
      queryClient.invalidateQueries({ queryKey: ['generalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessSetupStatus'] });
    },
  });
};

// Get My Created Campaigns
const getMyCreatedCampaigns = async (page: number, limit: number, businessId?: string): Promise<PaginatedCampaignsResponse> => {
  const { data } = await api.get<PaginatedCampaignsResponse>('/business/campaigns/my-created-campaigns', {
    params: { page, limit, businessId },
  });
  return data;
};

export const useGetMyCreatedCampaigns = (page: number = 1, limit: number = 10, businessId?: string) => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'my-created', { page, limit }, businessId],
    queryFn: () => getMyCreatedCampaigns(page, limit, businessId),
  });
};

// Get My Claimed Campaigns
const getMyClaimedCampaigns = async (page: number, limit: number, businessId?: string): Promise<PaginatedCampaignsResponse> => {
  const { data } = await api.get<PaginatedCampaignsResponse>('/business/campaigns/my-claimed-campaigns', {
    params: { page, limit, businessId },
  });
  return data;
};

export const useGetMyClaimedCampaigns = (page: number = 1, limit: number = 10, businessId?: string) => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'my-claimed', { page, limit }, businessId],
    queryFn: () => getMyClaimedCampaigns(page, limit, businessId),
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

// Get Admin Campaigns
const getAdminCampaigns = async (page: number, limit: number): Promise<PaginatedAdminCampaignsResponse> => {
  const { data } = await api.get<PaginatedAdminCampaignsResponse>('/campaigns/admins', {
    params: { page, limit },
  });
  return data;
};

export const useGetAdminCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'admin', { page, limit }],
    queryFn: () => getAdminCampaigns(page, limit),
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
  return useQuery<PaginatedCampaignAnalyticsResponse>({
    queryKey: [ANALYTICS_QUERY_KEY, { page, limit }],
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

// Delete Campaign
const deleteCampaign = async (campaignId: string): Promise<void> => {
  await api.delete(`/business/campaigns/${campaignId}`);
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['businessTierUsage'] });
      queryClient.invalidateQueries({ queryKey: ['generalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessSetupStatus'] });
    },
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

// Get Campaign By ID
const getCampaignById = async (id: string, businessId?: string): Promise<CampaignResponse | BusinessCampaign> => {
  const { data } = await api.get<CampaignResponse | BusinessCampaign>(`/campaigns/${id}`, { params: { businessId } });
  return data;
};

export const useGetCampaignById = (id: string, businessId?: string) => {
  return useQuery<CampaignResponse | BusinessCampaign>({
    queryKey: [CAMPAIGNS_QUERY_KEY, id, businessId],
    queryFn: () => getCampaignById(id, businessId),
    enabled: !!id,
  });
};

// Get Staff Ongoing Campaigns
const getStaffOngoingCampaigns = async (page: number, limit: number): Promise<PaginatedOngoingCampaignsResponse> => {
  const { data } = await api.get<PaginatedOngoingCampaignsResponse>('/campaigns/staff/ongoing', {
    params: { page, limit },
  });
  return data;
};

export const useGetStaffOngoingCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'staff', 'ongoing', { page, limit }],
    queryFn: () => getStaffOngoingCampaigns(page, limit),
  });
};

// Get Staff Campaign By ID (using the same endpoint but typed as OngoingCampaign if structure matches, otherwise we might need a specific endpoint)
// Assuming /campaigns/:id returns the full campaign details. We'll cast it to OngoingCampaign for now.
// If the structure differs significantly from the list view, we might need to adjust.
const getStaffCampaignById = async (id: string): Promise<OngoingCampaign> => {
  const { data } = await api.get<OngoingCampaign>(`/campaigns/public/business-campaign/${id}`, {
    _skipAuthRedirect: true
  } as any);
  return data;
};

export const useGetStaffCampaignById = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'staff', id],
    queryFn: () => getStaffCampaignById(id),
    enabled: !!id,
    initialData: () => {
      // Try to find the campaign in the 'ongoing' campaigns list cache
      const ongoingCampaignsQueries = queryClient.getQueriesData<PaginatedOngoingCampaignsResponse>({
        queryKey: [CAMPAIGNS_QUERY_KEY, 'staff', 'ongoing'],
      });

      for (const [, queryData] of ongoingCampaignsQueries) {
        const campaign = queryData?.data?.find((c) => c.id === id);
        if (campaign) {
          return campaign;
        }
      }
      return undefined;
    },
    // Set staleTime to avoid immediate refetch if initialData is found
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Search Participant Campaigns
const searchParticipantCampaigns = async (query: string): Promise<ParticipantCampaignSearchResponse[]> => {
  const { data } = await api.get<ParticipantCampaignSearchResponse[]>('/campaigns/participant/search', {
    params: { query },
  });
  return data;
};

export const useSearchParticipantCampaigns = () => {
  return useMutation({
    mutationFn: searchParticipantCampaigns,
  });
};

// Get Campaign Tier Analytics
const getCampaignTierAnalytics = async (campaignId: string): Promise<CampaignTierAnalyticsResponse> => {
  const { data } = await api.get<CampaignTierAnalyticsResponse>(`/campaigns/${campaignId}/analytics/tiers`);
  return data;
};

export const useGetCampaignTierAnalytics = (campaignId: string) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'tiers', campaignId],
    queryFn: () => getCampaignTierAnalytics(campaignId),
    enabled: !!campaignId,
  });
};
