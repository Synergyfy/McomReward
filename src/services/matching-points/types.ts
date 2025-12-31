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

export interface ToggleMatchingPointsRequest {
    campaignId: string;
}

export interface ToggleMatchingPointsResponse {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

// New types for fetching matching points overview and history
export interface GetMatchingPointBalanceResponse {
    matching_points: number;
}

export type MatchingPointActivityType = 'CAMPAIGN_CREATION' | 'REFERRAL' | 'MEMBERSHIP_PAYMENT' | 'MANUAL_ADJUSTMENT';

export interface GetMatchingPointsHistoryParams {
    page?: number;
    limit?: number;
    activity_type?: MatchingPointActivityType;
    search?: string;
}

export interface MatchingPointHistoryItem {
    id: string;
    created_at: string; // or date? adjusting to common API patterns
    activity_type: MatchingPointActivityType;
    description: string; // or details?
    points: number; // amount?
    balance_after: number; // or just balance?
}

// Keeping the UI type for now to map to
export interface MatchingPointActivity {
    id: string;
    date: string;
    type: string;
    description: string;
    points: number;
    balance: number;
}


export interface GetMatchingPointsHistoryResponse {
    data: MatchingPointHistoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    next: number | null;
    previous: number | null;
}

export interface MatchingPointsQueryDto {
    businessId?: string; // For admin impersonation
}

// Earning Actions
export interface EarningAction {
    id: string;
    name: string;
    key: string;
    points: number;
    description?: string;
    actionParameters?: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEarningActionDto {
    name: string;
    key: string;
    points: number;
    description?: string;
    actionParameters?: Record<string, any>;
    isActive?: boolean;
}

export type UpdateEarningActionDto = Partial<CreateEarningActionDto>;

// Participant Badges
export interface ParticipantBadge {
    id: string;
    name: string;
    minPoints: number;
    priority: number;
    multiplier: number;
    benefits: string[];
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateParticipantBadgeDto {
    name: string;
    minPoints: number;
    priority: number;
    multiplier?: number;
    benefits?: string[];
    color?: string;
}

export type UpdateParticipantBadgeDto = Partial<CreateParticipantBadgeDto>;
