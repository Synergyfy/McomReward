export type LocationTag = "nearby" | "hyperlocal" | "national";
export type RelationshipTag = "partner" | "supplier" | "affiliate" | "customer";
export type SourceTag = "User-submitted" | "Platform" | "Plaque" | "Affiliate";
export type ContactStatus = "pending" | "accepted" | "rejected";

export interface NetworkContact {
    id: string;
    fullName: string;
    businessName?: string;
    email?: string;
    phone: string;
    locationTag: LocationTag;
    relationshipTag: RelationshipTag;
    sourceTag?: SourceTag; // Optional in response example?? API response didn't show it but it might be there. Will make optional to be safe.
    status: ContactStatus;
    hasSharingPermission: boolean; // Renamed from hasPermission
    permission?: string; // Add this field from response
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface CreateContactDto {
    fullName: string;
    businessName?: string;
    email?: string;
    phone: string;
    locationTag: LocationTag;
    relationshipTag: RelationshipTag;
    hasPermission?: boolean;
}

export type CreateNetworkDto = CreateContactDto;

export interface UpdateContactDto {
    fullName?: string;
    businessName?: string;
    email?: string;
    phone?: string;
    locationTag?: LocationTag;
    relationshipTag?: RelationshipTag;
    hasPermission?: boolean;
}

export type UpdateNetworkDto = UpdateContactDto;

export interface NetworkContactsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    businessId?: string;
    locationTag?: LocationTag | "all"; // UI sends 'all'
    relationshipTag?: RelationshipTag | "all"; // UI sends 'all'
    status?: ContactStatus | "all"; // UI sends 'all'
    sortBy?: "createdAt" | "fullName" | "email" | "name" | "newest" | "oldest" | "active";
    sortOrder?: "ASC" | "DESC";
}

export interface NetworkContactsResponse {
    data: NetworkContact[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        nextPage: number | null;
        prevPage: number | null;
    };
    // Keeping this optional as it was in previous mock but not in new response example
    contactProgress?: {
        completed: number;
        required: number;
    };
}

export interface BulkContactImportDto {
    contacts: CreateContactDto[];
}
