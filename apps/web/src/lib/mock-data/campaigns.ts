// src/lib/mock-data/campaigns.ts

export interface Campaign {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  sectorId: string;
}

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    title: 'Summer Savings Extravaganza',
    description: 'Get amazing discounts on all summer products!',
    status: 'active',
    sectorId: 'sec-1',
  },
  {
    id: 'camp-002',
    title: 'Winter Wonderland Deals',
    description: 'Cozy up with our special winter offers.',
    status: 'inactive',
    sectorId: 'sec-2',
  },
  {
    id: 'camp-003',
    title: 'New Year, New You Fitness Challenge',
    description: 'Achieve your fitness goals with exclusive rewards.',
    status: 'active',
    sectorId: 'sec-3',
  },
];
