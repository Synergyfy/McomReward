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

// Mock data (Modified to match new interface)
let mockContacts: NetworkContact[] = [
    {
        id: '1',
        fullName: 'John Smith',
        businessName: 'Smith & Co. Bakery',
        email: 'john@smithbakery.com',
        phone: '+44 20 1234 5678',
        locationTag: 'nearby',
        relationshipTag: 'partner',
        sourceTag: 'User-submitted',
        status: 'accepted',
        hasSharingPermission: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
    },
    {
        id: '2',
        fullName: 'Sarah Johnson',
        businessName: 'Fresh Produce Ltd',
        email: 'sarah@freshproduce.co.uk',
        phone: '+44 20 9876 5432',
        locationTag: 'hyperlocal',
        relationshipTag: 'supplier',
        sourceTag: 'Platform',
        status: 'accepted',
        hasSharingPermission: true,
        createdAt: '2024-01-20T14:20:00Z',
        updatedAt: '2024-01-20T14:20:00Z',
    },
    {
        id: '3',
        fullName: 'Michael Chen',
        businessName: 'Tech Solutions Inc',
        email: 'michael@techsolutions.com',
        phone: '+44 20 5555 1234',
        locationTag: 'national',
        relationshipTag: 'customer',
        sourceTag: 'Plaque',
        status: 'pending',
        hasSharingPermission: false,
        createdAt: '2024-02-01T09:15:00Z',
        updatedAt: '2024-02-01T09:15:00Z',
    },
    {
        id: '4',
        fullName: 'Emma Williams',
        businessName: 'Williams Marketing Agency',
        email: 'emma@williamsmarketing.com',
        phone: '+44 20 7777 8888',
        locationTag: 'nearby',
        relationshipTag: 'affiliate',
        sourceTag: 'Affiliate',
        status: 'accepted',
        hasSharingPermission: true,
        createdAt: '2024-02-05T11:45:00Z',
        updatedAt: '2024-02-05T11:45:00Z',
    },
    {
        id: '5',
        fullName: 'David Brown',
        businessName: 'Brown Construction',
        email: 'david@brownconstruction.co.uk',
        phone: '+44 20 3333 4444',
        locationTag: 'hyperlocal',
        relationshipTag: 'partner',
        sourceTag: 'User-submitted',
        status: 'accepted',
        hasSharingPermission: true,
        createdAt: '2024-02-10T16:00:00Z',
        updatedAt: '2024-02-10T16:00:00Z',
    },
    {
        id: '6',
        fullName: 'Lisa Anderson',
        businessName: 'Anderson Consulting',
        email: 'lisa@andersonconsulting.com',
        phone: '+44 20 1212 3434',
        locationTag: 'national',
        relationshipTag: 'customer',
        sourceTag: 'Platform',
        status: 'accepted',
        hasSharingPermission: true,
        createdAt: '2024-02-12T08:30:00Z',
        updatedAt: '2024-02-12T08:30:00Z',
    },
    {
        id: '7',
        fullName: 'Robert Taylor',
        businessName: 'Taylor Logistics',
        email: 'robert@taylorlogistics.co.uk',
        phone: '+44 20 6666 7777',
        locationTag: 'nearby',
        relationshipTag: 'supplier',
        sourceTag: 'User-submitted',
        status: 'rejected',
        hasSharingPermission: true,
        createdAt: '2024-01-25T13:20:00Z',
        updatedAt: '2024-01-25T13:20:00Z',
    },
    {
        id: '8',
        fullName: 'Jennifer Martinez',
        businessName: 'Martinez Design Studio',
        email: 'jennifer@martinezdesign.com',
        phone: '+44 20 8888 9999',
        locationTag: 'hyperlocal',
        relationshipTag: 'partner',
        sourceTag: 'Plaque',
        status: 'accepted',
        hasSharingPermission: true,
        createdAt: '2024-02-15T10:10:00Z',
        updatedAt: '2024-02-15T10:10:00Z',
    },
    {
        id: '9',
        fullName: 'James Wilson',
        businessName: 'Wilson Retail Group',
        email: 'james@wilsonretail.co.uk',
        phone: '+44 20 1111 2222',
        locationTag: 'national',
        relationshipTag: 'customer',
        sourceTag: 'User-submitted',
        status: 'pending',
        hasSharingPermission: false,
        createdAt: '2024-02-18T15:45:00Z',
        updatedAt: '2024-02-18T15:45:00Z',
    },
    {
        id: '10',
        fullName: 'Patricia Garcia',
        businessName: 'Garcia Food Services',
        email: 'patricia@garciafood.com',
        phone: '+44 20 4444 5555',
        locationTag: 'nearby',
        relationshipTag: 'supplier',
        sourceTag: 'Affiliate',
        status: 'accepted',
        hasSharingPermission: true,
        createdAt: '2024-02-20T12:00:00Z',
        updatedAt: '2024-02-20T12:00:00Z',
    },
    {
        id: '11',
        fullName: 'Christopher Lee',
        businessName: 'Lee Financial Advisors',
        email: 'chris@leefinancial.co.uk',
        phone: '+44 20 5656 7878',
        locationTag: 'hyperlocal',
        relationshipTag: 'customer',
        sourceTag: 'Platform',
        status: 'accepted',
        hasSharingPermission: true,
        createdAt: '2024-02-22T09:30:00Z',
        updatedAt: '2024-02-22T09:30:00Z',
    },
    {
        id: '12',
        fullName: 'Mary Thompson',
        businessName: 'Thompson Events',
        email: 'mary@thompsonevents.com',
        phone: '+44 20 2222 3333',
        locationTag: 'nearby',
        relationshipTag: 'partner',
        sourceTag: 'User-submitted',
        status: 'accepted',
        hasSharingPermission: true,
        createdAt: '2024-02-25T14:15:00Z',
        updatedAt: '2024-02-25T14:15:00Z',
    },
];

// Helper to filter/sort (Kept for fallback if needed, or referenced only by local mocks)
const filterAndSortContacts = (/* ... handled by backend now */) => [];

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
    // Keeping mock for ID fetch as endpoint isn't provided
    await new Promise((resolve) => setTimeout(resolve, 300));
    const contact = mockContacts.find((c) => c.id === id);
    if (!contact) {
        throw new Error('Contact not found');
    }
    return contact;
};

const createContact = async (contactData: CreateContactDto): Promise<NetworkContact> => {
    const { data } = await api.post<NetworkContact>('/network', contactData);

    // We can't easily push to backend list, so we won't update local mockContacts for list purposes
    // since list now comes from API. But React Query invalidation in hook will trigger refetch from API.
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
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newContacts: NetworkContact[] = importData.contacts.map((contact, index) => ({
        id: `${Date.now()}-${index}`,
        ...contact,
        hasSharingPermission: contact.hasPermission ?? false,
        sourceTag: 'User-submitted',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    mockContacts = [...newContacts, ...mockContacts];

    return {
        data: newContacts,
        meta: {
            total: newContacts.length,
            page: 1,
            lastPage: 1,
            nextPage: null,
            prevPage: null
        }
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
