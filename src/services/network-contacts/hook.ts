import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    NetworkContact,
    NetworkContactsResponse,
    NetworkContactsQueryParams,
    CreateContactDto,
    UpdateContactDto,
    BulkContactImportDto,
    LocationTag,
    RelationshipTag,
    SourceTag,
    ContactStatus,
} from './types';

const NETWORK_CONTACTS_QUERY_KEY = 'networkContacts';

// Mock data storage (simulates a database)
let mockContacts: NetworkContact[] = [
    {
        id: '1',
        fullName: 'John Smith',
        businessName: 'Smith & Co. Bakery',
        email: 'john@smithbakery.com',
        phone: '+44 20 1234 5678',
        locationTag: 'Nearby',
        relationshipTag: 'Partner',
        sourceTag: 'User-submitted',
        status: 'Active',
        hasPermission: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
    },
    {
        id: '2',
        fullName: 'Sarah Johnson',
        businessName: 'Fresh Produce Ltd',
        email: 'sarah@freshproduce.co.uk',
        phone: '+44 20 9876 5432',
        locationTag: 'Hyperlocal',
        relationshipTag: 'Supplier',
        sourceTag: 'Platform',
        status: 'Active',
        hasPermission: true,
        createdAt: '2024-01-20T14:20:00Z',
        updatedAt: '2024-01-20T14:20:00Z',
    },
    {
        id: '3',
        fullName: 'Michael Chen',
        businessName: 'Tech Solutions Inc',
        email: 'michael@techsolutions.com',
        phone: '+44 20 5555 1234',
        locationTag: 'National',
        relationshipTag: 'Customer',
        sourceTag: 'Plaque',
        status: 'Pending',
        hasPermission: false,
        createdAt: '2024-02-01T09:15:00Z',
        updatedAt: '2024-02-01T09:15:00Z',
    },
    {
        id: '4',
        fullName: 'Emma Williams',
        businessName: 'Williams Marketing Agency',
        email: 'emma@williamsmarketing.com',
        phone: '+44 20 7777 8888',
        locationTag: 'Nearby',
        relationshipTag: 'Affiliate',
        sourceTag: 'Affiliate',
        status: 'Active',
        hasPermission: true,
        createdAt: '2024-02-05T11:45:00Z',
        updatedAt: '2024-02-05T11:45:00Z',
    },
    {
        id: '5',
        fullName: 'David Brown',
        businessName: 'Brown Construction',
        email: 'david@brownconstruction.co.uk',
        phone: '+44 20 3333 4444',
        locationTag: 'Hyperlocal',
        relationshipTag: 'Partner',
        sourceTag: 'User-submitted',
        status: 'Active',
        hasPermission: true,
        createdAt: '2024-02-10T16:00:00Z',
        updatedAt: '2024-02-10T16:00:00Z',
    },
    {
        id: '6',
        fullName: 'Lisa Anderson',
        businessName: 'Anderson Consulting',
        email: 'lisa@andersonconsulting.com',
        locationTag: 'National',
        relationshipTag: 'Customer',
        sourceTag: 'Platform',
        status: 'Active',
        hasPermission: true,
        createdAt: '2024-02-12T08:30:00Z',
        updatedAt: '2024-02-12T08:30:00Z',
    },
    {
        id: '7',
        fullName: 'Robert Taylor',
        businessName: 'Taylor Logistics',
        email: 'robert@taylorlogistics.co.uk',
        phone: '+44 20 6666 7777',
        locationTag: 'Nearby',
        relationshipTag: 'Supplier',
        sourceTag: 'User-submitted',
        status: 'Inactive',
        hasPermission: true,
        createdAt: '2024-01-25T13:20:00Z',
        updatedAt: '2024-01-25T13:20:00Z',
    },
    {
        id: '8',
        fullName: 'Jennifer Martinez',
        businessName: 'Martinez Design Studio',
        email: 'jennifer@martinezdesign.com',
        phone: '+44 20 8888 9999',
        locationTag: 'Hyperlocal',
        relationshipTag: 'Partner',
        sourceTag: 'Plaque',
        status: 'Active',
        hasPermission: true,
        createdAt: '2024-02-15T10:10:00Z',
        updatedAt: '2024-02-15T10:10:00Z',
    },
    {
        id: '9',
        fullName: 'James Wilson',
        businessName: 'Wilson Retail Group',
        email: 'james@wilsonretail.co.uk',
        phone: '+44 20 1111 2222',
        locationTag: 'National',
        relationshipTag: 'Customer',
        sourceTag: 'User-submitted',
        status: 'Pending',
        hasPermission: false,
        createdAt: '2024-02-18T15:45:00Z',
        updatedAt: '2024-02-18T15:45:00Z',
    },
    {
        id: '10',
        fullName: 'Patricia Garcia',
        businessName: 'Garcia Food Services',
        email: 'patricia@garciafood.com',
        phone: '+44 20 4444 5555',
        locationTag: 'Nearby',
        relationshipTag: 'Supplier',
        sourceTag: 'Affiliate',
        status: 'Active',
        hasPermission: true,
        createdAt: '2024-02-20T12:00:00Z',
        updatedAt: '2024-02-20T12:00:00Z',
    },
    {
        id: '11',
        fullName: 'Christopher Lee',
        businessName: 'Lee Financial Advisors',
        email: 'chris@leefinancial.co.uk',
        locationTag: 'Hyperlocal',
        relationshipTag: 'Customer',
        sourceTag: 'Platform',
        status: 'Active',
        hasPermission: true,
        createdAt: '2024-02-22T09:30:00Z',
        updatedAt: '2024-02-22T09:30:00Z',
    },
    {
        id: '12',
        fullName: 'Mary Thompson',
        businessName: 'Thompson Events',
        email: 'mary@thompsonevents.com',
        phone: '+44 20 2222 3333',
        locationTag: 'Nearby',
        relationshipTag: 'Partner',
        sourceTag: 'User-submitted',
        status: 'Active',
        hasPermission: true,
        createdAt: '2024-02-25T14:15:00Z',
        updatedAt: '2024-02-25T14:15:00Z',
    },
];

