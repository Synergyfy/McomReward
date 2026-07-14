// --- Existing types ---
export interface BusinessLevel {
    id: string;
    name: string;
    minPoints: number;
    maxPoints: number | null;
    minCampaigns: number;
    maxCampaigns: number | null;
    privileges: string[];
    description: string;
    created_at: string;
    updated_at: string;
}

export interface CustomerBadge {
    id: string;
    name: string;
    minPoints: number;
    maxPoints: number | null;
    minCampaignsJoined: number;
    maxCampaignsJoined: number | null;
    privileges: string[];
    description: string;
    created_at: string;
    updated_at: string;
}

export interface BusinessProgression {
    id: string;
    businessId: string;
    currentLevel: BusinessLevel;
    currentPoints: number;
    totalCampaignsCreated: number;
    isManualOverride: boolean;
    updated_at: string;
}

export interface CustomerProgression {
    id: string;
    participantId: string;
    currentBadge: CustomerBadge;
    currentPoints: number;
    totalCampaignsJoined: number;
    isManualOverride: boolean;
    updated_at: string;
}

export interface ProgressionHistory {
    fromLevelName: string;
    toLevelName: string;
    reason: string;
    changedBy: string;
    created_at: string;
}

// --- New Backend Response Types ---

export interface ProgressionRequirement {
    name: string;
    key: string;
    current: number | string | any;
    target: number | string | any;
    remaining: number | string | any;
    isCompleted: boolean;
}

export interface ProgressionLevel {
    level: string;
    isCurrent: boolean;
    requirements: ProgressionRequirement[];
    benefits: Record<string, any>;
}

export interface MyProgressionResponse {
    tierName: string;
    currentLevel: string;
    metrics: Record<string, any>;
    nextLevels: ProgressionLevel[];
}

// --- Customer/Participant Progression ---

export interface ParticipantBadge {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    priority: number;
    multiplier: number;
    benefits: string[];
    minPoints: number;
    maxPoints: number | null;
    privileges: string[] | null;
    color: string;
}

export interface ParticipantProgressionResponse {
    currentPoints: number;
    currentBadge: ParticipantBadge;
    nextBadge: ParticipantBadge | null;
    pointsNeeded: number;
    remainingPoints: number;
    progressPercentage: number;
    allBadges: ParticipantBadge[];
}

// Payloads
export interface CreateBusinessLevelPayload {
    name: string;
    minPoints: number;
    maxPoints?: number;
    minCampaigns: number;
    maxCampaigns?: number;
    privileges?: string[];
    description?: string;
}

export type UpdateBusinessLevelPayload = Partial<CreateBusinessLevelPayload>;

export interface CreateCustomerBadgePayload {
    name: string;
    minPoints: number;
    maxPoints?: number;
    minCampaignsJoined: number;
    maxCampaignsJoined?: number;
    privileges?: string[];
    description?: string;
}

export type UpdateCustomerBadgePayload = Partial<CreateCustomerBadgePayload>;

export interface OverrideBusinessTierPayload {
    businessId: string;
    levelId: string;
    adminId: string;
}

export interface OverrideCustomerBadgePayload {
    participantId: string;
    badgeId: string;
    adminId: string;
}
