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
    },
    {
        id: 'deal-4',
        businessId: 'biz-101',
        businessName: 'Indie Flix Cinema',
        title: '2-for-1 Movie Tickets',
        description: 'Enjoy a night out at the movies with a friend. Buy one ticket, get the second one free.',
        type: 'Package',
        value: '2-for-1',
        startDate: '2025-10-15',
        endDate: '2025-11-15',
        audience: 'Local',
        terms: 'Valid for all regular screenings. Not valid for special events or 3D movies.',
        status: 'Active',
        category: 'Entertainment',
        imageUrl: 'https://picsum.photos/seed/deal-4/400/300',
    },
    {
        id: 'deal-5',
        businessId: 'biz-212',
        businessName: 'City Spa & Wellness',
        title: '$50 Off Any Massage Service',
        description: 'Relax and rejuvenate with a professional massage. Take $50 off any of our massage packages.',
        type: 'Discount',
        value: '$50 Off',
        startDate: '2025-10-20',
        endDate: '2025-11-20',
        audience: 'Local',
        terms: 'Appointment required. Mention this deal when booking.',
        status: 'Active',
        category: 'Services',
        imageUrl: 'https://picsum.photos/seed/deal-5/400/300',
    },
    {
        id: 'deal-6',
        businessId: 'biz-333',
        businessName: 'Global Airways',
        title: '15% Off Flights to Europe',
        description: 'Plan your dream vacation! Get 15% off round-trip flights to any European destination.',
        type: 'Discount',
        value: '15% Off',
        startDate: '2025-11-01',
        endDate: '2025-12-15',
        audience: 'National',
        terms: 'Book by November 30th. Travel must be completed by March 31st, 2026.',
        status: 'Scheduled',
        category: 'Travel',
        imageUrl: 'https://picsum.photos/seed/deal-6/400/300',
    }
];
