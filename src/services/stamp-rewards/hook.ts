/**
 * Stamp Rewards React Query Hooks
 * 
 * Custom hooks for managing stamp reward data with React Query.
 * Provides caching, automatic refetching, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    createStampReward,
    getStampRewards,
    getStampRewardById,
    updateStampReward,
    deleteStampReward,
    publishStampReward,
    archiveStampReward,
    duplicateStampReward,
} from './index';
import {
    CreateStampRewardRequest,
    UpdateStampRewardRequest,
    StampRewardResponse
} from './types';

const QUERY_KEY = 'stamp-rewards';

/**
 * Hook to fetch all stamp rewards with pagination
 */
export const useGetStampRewards = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: [QUERY_KEY, page, limit],
        queryFn: () => getStampRewards(page, limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook to fetch a single stamp reward by ID
 */
export const useGetStampRewardById = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEY, id],
        queryFn: () => getStampRewardById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook to create a new stamp reward
 */
export const useCreateStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateStampRewardRequest) => createStampReward(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            toast.success('Stamp reward template created successfully!');
            return data;
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create stamp reward template');
        },
    });
};

/**
 * Hook to update an existing stamp reward
 */
export const useUpdateStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<UpdateStampRewardRequest> }) =>
            updateStampReward(id, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
            toast.success('Stamp reward template updated successfully!');
            return data;
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update stamp reward template');
        },
    });
};

/**
 * Hook to delete a stamp reward
 */
export const useDeleteStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteStampReward(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            toast.success('Stamp reward template deleted successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete stamp reward template');
        },
    });
};

/**
 * Hook to publish a stamp reward (make it active)
 */
export const usePublishStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => publishStampReward(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            toast.success('Stamp reward template published successfully!');
            return data;
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to publish stamp reward template');
        },
    });
};

/**
 * Hook to archive a stamp reward
 */
export const useArchiveStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => archiveStampReward(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            toast.success('Stamp reward template archived successfully!');
            return data;
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to archive stamp reward template');
        },
    });
};

/**
 * Hook to duplicate a stamp reward
 */
export const useDuplicateStampReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => duplicateStampReward(id),
        onSuccess: (data: StampRewardResponse) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            toast.success('Stamp reward template duplicated successfully!');
            return data;
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to duplicate stamp reward template');
        },
    });
};
