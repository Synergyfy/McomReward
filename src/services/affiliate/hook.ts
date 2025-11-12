import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { AffiliateCodeResponse, AffiliateStats } from './types';

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