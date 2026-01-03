import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
    Customer,
    CustomerResponse,
    CustomerQueryParams,
    CreateCustomerDto,
    BulkImportCustomerDto,
    BulkImportResponse,
} from './types';

const CUSTOMERS_QUERY_KEY = 'customers';

// Fetch customers list with filtering and pagination
const fetchCustomers = async (params: CustomerQueryParams): Promise<CustomerResponse> => {
    const apiParams: Record<string, unknown> = {
        page: params.page || 1,
        limit: params.limit || 10,
    };

    if (params.search) {
        apiParams.search = params.search;
    }

    if (params.businessId) {
        apiParams.businessId = params.businessId;
    }

    if (params.status && params.status !== 'all') {
        apiParams.status = params.status;
    }

    if (params.sortBy) {
        apiParams.sortBy = params.sortBy;
    }

    if (params.sortOrder) {
        apiParams.sortOrder = params.sortOrder;
    }

    const { data } = await api.get<CustomerResponse>('/network/customers', { params: apiParams });
    return data;
};

// Add a new customer
const addCustomer = async (customerData: CreateCustomerDto): Promise<Customer> => {
    const { data } = await api.post<Customer>('/network/customers', customerData);
    return data;
};

// Bulk import customers via CSV data
const bulkImportCustomers = async (importData: BulkImportCustomerDto): Promise<BulkImportResponse> => {
    const { data } = await api.post<BulkImportResponse>('/network/customers/bulk', importData);
    return data;
};

// Hook: Get customers list
export const useGetCustomers = (params: CustomerQueryParams = {}) => {
    return useQuery({
        queryKey: [CUSTOMERS_QUERY_KEY, params],
        queryFn: () => fetchCustomers(params),
    });
};

// Hook: Add customer mutation
export const useAddCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
        },
    });
};

// Hook: Bulk import customers mutation
export const useBulkImportCustomers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bulkImportCustomers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
        },
    });
};
