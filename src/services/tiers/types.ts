export interface TierResponse {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetTiersResponse {
    data: TierResponse[];
    total: number;
    page: number;
    limit: number;
}
