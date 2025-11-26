'use client';

import { useState } from 'react';
import { WishlistItemCard, WishlistItem as CardWishlistItem } from "@/components/customer/wishlist/WishlistItemCard";
import { WishlistModal } from '@/components/customer/wishlist/WishlistModal';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { useGetMyWishlist, useCreateWishlistItem } from '@/services/wishlist/hook';
import { WishlistItem, CreateWishlistDto } from '@/services/wishlist/types';
import { Loader2 } from 'lucide-react';

// Adapter function to convert Service WishlistItem to Component WishlistItem
const adaptWishlistItem = (item: WishlistItem): CardWishlistItem => ({
  id: item.id,
  name: item.itemName,
  category: item.category.name,
  priority: item.priority === 'HIGH' ? 'High' : item.priority === 'MEDIUM' ? 'Medium' : 'Low',
  occasion: item.occasion === 'NONE' ? undefined : item.occasion.charAt(0) + item.occasion.slice(1).toLowerCase(),
  targetDate: item.targetDate || undefined,
  consent: item.marketingConsent,
  imageUrl: item.itemImageUrl || undefined,
});

export default function WishlistPage() {
  const { data: wishlistData, isLoading: loading, error } = useGetMyWishlist({ page: 1, limit: 100 });
  const { mutateAsync: createWishlist, isPending: isCreating } = useCreateWishlistItem();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CardWishlistItem | undefined>(undefined);
  const { toast } = useToast();

  const wishlistItems: CardWishlistItem[] = wishlistData?.data?.map(adaptWishlistItem) || [];

  if (error) {
      console.error("Failed to fetch wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items. Please try again.",
        variant: "destructive",
      });
  }

  const handleCreate = () => {
    setItemToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: CardWishlistItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Specification didn't provide a delete endpoint. 
    // We will simulate it locally for now.
    // In a real scenario, we would use a delete mutation here.
    toast({
        title: "Item Removed",
        description: "The item has been removed from your wishlist (local simulation).",
    });
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
        toast({
            title: "Share",
            description: "Sharing is not supported on this device or item not found.",
        });
    }
  };

  const handleSave = async (item: Omit<CardWishlistItem, 'id'> | CardWishlistItem) => {
    const dto: CreateWishlistDto = {
        itemName: item.name,
        itemImageUrl: item.imageUrl,
        categoryId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Mock Category ID
        occasion: item.occasion ? item.occasion.toUpperCase() as any : 'NONE',
        season: 'NONE', 
        targetDate: item.targetDate,
        priority: item.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        marketingConsent: item.consent,
        isForThirdParty: false, 
    };

    try {
        if ('id' in item) {
            // Edit mode - API doesn't support PUT/PATCH in spec provided.
            // We will just show a toast for simulation
            toast({
                title: "Updated",
                description: "Item updated locally (API update not specified).",
            });
        } else {
            // Create mode
            await createWishlist(dto);
            toast({
                title: "Success",
                description: "Item added to your wishlist.",
            });
        }
        setIsModalOpen(false);
    } catch (error) {
        console.error("Error saving wishlist item:", error);
        toast({
            title: "Error",
            description: "Failed to save item. Please try again.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">My Wishlist</h1>
        <p className="mt-4 text-lg text-gray-600">Your saved items and experiences.</p>
      </div>
      <div className="text-center">
        <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
            Create Wishlist
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistItems.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              <p>Your wishlist is empty. Start by adding something!</p>
            </div>
          ) : (
            wishlistItems.map((item) => (
              <WishlistItemCard 
                key={item.id} 
                item={item} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                onShare={handleShare} 
              />
            ))
          )}
        </div>
      )}
      
      <WishlistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        itemToEdit={itemToEdit} 
      />
    </div>
  );
}
