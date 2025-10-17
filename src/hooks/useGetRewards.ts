import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { GetRewardsResponse } from '@/types/rewards';

export const useGetRewards = (page: number, limit: number) => {
  return useQuery<GetRewardsResponse, Error>({
    queryKey: ['rewards', page, limit],
    queryFn: async () => {
      const response = await api.get<GetRewardsResponse>('/rewards/admin/rewards', {
        params: { page, limit },
      });
      return response.data;
    },
  });
};
