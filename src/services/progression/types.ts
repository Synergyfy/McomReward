export interface BusinessLevel {
    id: string;
    name: string;
    minPoints: number;
    maxPoints?: number;
    minCampaigns: number;
    maxCampaigns?: number;
    privileges: string[];
    description: string;
    color?: string; // Added for UI compatibility, though not in doc explicitly, useful for frontend
    criteria?: string[]; // Added for UI compatibility
}

export interface CustomerBadge {
    id: string;
    name: string;
    minPoints: number;
    minCampaignsJoined: number;
    privileges: string[];
    description: string;
    color?: string; // Added for UI compatibility
    criteria?: string[]; // Added for UI compatibility
}

export interface BusinessProgression {
    id: string;
    businessId: string;
    currentPoints: number;
    totalCampaignsCreated: number;
    isManualOverride: boolean;
    currentLevel: BusinessLevel;
}

export interface CustomerProgression {
    participantId: string;
    currentBadge: CustomerBadge;
    currentPoints: number;
    totalCampaignsJoined: number;
    isManualOverride: boolean;
}

export interface ProgressionHistory {
    fromLevelName: string;
    toLevelName: string;
    reason: string;
    changedBy: string;
    created_at: string;
}

// Payloads
export interface CreateBusinessLevelPayload {
    name: string;
    minPoints: number;
    maxPoints?: number;
    minCampaigns: number;
    maxCampaigns?: number;
    privileges: string[];
    description: string;
    color?: string;
    criteria?: string[];
}

export type UpdateBusinessLevelPayload = Partial<CreateBusinessLevelPayload>;

export interface CreateCustomerBadgePayload {
    name: string;
    minPoints: number;
    minCampaignsJoined: number;
    privileges: string[];
    description: string;
    color?: string;
    criteria?: string[];
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
