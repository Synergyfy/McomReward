import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { CampaignResponse, BusinessCampaign } from './types';
import { CreateCampaignFromWishlistDto } from './types_wishlist';

const CAMPAIGNS_QUERY_KEY = 'campaigns';

// Create Campaign From Wishlist
const createCampaignFromWishlist = async (campaignData: CreateCampaignFromWishlistDto): Promise<CampaignResponse | BusinessCampaign> => {
  const { data } = await api.post<CampaignResponse | BusinessCampaign>('/campaigns/from-wishlist', campaignData);
  return data;
};

export const useCreateCampaignFromWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaignFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['businessTierUsage'] });
      queryClient.invalidateQueries({ queryKey: ['generalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessSetupStatus'] });
    },
  });
};
