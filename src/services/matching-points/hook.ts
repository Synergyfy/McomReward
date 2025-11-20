import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { AwardMatchingPointsRequest, AwardMatchingPointsResponse } from './types';
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
