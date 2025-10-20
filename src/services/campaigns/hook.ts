import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { CreateCampaignRequest, CampaignResponse } from './types';

const CAMPAIGNS_QUERY_KEY = 'campaigns';

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
