'use client';

import { useState } from 'react';
import { WishlistItemCard, WishlistItem } from "@/components/customer/wishlist/WishlistItemCard";
import { WishlistModal } from '@/components/customer/wishlist/WishlistModal';
import { Button } from '@/components/ui/button';

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
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(mockWishlistItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<WishlistItem | undefined>(undefined);

  const handleCreate = () => {
    setItemToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: WishlistItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  const handleShare = (id: string) => {
    const item = wishlistItems.find(item => item.id === id);
    if (item && navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out my wishlist item: ${item.name}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert(`Share functionality not available or item not found.`);
    }
  };

  const handleSave = (item: Omit<WishlistItem, 'id'> | WishlistItem) => {
    if ('id' in item) {
      // Editing existing item
      setWishlistItems(wishlistItems.map(i => i.id === item.id ? item as WishlistItem : i));
    } else {
      // Creating new item
      const newItem: WishlistItem = {
        id: new Date().toISOString(), // simple unique id
        ...item,
        category: 'uncategorized',
        name: item.name || 'Unnamed Item',
        priority: 'Medium',
        consent: false

      };
      setWishlistItems([...wishlistItems, newItem]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">My Wishlist</h1>
        <p className="mt-4 text-lg text-gray-600">Your saved items and experiences.</p>
      </div>
      <div className="text-center">
        <Button onClick={handleCreate}>Create Wishlist</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wishlistItems.map((item) => (
          <WishlistItemCard 
            key={item.id} 
            item={item} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onShare={handleShare} 
          />
        ))}
      </div>
      <WishlistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        itemToEdit={itemToEdit} 
      />
    </div>
  );
}
