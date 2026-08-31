export interface PlaqueUserSummary {
  totalScans: number;
  scans30d: number;
  redemptions30d: number;
  commissionEarned: number;
}

export interface PlaqueUserPlaque {
  id: string;
  name: string;
  status: string;
  location: string;
  scans30d: number;
}

export type PlaqueActivityType = 'scan' | 'redemption' | 'commission';

export interface PlaqueActivity {
  id: string;
  type: PlaqueActivityType;
  description: string;
  source: string;
  scannedAt: string;
}