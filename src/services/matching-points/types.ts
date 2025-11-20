export interface AwardMatchingPointsRequest {
    email: string;
    points: number;
    description: string;
}

export interface AwardMatchingPointsResponse {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