// Helper function to filter and sort contacts
const filterAndSortContacts = (
    contacts: NetworkContact[],
    params: NetworkContactsQueryParams
): NetworkContact[] => {
    let filtered = [...contacts];

    // Search filter
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(
            (c) =>
                c.fullName.toLowerCase().includes(searchLower) ||
                c.businessName?.toLowerCase().includes(searchLower) ||
                c.email?.toLowerCase().includes(searchLower)
        );
    }

    // Location filter
    if (params.locationTag) {
        filtered = filtered.filter((c) => c.locationTag === params.locationTag);
    }

    // Relationship filter
    if (params.relationshipTag) {
        filtered = filtered.filter((c) => c.relationshipTag === params.relationshipTag);
    }

    // Source filter
    if (params.sourceTag) {
        filtered = filtered.filter((c) => c.sourceTag === params.sourceTag);
    }

    // Status filter
    if (params.status) {
        filtered = filtered.filter((c) => c.status === params.status);
    }

    // Sorting
    switch (params.sortBy) {
        case 'name':
            filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
            break;
        case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        case 'oldest':
            filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
        case 'active':
            filtered.sort((a, b) => {
                if (a.status === 'Active' && b.status !== 'Active') return -1;
                if (a.status !== 'Active' && b.status === 'Active') return 1;
                return 0;
            });
            break;
        default:
            // Default to newest
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
};

// Mock API functions with simulated delays
const fetchNetworkContacts = async (
    params: NetworkContactsQueryParams
): Promise<NetworkContactsResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filtered = filterAndSortContacts(mockContacts, params);
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
        data: paginatedData,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
        contactProgress: {
            completed: mockContacts.length,
            required: 25, // Mock requirement
        },
    };
};

const fetchContactById = async (id: string): Promise<NetworkContact> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const contact = mockContacts.find((c) => c.id === id);
    if (!contact) {
        throw new Error('Contact not found');
    }
    return contact;
};

const createContact = async (contactData: CreateContactDto): Promise<NetworkContact> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newContact: NetworkContact = {
        id: `${Date.now()}`,
        ...contactData,
        sourceTag: 'User-submitted',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    mockContacts = [newContact, ...mockContacts];
    return newContact;
};

const updateContact = async ({
    id,
    contactData,
}: {
    id: string;
    contactData: UpdateContactDto;
}): Promise<NetworkContact> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const index = mockContacts.findIndex((c) => c.id === id);
    if (index === -1) {
        throw new Error('Contact not found');
    }

    const updatedContact: NetworkContact = {
        ...mockContacts[index],
        ...contactData,
        updatedAt: new Date().toISOString(),
    };

    mockContacts[index] = updatedContact;
    return updatedContact;
};

const deleteContact = async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const index = mockContacts.findIndex((c) => c.id === id);
    if (index === -1) {
        throw new Error('Contact not found');
    }

    mockContacts = mockContacts.filter((c) => c.id !== id);
};

const bulkImportContacts = async (
    importData: BulkContactImportDto
): Promise<NetworkContactsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newContacts: NetworkContact[] = importData.contacts.map((contact, index) => ({
        id: `${Date.now()}-${index}`,
        ...contact,
        sourceTag: 'User-submitted',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    mockContacts = [...newContacts, ...mockContacts];

    return {
        data: newContacts,
        total: newContacts.length,
        page: 1,
        limit: newContacts.length,
        totalPages: 1,
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
