import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { TopBusiness } from './types';

const ANALYTICS_QUERY_KEY = 'analytics';

// Get Top Performing Businesses
const getTopBusinesses = async (): Promise<TopBusiness[]> => {
  const { data } = await api.get<TopBusiness[]>('/admin/analytics/top-businesses');
  return data;
};

export const useTopBusinesses = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'top-businesses'],
    queryFn: getTopBusinesses,
  });
};

