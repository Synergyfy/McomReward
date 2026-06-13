// Customer contact types for /network/customers endpoints

export type LocationTag = 'nearby' | 'hyperlocal' | 'national';
export type RelationshipTag = 'partner' | 'supplier' | 'affiliate';
export type CustomerStatus = 'pending' | 'accepted' | 'rejected';

export interface Customer {
    id: string;
    fullName: string;
    businessName?: string;
    email?: string;
    phone: string;
    hasPermission: boolean;
    locationTag: LocationTag;
    relationshipTag: RelationshipTag;
    status: CustomerStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerDto {
    fullName: string;
    businessName?: string;
    email?: string;
    phone: string;
    hasPermission: boolean;
    locationTag: LocationTag;
    relationshipTag: RelationshipTag;
}

export interface BulkImportCustomerDto {
    networks: CreateCustomerDto[];
    hasPermission: boolean;
}

export interface CustomerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    businessId?: string;
    status?: CustomerStatus | 'all';
    sortBy?: 'createdAt' | 'fullName' | 'email';
    sortOrder?: 'ASC' | 'DESC';
}

export interface CustomerResponse {
    data: Customer[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}

export interface BulkImportResponse {
    message: string;
    imported: number;
    failed: number;
    errors?: string[];
}
