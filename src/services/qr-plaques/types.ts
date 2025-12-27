
import { RelationshipTag, LocationTag } from '../network-contacts/types';

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
  ownerName?: string;
  groupName?: string;
  scans?: number;
  redemptions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQrPlaqueRequest {
  name: string;
  description: string;
  actionText: string;
  footerText: string;
  contentUrl: string;
  // Optional fields mainly for Admin or specific flows
  status?: string;
  price?: number;
  assignedPartnerId?: string;
  assignedBusinessId?: string;
  networkContactId?: string;
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
  // Assignment fields
  assigneeName?: string;
  assigneeEmail?: string;
  assigneeBusinessName?: string;
  relationshipTag?: RelationshipTag;
  locationTag?: LocationTag;
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
