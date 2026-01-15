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

export type MatchingPointActivityType = 'CAMPAIGN_CREATION' | 'REFERRAL' | 'MEMBERSHIP_PAYMENT' | 'MANUAL_ADJUSTMENT' | 'REWARD_REDEMPTION';

export interface GetMatchingPointsHistoryParams {
    page?: number;
    limit?: number;
    activity_type?: MatchingPointActivityType;
    search?: string;
}

export interface MatchingPointHistoryItem {
    id: string;
    // Handle both snake_case (legacy/DB) and camelCase (API response)
    created_at?: string;
    createdAt?: string;

    activity_type?: MatchingPointActivityType;
    activityType?: MatchingPointActivityType;

    description: string;
    points: number;

    balance_after?: number;
    balanceAfter?: number;
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


// --- Matching Points Rewards ---

export type TargetAudience = 'BUSINESS_ONLY' | 'PARTICIPANT_ONLY' | 'BOTH';

export interface CreateMatchingRewardDto {
    title: string;
    short_description: string;
    long_description: string;
    main_image: string;
    gallery_images: string[];
    required_points: number;
    target_audience: TargetAudience;
    quantity: number;
    start_datetime: string;
    end_datetime: string;
}

export interface UpdateMatchingRewardDto extends Partial<CreateMatchingRewardDto> {}

export interface MatchingPointReward {
    id: string;
    title: string;
    // API Response uses camelCase
    shortDescription?: string;
    short_description?: string; // legacy support

    longDescription?: string;
    long_description?: string; // legacy support

    mainImage?: string;
    main_image?: string; // legacy support

    galleryImages?: string[];
    gallery_images?: string[]; // legacy support

    requiredPoints?: number;
    required_points?: number; // legacy support

    targetAudience?: TargetAudience;
    target_audience?: TargetAudience; // legacy support

    quantity: number;

    startDatetime?: string;
    start_datetime?: string; // legacy support

    endDatetime?: string;
    end_datetime?: string; // legacy support

    // Status
    isSuspended?: boolean; // New field from API
    is_active?: boolean; // Legacy inference

    createdAt?: string;
    created_at?: string; // legacy support
    updatedAt?: string;
    updated_at?: string; // legacy support

    // Computed/Additional fields for frontend mapping
    pointsRequired?: number; // alias for required_points/requiredPoints
    image?: string; // alias for main_image/mainImage
    disabled?: boolean; // mapped from !is_active or isSuspended
}

export interface GetRewardsParams {
    page?: number;
    limit?: number;
    search?: string;
    min_points?: number;
    max_points?: number;
    target_audience?: TargetAudience;
    start_date?: string;
    end_date?: string;
    userType?: string; // For public endpoint filtering - kept for backward compatibility if needed, though replaced by target_audience
}

export interface PaginatedRewardsResponse {
    data: MatchingPointReward[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
