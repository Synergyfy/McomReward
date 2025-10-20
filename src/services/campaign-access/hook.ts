import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { PaginatedCampaignAccess } from './types';

const CAMPAIGN_ACCESS_QUERY_KEY = 'campaignAccess';

// Get Campaign Access Records
const getCampaignAccess = async (page: number, limit: number): Promise<PaginatedCampaignAccess> => {
  const { data } = await api.get<PaginatedCampaignAccess>('/campaigns/business/access', { params: { page, limit } });
  return data;
};

export const useGetCampaignAccess = (page: number, limit: number) => {
  return useQuery({
    queryKey: [CAMPAIGN_ACCESS_QUERY_KEY, page, limit],
    queryFn: () => getCampaignAccess(page, limit),
  });
};
