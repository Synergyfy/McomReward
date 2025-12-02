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
