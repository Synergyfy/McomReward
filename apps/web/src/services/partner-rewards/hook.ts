import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/services/api';
import {
  PaginatedPartnerRewards,
  PartnerReward,
  PartnerRewardsQuery,
} from './types';

const PARTNER_REWARDS_QUERY_KEY = 'my_partner_rewards';

// List rewards ecosystem partners (e.g. FundOrDonate) have issued to me.
const getMyPartnerRewards = async (
  params: PartnerRewardsQuery = {},
): Promise<PaginatedPartnerRewards> => {
  const { data } = await api.get<PaginatedPartnerRewards>(
    '/me/partner-rewards',
    { params },
  );
  return data;
};

export const useGetMyPartnerRewards = (
  params: PartnerRewardsQuery = {},
) => {
  return useQuery<PaginatedPartnerRewards>({
    queryKey: [PARTNER_REWARDS_QUERY_KEY, params],
    queryFn: () => getMyPartnerRewards(params),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
};

// Claim (redeem) one of my partner-issued rewards from inside MCOM Rewards.
const claimPartnerReward = async ({
  id,
  code,
}: {
  id: string;
  code?: string;
}): Promise<PartnerReward> => {
  const { data } = await api.post<PartnerReward>(
    `/me/partner-rewards/${id}/claim`,
    code ? { code } : {},
  );
  return data;
};

export const useClaimPartnerReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimPartnerReward,
    onSuccess: () => {
      toast.success('Reward claimed successfully!');
      queryClient.invalidateQueries({
        queryKey: [PARTNER_REWARDS_QUERY_KEY],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        'Could not claim this reward. Please try again.';
      toast.error(message);
    },
  });
};
