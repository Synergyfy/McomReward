// Network Contacts Types

export type LocationTag = "Nearby" | "Hyperlocal" | "National";
export type RelationshipTag = "Partner" | "Supplier" | "Affiliate" | "Customer";
export type SourceTag = "User-submitted" | "Platform" | "Plaque" | "Affiliate";
export type ContactStatus = "Active" | "Pending" | "Inactive";

export interface NetworkContact {
    id: string;
    fullName: string;
    businessName?: string;
    email?: string;
    phone?: string;
    locationTag: LocationTag;
    relationshipTag: RelationshipTag;
    sourceTag: SourceTag;
    status: ContactStatus;
    hasPermission: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactDto {
    fullName: string;
    businessName?: string;
    email?: string;
    phone?: string;
    locationTag: LocationTag;
    relationshipTag: RelationshipTag;
    hasPermission: boolean;
}

export interface UpdateContactDto {
    fullName?: string;
    businessName?: string;
    email?: string;
    phone?: string;
    locationTag?: LocationTag;
    relationshipTag?: RelationshipTag;
    hasPermission?: boolean;
    status?: ContactStatus;
}

export interface NetworkContactsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    locationTag?: LocationTag;
    relationshipTag?: RelationshipTag;
    sourceTag?: SourceTag;
    status?: ContactStatus;
    sortBy?: "name" | "newest" | "oldest" | "active";
}

export interface NetworkContactsResponse {
    data: NetworkContact[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    contactProgress?: {
        completed: number;
        required: number;
    };
}

export interface BulkContactImportDto {
    contacts: CreateContactDto[];
}
