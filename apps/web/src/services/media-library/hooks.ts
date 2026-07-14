import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import {
    CreateLibraryAssetDto,
    LibraryAsset,
    LibraryAssetsQueryData,
    PaginatedLibraryResponse,
} from './types';

const MEDIA_LIBRARY_QUERY_KEY = 'media-library';

// Create Library Asset
const createLibraryAsset = async (assetData: CreateLibraryAssetDto): Promise<LibraryAsset> => {
    const { data } = await api.post<LibraryAsset>('/library-assets', assetData);
    return data;
};

export const useCreateLibraryAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLibraryAsset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MEDIA_LIBRARY_QUERY_KEY] });
        },
    });
};

// Get Library Assets
const getLibraryAssets = async (params: LibraryAssetsQueryData): Promise<PaginatedLibraryResponse> => {
    const { data } = await api.get<PaginatedLibraryResponse>('/library-assets', {
        params,
    });
    return data;
};

export const useGetLibraryAssets = (params: LibraryAssetsQueryData) => {
    return useQuery({
        queryKey: [MEDIA_LIBRARY_QUERY_KEY, params],
        queryFn: () => getLibraryAssets(params),
    });
};

// Delete Library Asset (Optional, but useful for admin/user)
const deleteLibraryAsset = async (id: string): Promise<void> => {
    await api.delete(`/library-assets/${id}`);
};

export const useDeleteLibraryAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteLibraryAsset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MEDIA_LIBRARY_QUERY_KEY] });
        },
    });
};

// Update Library Asset
const updateLibraryAsset = async ({ id, data }: { id: string; data: Partial<CreateLibraryAssetDto> }): Promise<LibraryAsset> => {
    const { data: responseData } = await api.patch<LibraryAsset>(`/library-assets/${id}`, data);
    return responseData;
};

export const useUpdateLibraryAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateLibraryAsset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MEDIA_LIBRARY_QUERY_KEY] });
            toast.success('Asset updated successfully');
        },
        onError: (error) => {
            console.error('Failed to update asset:', error);
            toast.error('Failed to update asset');
        }
    });
};
