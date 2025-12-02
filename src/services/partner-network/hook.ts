import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { PartnerNetworkResponse, PartnerNetworkQueryDto } from './types';

const PARTNER_NETWORK_QUERY_KEY = 'partnerNetwork';

const fetchPartnerNetwork = async (params: PartnerNetworkQueryDto): Promise<PartnerNetworkResponse> => {
  const { data } = await api.get<PartnerNetworkResponse>('/business/partner-network', { params });
  return data;
};

export const useGetPartnerNetwork = (params: PartnerNetworkQueryDto = {}) => {
  return useQuery({
    queryKey: [PARTNER_NETWORK_QUERY_KEY, params.businessId],
    queryFn: () => fetchPartnerNetwork(params),
  });
};
