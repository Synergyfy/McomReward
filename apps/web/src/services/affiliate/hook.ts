import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { AffiliateCodeResponse, AffiliateStats, TagNetworkDto } from './types';

const AFFILIATE_QUERY_KEY = 'affiliate';

// Fetch Affiliate Code
const fetchAffiliateCode = async (): Promise<AffiliateCodeResponse> => {
  const { data } = await api.get<string>('/business/affiliate/code');
  return { code: data };
};

export const useAffiliateCode = () => {
  return useQuery({
    queryKey: [AFFILIATE_QUERY_KEY, 'code'],
    queryFn: fetchAffiliateCode,
  });
};

// Fetch Affiliate Stats
const fetchAffiliateStats = async (): Promise<AffiliateStats> => {
  const { data } = await api.get<AffiliateStats>('/business/affiliate/analytics');
  return data;
};

export const useAffiliateStats = () => {
  return useQuery({
    queryKey: [AFFILIATE_QUERY_KEY, 'stats'],
    queryFn: fetchAffiliateStats,
  });
};

// Update Referral Tags
const updateReferralTags = async ({ businessId, tags }: { businessId: string; tags: TagNetworkDto }) => {
  const { data } = await api.patch(`/network/tag/${businessId}`, tags);
  return data;
};

export const useUpdateReferralTags = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReferralTags,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AFFILIATE_QUERY_KEY, 'stats'] });
    },
  });
};