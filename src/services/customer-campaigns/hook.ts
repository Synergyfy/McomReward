import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { JoinCampaignResponse, PaginatedPublicCampaigns, PublicCampaign } from './types';

const PUBLIC_CAMPAIGNS_QUERY_KEY = 'publicCampaigns';

// Get Public Campaigns
const getPublicCampaigns = async (page: number, limit: number): Promise<PaginatedPublicCampaigns> => {
  const { data } = await api.get<PaginatedPublicCampaigns>('/campaigns', {
    params: { page, limit },
    _skipAuthRedirect: true
  });
  return data;
};

export const useGetPublicCampaigns = (page: number, limit: number) => {
  return useQuery({
    queryKey: [PUBLIC_CAMPAIGNS_QUERY_KEY, page, limit],
    queryFn: () => getPublicCampaigns(page, limit),
  });
};

// Get Public Campaign Details
const getPublicCampaignDetails = async (campaignId: string): Promise<PublicCampaign> => {
  const { data } = await api.get<PublicCampaign>(`/campaigns/public/business-campaign/${campaignId}`, {
    _skipAuthRedirect: true
  });
  return data;
};

export const useGetPublicCampaignDetails = (campaignId: string) => {
  return useQuery({
    queryKey: [PUBLIC_CAMPAIGNS_QUERY_KEY, campaignId],
    queryFn: () => getPublicCampaignDetails(campaignId),
    enabled: !!campaignId, // Only run query if campaignId is available
  });
};

// Join Campaign
const joinCampaign = async (campaignId: string): Promise<JoinCampaignResponse> => {
  const { data } = await api.post<JoinCampaignResponse>(`/campaigns/${campaignId}/join`);
  return data;
};

export const useJoinCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinCampaign,
    onSuccess: (data, campaignId) => {
      // Invalidate the specific campaign to refetch its data, which might have changed (e.g., user joined)
      queryClient.invalidateQueries({ queryKey: [PUBLIC_CAMPAIGNS_QUERY_KEY, campaignId] });
    },
  });
};
