/**
 * Business Stamp Rewards React Query Hooks
 * Provides hooks for business stamp reward operations with caching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAvailableTemplates,
    getBusinessStampRewards,
    activateStampReward,
    pauseStampReward,
    resumeStampReward,
    deactivateStampReward,
    getCustomerStampCards,
    awardStamp,
    redeemStampCard,
    getStampRewardStats,
} from './index';
import {
    ActivateStampRewardRequest,
    AwardStampRequest,
    RedeemStampCardRequest,
} from './types';
import toast from 'react-hot-toast';

const QUERY_KEYS = {
    availableTemplates: 'available-stamp-templates',
    businessStampRewards: 'business-stamp-rewards',
    customerStampCards: 'customer-stamp-cards',
    stampRewardStats: 'stamp-reward-stats',
};

/**
 * Hook to get available stamp reward templates for activation
 */
export const useGetAvailableTemplates = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.availableTemplates],
        queryFn: getAvailableTemplates,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to get business's activated stamp rewards
 */
export const useGetBusinessStampRewards = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: [QUERY_KEYS.businessStampRewards, page, limit],
        queryFn: () => getBusinessStampRewards(page, limit),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

/**
 * Hook to activate a stamp reward template
 */
export const useActivateStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ActivateStampRewardRequest) => activateStampReward(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.businessStampRewards] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.availableTemplates] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stampRewardStats] });
            toast.success('Stamp reward activated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to activate stamp reward');
        },
    });
};

/**
 * Hook to pause an active stamp reward
 */
export const usePauseStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => pauseStampReward(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.businessStampRewards] });
            toast.success('Stamp reward paused');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to pause stamp reward');
        },
    });
};

/**
 * Hook to resume a paused stamp reward
 */
export const useResumeStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => resumeStampReward(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.businessStampRewards] });
            toast.success('Stamp reward resumed');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to resume stamp reward');
        },
    });
};

/**
 * Hook to deactivate a stamp reward
 */
export const useDeactivateStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deactivateStampReward(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.businessStampRewards] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.availableTemplates] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stampRewardStats] });
            toast.success('Stamp reward deactivated');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to deactivate stamp reward');
        },
    });
};

/**
 * Hook to get customer stamp cards for a specific business stamp reward
 */
export const useGetCustomerStampCards = (businessStampRewardId: string, page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: [QUERY_KEYS.customerStampCards, businessStampRewardId, page, limit],
        queryFn: () => getCustomerStampCards(businessStampRewardId, page, limit),
        enabled: !!businessStampRewardId,
        staleTime: 1000 * 60 * 1, // 1 minute
    });
};

/**
 * Hook to award a stamp to a customer
 */
export const useAwardStamp = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AwardStampRequest) => awardStamp(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.customerStampCards] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.businessStampRewards] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stampRewardStats] });

            if (data.status === 'completed') {
                toast.success('🎉 Stamp awarded! Customer completed all stamps!');
            } else {
                toast.success(`Stamp awarded! ${data.stampsCollected}/${data.stampsRequired} stamps collected`);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to award stamp');
        },
    });
};

/**
 * Hook to redeem a completed stamp card
 */
export const useRedeemStampCard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RedeemStampCardRequest) => redeemStampCard(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.customerStampCards] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.businessStampRewards] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stampRewardStats] });
            toast.success('Reward redeemed successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to redeem reward');
        },
    });
};

/**
 * Hook to get stamp reward stats for the dashboard
 */
export const useGetStampRewardStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.stampRewardStats],
        queryFn: getStampRewardStats,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};
