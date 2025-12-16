/**
 * Consumer Stamp Rewards React Query Hooks
 * Provides hooks for customer stamp card operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getConsumerStampCards,
    getConsumerStampCardById,
    getDiscoverableStampRewards,
    startStampCard,
    getRedemptionQR,
    getConsumerStampStats,
} from './index';
import toast from 'react-hot-toast';

const QUERY_KEYS = {
    consumerStampCards: 'consumer-stamp-cards',
    consumerStampCardDetail: 'consumer-stamp-card-detail',
    discoverableRewards: 'discoverable-stamp-rewards',
    consumerStampStats: 'consumer-stamp-stats',
    redemptionQR: 'redemption-qr',
};

/**
 * Hook to get customer's stamp cards
 */
export const useGetConsumerStampCards = (
    status?: 'in_progress' | 'completed' | 'redeemed' | 'all',
    page: number = 1,
    limit: number = 10
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.consumerStampCards, status, page, limit],
        queryFn: () => getConsumerStampCards(status, page, limit),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

/**
 * Hook to get a single stamp card by ID
 */
export const useGetConsumerStampCardById = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.consumerStampCardDetail, id],
        queryFn: () => getConsumerStampCardById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 1, // 1 minute
    });
};

/**
 * Hook to get discoverable stamp rewards
 */
export const useGetDiscoverableStampRewards = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.discoverableRewards],
        queryFn: getDiscoverableStampRewards,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to start a new stamp card (enroll in a stamp reward)
 */
export const useStartStampCard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (businessStampRewardId: string) => startStampCard(businessStampRewardId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.consumerStampCards] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.discoverableRewards] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.consumerStampStats] });
            toast.success(`You're now collecting stamps for "${data.template.title}"!`);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to start stamp card');
        },
    });
};

/**
 * Hook to get redemption QR code
 */
export const useGetRedemptionQR = (stampCardId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: [QUERY_KEYS.redemptionQR, stampCardId],
        queryFn: () => getRedemptionQR(stampCardId),
        enabled: enabled && !!stampCardId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to get customer's stamp reward stats
 */
export const useGetConsumerStampStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.consumerStampStats],
        queryFn: getConsumerStampStats,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};
