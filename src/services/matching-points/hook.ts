import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { AwardMatchingPointsRequest, AwardMatchingPointsResponse, ToggleMatchingPointsRequest, ToggleMatchingPointsResponse } from './types';
import toast from 'react-hot-toast';

// Award Matching Points
const awardMatchingPoints = async (data: AwardMatchingPointsRequest): Promise<AwardMatchingPointsResponse> => {
    const response = await api.post<AwardMatchingPointsResponse>('/admin/award-matching-points', data);
    return response.data;
};

export const useAwardMatchingPoints = () => {
    return useMutation({
        mutationFn: awardMatchingPoints,
        onSuccess: () => {
            toast.success('Matching points awarded successfully!');
        },
        onError: (error) => {
            console.error('Error awarding matching points:', error);
            toast.error('Failed to award matching points. Please try again.');
        },
    });
};

// Toggle Matching Points for Campaign
const toggleMatchingPoints = async (data: ToggleMatchingPointsRequest): Promise<ToggleMatchingPointsResponse> => {
    const response = await api.post<ToggleMatchingPointsResponse>('/admin/toggle-matching-points', data);
    return response.data;
};

export const useToggleMatchingPoints = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleMatchingPoints,
        onSuccess: () => {
            // Invalidate campaigns query to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['publicCampaigns'] });
            toast.success('Matching points toggled successfully!');
        },
        onError: (error) => {
            console.error('Error toggling matching points:', error);
            toast.error('Failed to toggle matching points. Please try again.');
        },
    });
};
