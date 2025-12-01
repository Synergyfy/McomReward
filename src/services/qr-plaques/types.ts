import { DateRange } from 'react-day-picker';

export interface QrPlaque {
  id: string;
  partner: string;
  status: 'Active' | 'Inactive' | 'For Sale' | 'Pending Assignment';
  scans: number;
  redemptions: number;
  linkedOffer: string | null;
  price: string | null;
}

export interface QrPlaqueChartData {
  name: string; // e.g., 'Mon', 'Tue'
  scans: number;
  redemptions: number;
}

export interface QrPlaquesResponse {
    plaques: QrPlaque[];
    chartData: QrPlaqueChartData[];
    // You might also want to include pagination meta data here if the API supports it
    // total: number;
    // page: number;
    // limit: number;
}

export interface QrPlaqueQueryDto {
    businessId?: string; // For admin impersonation
    status?: 'all' | 'active' | 'inactive' | 'for-sale' | 'pending';
    dateRange?: DateRange;
}