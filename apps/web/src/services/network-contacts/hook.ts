import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
    NetworkContact,
    NetworkContactsResponse,
    NetworkContactsQueryParams,
    CreateContactDto,
    UpdateContactDto,
    BulkContactImportDto,
} from './types';

const NETWORK_CONTACTS_QUERY_KEY = 'networkContacts';

// Real API function
const fetchNetworkContacts = async (
    params: NetworkContactsQueryParams
): Promise<NetworkContactsResponse> => {

    // Param Mapping
    const apiParams: any = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
        businessId: params.businessId,
    };

    if (params.locationTag && params.locationTag !== 'all') {
        apiParams.locationTag = params.locationTag;
    }
    if (params.relationshipTag && params.relationshipTag !== 'all') {
        apiParams.relationshipTag = params.relationshipTag;
    }
    if (params.status && params.status !== 'all') {
        apiParams.status = params.status;
    }

    // Sort Mapping
    if (params.sortBy === 'name' as any) { // 'name' comes from UI
        apiParams.sortBy = 'fullName';
        apiParams.sortOrder = 'ASC';
    } else if (params.sortBy === 'newest' as any) {
        apiParams.sortBy = 'createdAt';
        apiParams.sortOrder = 'DESC';
    } else if (params.sortBy === 'oldest' as any) {
        apiParams.sortBy = 'createdAt';
        apiParams.sortOrder = 'ASC';
    } else if (params.sortBy === 'active' as any) {
        // Fallback for active sort if not supported backend side
        apiParams.sortBy = 'createdAt';
        apiParams.sortOrder = 'DESC';
    } else {
        // Default or pass through if it matches API already
        apiParams.sortBy = params.sortBy ?? 'createdAt';
        apiParams.sortOrder = params.sortOrder ?? 'DESC';
    }

    const { data } = await api.get<NetworkContactsResponse>('/network', { params: apiParams });
    return data;
};

const fetchContactById = async (id: string): Promise<NetworkContact> => {
    const { data } = await api.get<NetworkContact>(`/network/${id}`);
    return data;
};

const createContact = async (contactData: CreateContactDto): Promise<NetworkContact> => {
    const { data } = await api.post<NetworkContact>('/network', contactData);
    return data;
};

const updateContact = async ({
    id,
    contactData,
}: {
    id: string;
    contactData: UpdateContactDto;
}): Promise<NetworkContact> => {
    const { data } = await api.patch<NetworkContact>(`/network/${id}`, contactData);
    return data;
};

const deleteContact = async (id: string): Promise<void> => {
    await api.delete(`/network/${id}`);
};

const bulkImportContacts = async (
    importData: BulkContactImportDto
): Promise<NetworkContactsResponse> => {
    const { data } = await api.post<any>('/network/bulk', {
        networks: importData.contacts,
        hasPermission: importData.contacts.some((c) => c.hasPermission) || false,
    });

    return {
        data: [],
        meta: {
            total: data.importedCount || 0,
            page: 1,
            lastPage: 1,
            nextPage: null,
            prevPage: null,
        },
    };
};

// Hooks

export const useGetNetworkContacts = (params: NetworkContactsQueryParams = {}) => {
    return useQuery({
        queryKey: [NETWORK_CONTACTS_QUERY_KEY, params],
        queryFn: () => fetchNetworkContacts(params),
    });
};

export const useGetContactById = (id: string) => {
    return useQuery({
        queryKey: [NETWORK_CONTACTS_QUERY_KEY, id],
        queryFn: () => fetchContactById(id),
        enabled: !!id,
    });
};

export const useCreateContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NETWORK_CONTACTS_QUERY_KEY] });
        },
    });
};

export const useUpdateContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NETWORK_CONTACTS_QUERY_KEY] });
        },
    });
};

export const useDeleteContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NETWORK_CONTACTS_QUERY_KEY] });
        },
    });
};

export const useBulkImportContacts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bulkImportContacts,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NETWORK_CONTACTS_QUERY_KEY] });
        },
    });
};