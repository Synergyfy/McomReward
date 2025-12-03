import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  GetBusinessRewardsResponse,
  CreateBusinessRewardDto,
  BusinessReward,
  GetRewardsResponse,
  UpdateBusinessRewardDto,
} from './types';

const fetchBusinessRewards = async (page: number, limit: number, businessId?: string) => {
  const { data } = await api.get<GetBusinessRewardsResponse>(
    `/rewards/business/my-added-rewards`, { params: { page, limit, businessId } }
  );
  return data;
};

export const useGetBusinessRewards = (page: number, limit: number, businessId?: string) => {
  return useQuery({
    queryKey: ['businessRewards', page, limit, businessId],
    queryFn: () => fetchBusinessRewards(page, limit, businessId),
  });
};

const fetchAllRewards = async (page: number, limit: number, businessId?: string) => {
  const { data } = await api.get<GetRewardsResponse>(
    `/rewards/business/rewards`, { params: { page, limit, businessId } }
  );
  return data;
};

export const useGetAllRewards = (page: number, limit: number, businessId?: string) => {
  return useQuery({
    queryKey: ['allRewards', page, limit, businessId],
    queryFn: () => fetchAllRewards(page, limit, businessId),
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

const createBusinessReward = async (payload: CreateBusinessRewardDto) => {
  const { data } = await api.post<BusinessReward>(
    `/rewards/business/rewards/create`,
    payload
  );
  return data;
};

export const useCreateBusinessReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBusinessReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessRewards'] });
      queryClient.invalidateQueries({ queryKey: ['unaddedRewards'] });
    },
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
    }) => addBusinessReward(rewardId, { point_required: pointRequired, quantity }),
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


const updateBusinessReward = async (
  rewardId: string,
  payload: UpdateBusinessRewardDto
) => {
  const { data } = await api.put<BusinessReward>(
    `rewards/business/rewards/${rewardId}`,
    payload
  );
  return data;
};

export const useUpdateBusinessReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      rewardId,
      payload,
    }: {
      rewardId: string;
      payload: UpdateBusinessRewardDto;
    }) => updateBusinessReward(rewardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessRewards'] });
      queryClient.invalidateQueries({ queryKey: ['allRewards'] });
    },
  });
};
