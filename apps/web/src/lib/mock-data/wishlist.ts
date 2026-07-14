export interface WishlistItem {
  id: string;
  itemName: string;
  category: string;
  occasion: string;
  count: number;
  targetDate: string;
}

export const wishlistData: WishlistItem[] = [
  {
    id: 'wish-1',
    itemName: 'Handmade Leather Wallet',
    category: 'Accessories',
    occasion: 'Birthday',
    count: 128,
    targetDate: '2025-11-15',
  },
  {
    id: 'wish-2',
    itemName: 'Gourmet Coffee Bean Subscription',
    category: 'Food & Drink',
    occasion: 'Anniversary',
    count: 92,
    targetDate: '2025-12-01',
  },
  {
    id: 'wish-3',
    itemName: 'Organic Spa Day Kit',
    category: 'Health & Wellness',
    occasion: 'Holiday',
    count: 74,
    targetDate: '2025-12-20',
  },
  {
    id: 'wish-4',
    itemName: 'Smart Home Hub',
    category: 'Electronics',
    occasion: 'Holiday',
    count: 65,
    targetDate: '2025-12-10',
  },
  {
    id: 'wish-5',
    itemName: 'Personalized Stationery Set',
    category: 'Office & Gifts',
    occasion: 'Just Because',
    count: 51,
    targetDate: '2025-11-30',
  },
];
