'use client';

import { WishlistItemCard, WishlistItem } from "@/components/customer/wishlist/WishlistItemCard";

const mockWishlistItems: WishlistItem[] = [
  {
    id: '1',
    name: 'Gourmet Burger Fest',
    category: 'Food',
    priority: 'High',
    occasion: 'Birthday',
    targetDate: '2025-12-10',
    consent: true,
  },
  {
    id: '2',
    name: 'Winter Wonderland Deals',
    category: 'Shopping',
    priority: 'Medium',
    consent: false,
  },
  {
    id: '3',
    name: 'Tech Gadgets',
    category: 'Electronics',
    priority: 'Low',
    consent: true,
  },
];

export default function WishlistPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">My Wishlist</h1>
        <p className="mt-4 text-lg text-gray-600">Your saved items and experiences.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockWishlistItems.map((item) => (
          <WishlistItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
