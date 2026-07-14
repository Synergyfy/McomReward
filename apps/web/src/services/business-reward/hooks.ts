import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  GetBusinessRewardsResponse,
  CreateBusinessRewardDto,
  BusinessReward,
  GetRewardsResponse,
  UpdateBusinessRewardDto,
  GetMallRewardHistoryResponse,
  MallRewardStats,
} from './types';

const fetchMallRewardHistory = async (page: number, limit: number) => {
  const { data } = await api.get<GetMallRewardHistoryResponse>(
    `/rewards/business/mall-reward-history`, { params: { page, limit } }
  );
  return data;
};

export const useGetMallRewardHistory = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['mallRewardHistory', page, limit],
    queryFn: () => fetchMallRewardHistory(page, limit),
  });
};

const fetchMallRewardStats = async () => {
  const { data } = await api.get<MallRewardStats>(
    `/rewards/business/mall-reward-stats`
  );
  return data;
};

export const useGetMallRewardStats = () => {
  return useQuery({
    queryKey: ['mallRewardStats'],
    queryFn: fetchMallRewardStats,
  });
};

const fetchParticipantMallRewardHistory = async (page: number, limit: number) => {
  const { data } = await api.get<GetMallRewardHistoryResponse>(
    `/rewards/participant/mall-reward-history`, { params: { page, limit } }
  );
  return data;
};

export const useGetParticipantMallRewardHistory = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['participantMallRewardHistory', page, limit],
    queryFn: () => fetchParticipantMallRewardHistory(page, limit),
  });
};

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

const fetchUnaddedRewards = async (page: number, limit: number, search?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) {
    params.append('search', search);
  }
  const { data } = await api.get<GetRewardsResponse>(
    `/rewards/business/unadded-rewards?${params.toString()}`
  );
  return data;
};

export const useGetUnaddedRewards = (page: number, limit: number, search?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['unaddedRewards', page, limit, search],
    queryFn: () => fetchUnaddedRewards(page, limit, search),
    enabled: options?.enabled, // Controlled by the component
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
      queryClient.invalidateQueries({ queryKey: ['businessTierUsage'] });
      queryClient.invalidateQueries({ queryKey: ['generalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessSetupStatus'] });
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
      payload,
    }: {
      rewardId: string;
      payload: CreateBusinessRewardDto;
    }) => addBusinessReward(rewardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessRewards'] });
      queryClient.invalidateQueries({ queryKey: ['unaddedRewards'] });
      queryClient.invalidateQueries({ queryKey: ['businessTierUsage'] });
      queryClient.invalidateQueries({ queryKey: ['generalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessSetupStatus'] });
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
      queryClient.invalidateQueries({ queryKey: ['businessTierUsage'] });
      queryClient.invalidateQueries({ queryKey: ['generalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessSetupStatus'] });
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
      queryClient.invalidateQueries({ queryKey: ['businessTierUsage'] });
      queryClient.invalidateQueries({ queryKey: ['generalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessSetupStatus'] });
    },
  });
};
