export interface GroupOverview {
    name: string;
    members: number;
    totalScans: number;
    revenueSplit: string;
}

export interface Partner {
    id: string;
    name: string;
    role: string;
    status: 'Active' | 'Invited' | 'Pending';
    joined: string | null;
    commission: number;
    scans: number;
    redemptions: number;
    plaques: number;
}

export interface PartnerNetworkResponse {
    groupOverview: GroupOverview;
    partners: Partner[];
}

export interface PartnerNetworkQueryDto {
    businessId?: string; // For admin impersonation
}