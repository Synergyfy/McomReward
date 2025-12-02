import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { BusinessAssetOverviewResponse, BusinessAssetOverviewQueryDto } from './types';

const BUSINESS_ASSET_OVERVIEW_QUERY_KEY = 'businessAssetOverview';

const fetchBusinessAssetOverview = async (params: BusinessAssetOverviewQueryDto): Promise<BusinessAssetOverviewResponse> => {
  const { data } = await api.get<BusinessAssetOverviewResponse>('/business/assets/overview', { params });
  return data;
};

export const useGetBusinessAssetOverview = (params: BusinessAssetOverviewQueryDto = {}) => {
  return useQuery({
    queryKey: [BUSINESS_ASSET_OVERVIEW_QUERY_KEY, params.businessId],
    queryFn: () => fetchBusinessAssetOverview(params),
  });
};
