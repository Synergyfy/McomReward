export type DealType = 'Discount' | 'Package' | 'Gig Reward' | 'Special Offer';
export type DealAudience = 'Local' | 'National';
export type DealCategory = 'Food & Drink' | 'Retail' | 'Services' | 'Entertainment' | 'Travel';

export interface Deal {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  type: DealType;
  value: string; // e.g., "20%", "$10 Off", "Free Item"
  startDate: string;
  endDate: string;
  audience: DealAudience;
  terms: string;
  status: 'Active' | 'Scheduled' | 'Expired';
  category: DealCategory;
  imageUrl: string;
  stats: {
    views: number;
    claims: number;
    conversionRate: number;
    dailyClaims: { day: string; claims: number }[];
  };
}

export const dealsData: Deal[] = [
    {
        id: 'deal-1',
        businessId: 'biz-123',
        businessName: 'The Coffee Spot',
        title: '20% Off All Espresso Drinks',
        description: 'Start your morning right with a discount on our signature espresso beverages.',
        type: 'Discount',
        value: '20%',
        startDate: '2025-10-01',
        endDate: '2025-10-31',
        audience: 'Local',
        terms: 'Offer valid only at our downtown location. Cannot be combined with other offers.',
        status: 'Active',
        category: 'Food & Drink',
        imageUrl: 'https://picsum.photos/seed/deal-1/400/300',
        stats: {
            views: 1250,
            claims: 350,
            conversionRate: 28,
            dailyClaims: [
                { day: 'Mon', claims: 45 },
                { day: 'Tue', claims: 60 },
                { day: 'Wed', claims: 55 },
                { day: 'Thu', claims: 70 },
                { day: 'Fri', claims: 80 },
                { day: 'Sat', claims: 25 },
                { day: 'Sun', claims: 15 },
            ]
        }
    },
    {
        id: 'deal-2',
        businessId: 'biz-456',
        businessName: 'Local Threads',
        title: 'Buy One Get One Free on All T-Shirts',
        description: 'Stock up on our unique, locally designed t-shirts. Perfect for gifts!',
        type: 'Package',
        value: 'BOGO',
        startDate: '2025-11-01',
        endDate: '2025-11-15',
        audience: 'National',
        terms: 'Applies to all t-shirts of equal or lesser value. Online only.',
        status: 'Scheduled',
        category: 'Retail',
        imageUrl: 'https://picsum.photos/seed/deal-2/400/300',
        stats: {
            views: 0,
            claims: 0,
            conversionRate: 0,
            dailyClaims: []
        }
    },
    {
        id: 'deal-3',
        businessId: 'biz-789',
        businessName: 'Quick Bites',
        title: 'Free Fries with Any Burger Purchase',
        description: 'A classic combo to satisfy your cravings. Get a free side of our crispy fries.',
        type: 'Special Offer',
        value: 'Free Item',
        startDate: '2025-09-15',
        endDate: '2025-09-30',
        audience: 'Local',
        terms: 'Limit one per customer per day.',
        status: 'Expired',
        category: 'Food & Drink',
        imageUrl: 'https://picsum.photos/seed/deal-3/400/300',
        stats: {
            views: 2500,
            claims: 800,
            conversionRate: 32,
            dailyClaims: [
                { day: 'Mon', claims: 100 },
                { day: 'Tue', claims: 120 },
                { day: 'Wed', claims: 150 },
                { day: 'Thu', claims: 130 },
                { day: 'Fri', claims: 200 },
                { day: 'Sat', claims: 50 },
                { day: 'Sun', claims: 50 },
            ]
        }
    },
];
