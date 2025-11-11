// src/lib/mock-data/partners.ts

export interface Partner {
  id: string;
  name: string;
  type: 'Co-Brand' | 'White-Label';
  status: 'active' | 'inactive';
  brandingPermissions: {
    logo: boolean;
    colors: boolean;
    textLock: boolean; // Ability to lock certain text elements
  };
  subdomain: string; // e.g., "partnername.mcomrewards.com"
  domainRouting?: string; // Optional: custom domain
  revenueSharing: string; // e.g., "10% commission", "Fixed Fee"
  performanceMetrics?: { // Placeholder for future integration
    totalUsers: number;
    totalRewardsClaimed: number;
    revenueGenerated: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const mockPartners: Partner[] = [
  {
    id: 'partner-1',
    name: 'Global Brands Inc.',
    type: 'Co-Brand',
    status: 'active',
    brandingPermissions: {
      logo: true,
      colors: false,
      textLock: true,
    },
    subdomain: 'globalbrands',
    revenueSharing: '15% Commission',
    performanceMetrics: {
      totalUsers: 15000,
      totalRewardsClaimed: 5000,
      revenueGenerated: 75000,
    },
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-10-20T14:30:00Z'),
  },
  {
    id: 'partner-2',
    name: 'Local Community Hub',
    type: 'White-Label',
    status: 'active',
    brandingPermissions: {
      logo: true,
      colors: true,
      textLock: false,
    },
    subdomain: 'communityhub',
    domainRouting: 'communityrewards.com',
    revenueSharing: 'Fixed Fee + 5% Commission',
    performanceMetrics: {
      totalUsers: 5000,
      totalRewardsClaimed: 1200,
      revenueGenerated: 15000,
    },
    createdAt: new Date('2023-06-01T10:00:00Z'),
    updatedAt: new Date('2024-11-01T11:00:00Z'),
  },
  {
    id: 'partner-3',
    name: 'Tech Innovators',
    type: 'Co-Brand',
    status: 'inactive',
    brandingPermissions: {
      logo: true,
      colors: false,
      textLock: true,
    },
    subdomain: 'techinnovators',
    revenueSharing: '20% Commission',
    createdAt: new Date('2024-03-20T14:00:00Z'),
    updatedAt: new Date('2024-09-01T08:00:00Z'),
  },
  {
    id: 'partner-4',
    name: 'Fashion Forward',
    type: 'White-Label',
    status: 'active',
    brandingPermissions: {
      logo: true,
      colors: true,
      textLock: false,
    },
    subdomain: 'fashionrewards',
    revenueSharing: 'Fixed Fee',
    createdAt: new Date('2024-07-01T12:00:00Z'),
    updatedAt: new Date('2024-07-01T12:00:00Z'),
  },
];
