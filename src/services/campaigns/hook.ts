import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaginatedCampaignResponse, BusinessCampaign } from './types';
import api from '../api';

export const useGetUnaddedAdminCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedCampaignResponse, Error>({
    queryKey: ['unaddedAdminCampaigns', page, limit],
    queryFn: async () => {
      const response = await api.get('/business/campaigns/unadded', {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

export const useGetAddedAdminCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedCampaignResponse, Error>({
    queryKey: ['addedAdminCampaigns', page, limit],
    queryFn: async () => {
      const response = await api.get('/business/campaigns/added', {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

export const useGetMyCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedCampaignResponse, Error>({
    queryKey: ['myCampaigns', page, limit],
    queryFn: async () => {
      const response = await api.get('/business/campaigns/my-campaigns', {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

export const useAddAdminCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<BusinessCampaign, Error, string>({
    mutationFn: async (campaignId: string) => {
      const response = await api.post(`/business/campaigns/${campaignId}/add`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unaddedAdminCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['addedAdminCampaigns'] });
    },
  });
};
