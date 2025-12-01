// Assuming icon type is handled by React.ElementType or similar in the component
export interface DownloadCenterItem {
    id: string;
    type: string; // e.g., 'Flyer', 'Poster'
    title: string;
    format: string; // e.g., 'PDF', 'PNG'
    // icon: React.ElementType; // Cannot be part of JSON data, handled in frontend
}

export interface MarketingMaterialsResponse {
    downloadCenter: DownloadCenterItem[];
    // Add other dynamic sections like 'Automated Content Pack' or 'Custom Branding' if they come from API
    // For now, these are static elements in the mock.
}

export interface MarketingMaterialsQueryDto {
    businessId?: string; // For admin impersonation
}