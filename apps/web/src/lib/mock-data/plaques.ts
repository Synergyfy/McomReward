// src/lib/mock-data/plaques.ts

import { mockBusinessUsers } from './users'; // Assuming BusinessUser is the owner type
import { mockPlaqueGroups } from './plaque-groups';

export interface Plaque {
  id: string;
  name: string; // e.g., "Front Desk Plaque", "Entrance QR"
  description: string;
  groupId: string; // Link to PlaqueGroup
  groupName: string; // Denormalized for display
  ownerId: string; // Link to BusinessUser or PlaqueOwner
  ownerName: string; // Denormalized for display
  qrCodeData: string; // Base64 or URL of the QR code image
  status: 'Active' | 'Sold' | 'Retired' | 'Lost' | 'Inactive';
  scanCounts: number;
  lastScanTime: Date | null;
  transferHistory: {
    fromOwnerId: string;
    fromOwnerName: string;
    toOwnerId: string;
    toOwnerName: string;
    transferDate: Date;
  }[];
  locationDetails: string; // e.g., "Front Desk", "Window Display"
  createdAt: Date;
  updatedAt: Date;
}

// Helper to get owner name
const getOwnerName = (ownerId: string) => mockBusinessUsers.find(u => u.id === ownerId)?.name || 'Unknown Owner';
const getGroupName = (groupId: string) => mockPlaqueGroups.find(g => g.id === groupId)?.name || 'Unknown Group';

export const mockPlaques: Plaque[] = [
  {
    id: 'plaque-001',
    name: 'Main Entrance QR',
    description: 'Plaque for the main entrance of "The Coffee Spot".',
    groupId: 'group-dining',
    groupName: getGroupName('group-dining'),
    ownerId: 'biz-123', // The Coffee Spot
    ownerName: getOwnerName('biz-123'),
    qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
    status: 'Active',
    scanCounts: 1250,
    lastScanTime: new Date('2024-11-07T14:30:00Z'),
    transferHistory: [],
    locationDetails: 'Front Door',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-11-07T14:30:00Z'),
  },
  {
    id: 'plaque-002',
    name: 'Counter Display QR',
    description: 'Plaque for the counter display at "Local Threads".',
    groupId: 'group-retail',
    groupName: getGroupName('group-retail'),
    ownerId: 'biz-456', // Local Threads
    ownerName: getOwnerName('biz-456'),
    qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
    status: 'Active',
    scanCounts: 800,
    lastScanTime: new Date('2024-11-06T11:00:00Z'),
    transferHistory: [],
    locationDetails: 'Cashier Counter',
    createdAt: new Date('2024-02-10T11:00:00Z'),
    updatedAt: new Date('2024-11-06T11:00:00Z'),
  },
  {
    id: 'plaque-003',
    name: 'Window Decal QR',
    description: 'Plaque for the window decal of "Quick Bites".',
    groupId: 'group-dining',
    groupName: getGroupName('group-dining'),
    ownerId: 'biz-789', // Quick Bites
    ownerName: getOwnerName('biz-789'),
    qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
    status: 'Sold',
    scanCounts: 1500,
    lastScanTime: new Date('2024-10-25T09:00:00Z'),
    transferHistory: [
      {
        fromOwnerId: 'admin',
        fromOwnerName: 'Admin',
        toOwnerId: 'biz-789',
        toOwnerName: getOwnerName('biz-789'),
        transferDate: new Date('2024-03-01T12:00:00Z'),
      },
    ],
    locationDetails: 'Front Window',
    createdAt: new Date('2024-03-01T10:00:00Z'),
    updatedAt: new Date('2024-10-25T09:00:00Z'),
  },
  {
    id: 'plaque-004',
    name: 'Lost Plaque',
    description: 'Plaque reported as lost.',
    groupId: 'group-retail',
    groupName: getGroupName('group-retail'),
    ownerId: 'biz-456', // Local Threads
    ownerName: getOwnerName('biz-456'),
    qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
    status: 'Lost',
    scanCounts: 10,
    lastScanTime: null,
    transferHistory: [],
    locationDetails: 'Unknown',
    createdAt: new Date('2024-05-01T08:00:00Z'),
    updatedAt: new Date('2024-06-15T10:00:00Z'),
  },
  {
    id: 'plaque-005',
    name: 'Retired Plaque',
    description: 'Plaque retired due to business closure.',
    groupId: 'group-service',
    groupName: getGroupName('group-service'),
    ownerId: 'biz-101', // Tech Innovators (assuming this is a business user)
    ownerName: getOwnerName('biz-101'),
    qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
    status: 'Retired',
    scanCounts: 500,
    lastScanTime: new Date('2024-08-01T16:00:00Z'),
    transferHistory: [],
    locationDetails: 'Former Office',
    createdAt: new Date('2024-04-01T13:00:00Z'),
    updatedAt: new Date('2024-09-01T10:00:00Z'),
  },
];
