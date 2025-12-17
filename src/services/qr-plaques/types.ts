export interface QrPlaque {
  id: string;
  name: string;
  description?: string;
  actionText?: string;
  footerText?: string;
  contentUrl?: string;
  qrCodeUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SOLD' | 'RETIRED' | 'LOST' | 'FOR_SALE';
  price?: number | null;
  assignedPartnerId?: string;
  assignedBusinessId?: string;
  networkContactId?: string;
  ownerName?: string; // For Admin List
  groupName?: string; // For Admin List
  scans?: number; // Optional, based on mock
  redemptions?: number; // Optional
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQrPlaqueRequest {
  name: string;
  description: string;
  actionText: string;
  footerText: string;
  contentUrl: string;
}

export interface UpdateQrPlaqueRequest {
  name?: string;
  description?: string;
  actionText?: string;
  footerText?: string;
  contentUrl?: string;
  status?: string;
  price?: number;
  assignedPartnerId?: string;
}

export interface AdminUpdateQrPlaqueRequest extends UpdateQrPlaqueRequest {
  qrCodeUrl?: string;
  assignedBusinessId?: string;
  networkContactId?: string;
}

export interface QrPlaqueResponse {
  data: QrPlaque[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
