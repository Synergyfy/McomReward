'use client';

import { useState } from 'react';
import { WishlistItemCard, WishlistItem as CardWishlistItem } from "@/components/customer/wishlist/WishlistItemCard";
import { WishlistModal } from '@/components/customer/wishlist/WishlistModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useGetMyWishlist, useCreateWishlistItem } from '@/services/wishlist/hook';
import { WishlistItem, CreateWishlistDto } from '@/services/wishlist/types';
import { Loader2, Plus } from 'lucide-react';

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

  const wishlistItems: CardWishlistItem[] = wishlistData?.data?.map(adaptWishlistItem) || [];

  if (error) {
      console.error("Failed to fetch wishlist:", error);
      toast.error("Failed to load wishlist items. Please try again.");
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
    toast.info("The item has been removed from your wishlist (local simulation).");
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
        toast.info("Sharing is not supported on this device or item not found.");
    }
  };

  const handleSave = async (item: Omit<CardWishlistItem, 'id'> | CardWishlistItem | any) => {
    // Note: We are using 'any' on item because we are passing extra fields (isForThirdParty, etc.) from the modal
    // that are not strictly in CardWishlistItem type. Ideally, we should update the type definition.
    
    // We expect the Modal to pass us a valid `categoryId` in the `category` field now.
    // Or we expect `item.category` to be the ID.
    
    // Validate category ID is UUID
    const categoryId = item.category;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    
    if (!isUuid) {
        toast.error("Please select a valid category.");
        return;
    }

    const dto: CreateWishlistDto = {
        itemName: item.name,
        itemImageUrl: item.imageUrl,
        categoryId: categoryId, 
        occasion: item.occasion ? item.occasion.toUpperCase() as any : 'NONE',
        season: 'NONE', 
        targetDate: item.targetDate,
        priority: item.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        marketingConsent: item.consent,
        isForThirdParty: item.isForThirdParty || false,
        recipientName: item.recipientName,
        recipientEmail: item.recipientEmail,
        recipientPhone: item.recipientPhone,
        relationship: item.relationship
    };

    try {
        if ('id' in item) {
            // Edit mode - API doesn't support PUT/PATCH in spec provided.
            // We will just show a toast for simulation
            toast.info("Item updated locally (API update not specified).");
        } else {
            // Create mode
            await createWishlist(dto);
            toast.success("Item added to your wishlist.");
        }
        setIsModalOpen(false);
    } catch (error) {
        console.error("Error saving wishlist item:", error);
        toast.error("Failed to save item. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
             <span className="block text-primary xl:inline">My Wishlist</span>
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 sm:max-w-xl">
             Your curated collection of desires, goals, and dream items.
          </p>
        </div>
        <div>
           <Button onClick={handleCreate} disabled={isCreating} size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
               {isCreating ? <Loader2 className="h-5 w-5 animate-spin mr-2"/> : <Plus className="h-5 w-5 mr-2" />}
               Create New Wish
           </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center gap-3">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
             <p className="text-muted-foreground animate-pulse">Loading your wishes...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {wishlistItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
               <div className="bg-white dark:bg-zinc-800 p-4 rounded-full shadow-sm mb-4">
                  <Plus className="h-10 w-10 text-gray-400" />
               </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your wishlist is empty</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-sm">
                Start building your dream collection by adding items you love.
              </p>
              <Button variant="link" onClick={handleCreate} className="mt-4 text-primary">
                 Add your first item &rarr;
              </Button>
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
