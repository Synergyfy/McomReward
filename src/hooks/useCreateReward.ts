import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { CreateRewardRequest, RewardResponse } from '@/types/rewards';

export const useCreateReward = () => {
  return useMutation<RewardResponse, Error, CreateRewardRequest>({
    mutationFn: async (rewardData: CreateRewardRequest) => {
      const response = await api.post<RewardResponse>('/rewards/admin/rewards', rewardData);
      return response.data;
    },
  });
};
