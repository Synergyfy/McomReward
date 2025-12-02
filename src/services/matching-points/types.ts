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
export interface MatchingPointsOverview {
  totalMatchingPoints: number;
  totalRegularPoints: number;
  earningRules: string[];
  redemptionRules: string[];
  adminNotices: string[];
}

export interface MatchingPointActivity {
  id: string;
  date: string;
  type: 'Earned' | 'Redeemed' | 'Adjusted';
  description: string;
  points: number;
  balance: number;
}

export interface MatchingPointsHistoryResponse {
    history: MatchingPointActivity[];
    // Add pagination meta data here if the API supports it
}

export interface MatchingPointsQueryDto {
    businessId?: string; // For admin impersonation
}