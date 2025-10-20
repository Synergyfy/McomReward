import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { setBearerToken } from '../api';
import { AddRewardToBusinessRequest, CreateRewardRequest, GetRewardsResponse, RewardResponse } from './types';
import Cookies from 'js-cookie';

const REWARDS_QUERY_KEY = 'rewards';
const BUSINESS_REWARDS_QUERY_KEY = 'business_rewards';

// Create Reward
const createReward = async (rewardData: CreateRewardRequest): Promise<RewardResponse> => {
  const { data } = await api.post<RewardResponse>('/rewards/admin/rewards', rewardData);
  return data;
};

export const useCreateReward = () => {
  const queryClient = useQueryClient();
  setBearerToken(Cookies.get('access') || '');

  return useMutation({
    mutationFn: createReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REWARDS_QUERY_KEY] });
    },
  });
};

// Get Rewards
const getRewards = async (page: number, limit: number): Promise<GetRewardsResponse> => {
  const { data } = await api.get<GetRewardsResponse>('/rewards/admin/rewards', {
    params: { page, limit },
  });
  return data;
};

export const useGetRewards = (page: number, limit: number) => {
  return useQuery({
    queryKey: [REWARDS_QUERY_KEY, page, limit],
    queryFn: () => getRewards(page, limit),
  });
};

// Get Business Rewards
const getBusinessRewards = async (page: number, limit: number): Promise<GetRewardsResponse> => {
  const { data } = await api.get<GetRewardsResponse>('/rewards/business/rewards', {
    params: { page, limit },
  });
  return data;
};

export const useGetBusinessRewards = (page: number, limit: number) => {
  return useQuery({
    queryKey: [BUSINESS_REWARDS_QUERY_KEY, page, limit],
    queryFn: () => getBusinessRewards(page, limit),
  });
};

// Get All Business Rewards
const getAllBusinessRewards = async (): Promise<GetRewardsResponse> => {
  const { data } = await api.get<GetRewardsResponse>('/rewards/business/rewards', {
    params: { page: 1, limit: 1000 }, // Fetch up to 1000 rewards
  });
  return data;
};

export const useGetAllBusinessRewards = () => {
  return useQuery({
    queryKey: [BUSINESS_REWARDS_QUERY_KEY, 'all'],
    queryFn: getAllBusinessRewards,
  });
};

// Add Reward to Business
const addRewardToBusiness = async ({ rewardId, ...rest }: { rewardId: string } & AddRewardToBusinessRequest): Promise<RewardResponse> => {
  const { data } = await api.post<RewardResponse>(`/rewards/business/rewards/${rewardId}`, rest);
  return data;
};

export const useAddRewardToBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRewardToBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUSINESS_REWARDS_QUERY_KEY] });
    },
  });
};