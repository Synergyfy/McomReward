// src/lib/mock-data/deals.ts

export type DealCategory = 'Food & Drink' | 'Retail' | 'Health & Wellness' | 'Electronics' | 'Services' | 'Travel';

export interface Deal {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_approval' | 'active' | 'rejected';
  price: number;
  sectorId: string; // Link to Sector
  groupIds?: string[]; // Optional: Link to specific groups/categories
  visibilityRules?: string; // e.g., "Only for Gold members"
  isFeatured: boolean;
  submittedByBusinessId?: string; // Optional: If submitted by a business
  businessName: string; // Added businessName
  value: string; // Added value
  startDate: Date; // Added startDate
  endDate: Date; // Added endDate
  terms: string; // Added terms
  createdAt: Date;
  updatedAt: Date;
}

export const mockDeals: Deal[] = [
  {
    id: 'deal-1',
    title: '20% Off All Espresso Drinks',
    description: 'Start your morning right with a discount on our signature espresso beverages.',
    status: 'active',
    price: 5.99,
    sectorId: 'sec-1', // Food & Drink
    isFeatured: true,
    submittedByBusinessId: 'biz-123',
    businessName: 'Coffee Corner',
    value: '20% off',
    startDate: new Date('2025-10-01T10:00:00Z'),
    endDate: new Date('2025-12-31T23:59:59Z'),
    terms: 'Valid for a limited time. Cannot be combined with other offers.',
    createdAt: new Date('2025-10-01T10:00:00Z'),
    updatedAt: new Date('2025-10-01T10:00:00Z'),
  },
  {
    id: 'deal-2',
    title: 'Buy One Get One Free on All T-Shirts',
    description: 'Stock up on our unique, locally designed t-shirts. Perfect for gifts!',
    status: 'pending_approval',
    price: 0, // Free item
    sectorId: 'sec-2', // Retail
    isFeatured: false,
    submittedByBusinessId: 'biz-456',
    businessName: 'Fashion Forward',
    value: 'BOGO',
    startDate: new Date('2025-11-01T11:30:00Z'),
    endDate: new Date('2025-11-30T23:59:59Z'),
    terms: 'Lowest priced item is free. While stocks last.',
    createdAt: new Date('2025-11-01T11:30:00Z'),
    updatedAt: new Date('2025-11-01T11:30:00Z'),
  },
  {
    id: 'deal-3',
    title: 'Free Fries with Any Burger Purchase',
    description: 'A classic combo to satisfy your cravings. Get a free side of our crispy fries.',
    status: 'rejected',
    price: 0,
    sectorId: 'sec-1', // Food & Drink
    isFeatured: false,
    submittedByBusinessId: 'biz-789',
    businessName: 'Burger Barn',
    value: 'Free Fries',
    startDate: new Date('2025-09-15T09:00:00Z'),
    endDate: new Date('2025-10-15T23:59:59Z'),
    terms: 'Offer valid with any burger purchase. One per customer.',
    createdAt: new Date('2025-09-15T09:00:00Z'),
    updatedAt: new Date('2025-09-20T14:00:00Z'),
  },
  {
    id: 'deal-4',
    title: 'Exclusive Spa Package',
    description: 'Relax and rejuvenate with our premium spa services at a discounted rate.',
    status: 'draft',
    price: 99.00,
    sectorId: 'sec-3', // Health & Wellness
    isFeatured: false,
    submittedByBusinessId: 'biz-101',
    businessName: 'Serenity Spa',
    value: '$99',
    startDate: new Date('2025-11-05T16:00:00Z'),
    endDate: new Date('2026-01-31T23:59:59Z'),
    terms: 'Appointment required. Subject to availability.',
    createdAt: new Date('2025-11-05T16:00:00Z'),
    updatedAt: new Date('2025-11-05T16:00:00Z'),
  },
  {
    id: 'deal-5',
    title: 'Limited Time: 50% Off Electronics',
    description: 'Grab the latest gadgets at half price!',
    status: 'active',
    price: 250.00,
    sectorId: 'sec-4', // Electronics (assuming a new sector)
    isFeatured: true,
    submittedByBusinessId: 'biz-202',
    businessName: 'Tech Haven',
    value: '50% Off',
    startDate: new Date('2025-11-08T08:00:00Z'),
    endDate: new Date('2025-11-15T23:59:59Z'),
    terms: 'Excludes new arrivals. While stocks last.',
    createdAt: new Date('2025-11-08T08:00:00Z'),
    updatedAt: new Date('2025-11-08T08:00:00Z'),
  },
];