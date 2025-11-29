import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { MarketingMaterialsResponse, MarketingMaterialsQueryDto } from './types';

const MARKETING_MATERIALS_QUERY_KEY = 'marketingMaterials';

const fetchMarketingMaterials = async (params: MarketingMaterialsQueryDto): Promise<MarketingMaterialsResponse> => {
  const { data } = await api.get<MarketingMaterialsResponse>('/business/marketing-materials', { params });
  return data;
};

export const useGetMarketingMaterials = (params: MarketingMaterialsQueryDto = {}) => {
  return useQuery({
    queryKey: [MARKETING_MATERIALS_QUERY_KEY, params.businessId],
    queryFn: () => fetchMarketingMaterials(params),
  });
};
