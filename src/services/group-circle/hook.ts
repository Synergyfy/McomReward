import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { CreateGroupCircleDto, GroupCircle, GroupCirclesQueryParams, GroupCirclesResponse, UpdateGroupCircleDto } from './types';

const GROUP_CIRCLE_QUERY_KEY = 'groupCircles';

const fetchGroupCircles = async (params: GroupCirclesQueryParams): Promise<GroupCirclesResponse> => {
    const apiParams = {
        page: params.page || 1,
        limit: params.limit || 10,
    };
    const response = await api.get<GroupCirclesResponse>('/group-circles', { params: apiParams });
    return response.data;
};

const createGroupCircle = async (data: CreateGroupCircleDto): Promise<GroupCircle> => {
    const response = await api.post<GroupCircle>('/group-circles', data);
    return response.data;
};

const updateGroupCircle = async ({ id, data }: { id: string; data: UpdateGroupCircleDto }): Promise<GroupCircle> => {
    const response = await api.patch<GroupCircle>(`/group-circles/${id}`, data);
    return response.data;
};

export const useGetGroupCircles = (params: GroupCirclesQueryParams = {}) => {
    return useQuery({
        queryKey: [GROUP_CIRCLE_QUERY_KEY, params],
        queryFn: () => fetchGroupCircles(params),
    });
};

export const useCreateGroupCircle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createGroupCircle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUP_CIRCLE_QUERY_KEY] });
        },
    });
};

export const useUpdateGroupCircle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateGroupCircle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUP_CIRCLE_QUERY_KEY] });
        },
    });
};
