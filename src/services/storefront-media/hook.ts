import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { StorefrontMediaResponse, StorefrontMediaQueryDto } from './types';

const STOREFRONT_MEDIA_QUERY_KEY = 'storefrontMedia';

const fetchStorefrontMedia = async (params: StorefrontMediaQueryDto): Promise<StorefrontMediaResponse> => {
  const { data } = await api.get<StorefrontMediaResponse>('/business/storefront-media', { params });
  return data;
};

export const useGetStorefrontMedia = (params: StorefrontMediaQueryDto = {}) => {
  return useQuery({
    queryKey: [STOREFRONT_MEDIA_QUERY_KEY, params.businessId],
    queryFn: () => fetchStorefrontMedia(params),
  });
};