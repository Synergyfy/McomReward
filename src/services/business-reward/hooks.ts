import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  GetBusinessRewardsResponse,
  CreateBusinessRewardDto,
  BusinessReward,
  GetRewardsResponse,
} from './types';

const fetchBusinessRewards = async (page: number, limit: number) => {
  const { data } = await api.get<GetBusinessRewardsResponse>(
    `/rewards/business/my-added-rewards?page=${page}&limit=${limit}`
  );
  return data;
};

export const useGetBusinessRewards = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['businessRewards', page, limit],
    queryFn: () => fetchBusinessRewards(page, limit),
  });
};

const fetchAllRewards = async (page: number, limit: number) => {
  const { data } = await api.get<GetRewardsResponse>(
    `/rewards/business/rewards?page=${page}&limit=${limit}`
  );
  return data;
};

export const useGetAllRewards = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['allRewards', page, limit],
    queryFn: () => fetchAllRewards(page, limit),
  });
};

const fetchUnaddedRewards = async (page: number, limit: number) => {
  const { data } = await api.get<GetRewardsResponse>(
    `/rewards/business/unadded-rewards?page=${page}&limit=${limit}`
  );
  return data;
};

export const useGetUnaddedRewards = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['unaddedRewards', page, limit],
    queryFn: () => fetchUnaddedRewards(page, limit),
    enabled: false, // Initially disabled, will be enabled in the modal
  });
};

const addBusinessReward = async (
  rewardId: string,
  payload: CreateBusinessRewardDto
) => {
  const { data } = await api.post<BusinessReward>(
    `/rewards/business/rewards/${rewardId}`,
    payload
  );
  return data;
};

export const useAddBusinessReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      rewardId,
      pointRequired,
      quantity,
    }: {
      rewardId: string;
      pointRequired: number;
      quantity?: number;
    }) => addBusinessReward(rewardId, { pointRequired, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessRewards'] });
      queryClient.invalidateQueries({ queryKey: ['unaddedRewards'] });
    },
  });
};

const removeBusinessReward = async (rewardId: string) => {
  await api.delete(`/rewards/business/rewards/${rewardId}`);
};

export const useRemoveBusinessReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeBusinessReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessRewards'] });
    },
  });
};
