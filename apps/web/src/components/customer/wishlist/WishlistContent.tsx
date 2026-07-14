'use client';

import { useState } from 'react';
import { WishlistItemCard, WishlistItem as CardWishlistItem } from "@/components/customer/wishlist/WishlistItemCard";
import { WishlistModal, WishlistFormValues } from '@/components/customer/wishlist/WishlistModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WishlistItem } from '@/services/wishlist/types';
import { Loader2, Plus } from 'lucide-react';
import { PaginatedResponse } from '@/services/customer-campaigns/types';

interface WishlistContentProps {
  data?: PaginatedResponse<WishlistItem>;
  isLoading: boolean;
  error: unknown;
  isAdmin?: boolean;
  onCreate?: (item: WishlistFormValues) => Promise<void>;
  onUpdate?: (id: string, item: WishlistFormValues) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isMutating?: boolean;
}

const adaptWishlistItem = (item: WishlistItem): CardWishlistItem => ({
  id: item.id,
  name: item.itemName,
  category: item.category.name,
  priority: item.priority === 'HIGH' ? 'High' : item.priority === 'MEDIUM' ? 'Medium' : 'Low',
  occasion: item.occasion === 'NONE' ? undefined : item.occasion.charAt(0) + item.occasion.slice(1).toLowerCase(),
  targetDate: item.targetDate || undefined,
  consent: item.marketingConsent,
  imageUrl: item.itemImageUrl || undefined,
  isForThirdParty: item.isForThirdParty,
  recipientName: item.recipientName || undefined,
  recipientEmail: item.recipientEmail || undefined,
  recipientPhone: item.recipientPhone || undefined,
  relationship: item.relationship || undefined,
});

export default function WishlistContent({
  data,
  isLoading,
  error,
  isAdmin = false,
  onCreate,
  onUpdate,
  onDelete,
  isMutating = false
}: WishlistContentProps) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CardWishlistItem | undefined>(undefined);

  const wishlistItems: CardWishlistItem[] = data?.data?.map(adaptWishlistItem) || [];

  if (error) {
      console.error("Failed to fetch wishlist:", error);
      toast.error("Failed to load wishlist items. Please try again.");
  }

  const handleCreate = () => {
    setItemToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: CardWishlistItem) => {
    if (isAdmin) {
       toast.info("Editing is disabled in Admin View.");
       return;
    }
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isAdmin) {
       toast.info("Deleting is disabled in Admin View.");
       return;
    }
    if (confirm("Are you sure you want to delete this item?")) {
        try {
            if (onDelete) await onDelete(id);
            toast.success("Item deleted successfully.");
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Failed to delete item.");
        }
    }
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

  const handleSave = async (item: WishlistFormValues) => {
     if (isAdmin) {
        toast.info("Modifying wishlist is disabled in Admin View.");
        setIsModalOpen(false);
        return;
     }

     if (item.id && onUpdate) {
         await onUpdate(item.id, item);
     } else if (onCreate) {
         await onCreate(item);
     }
     setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen bg-[#f9fafb] text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
             <span className="block text-primary xl:inline">My Wishlist</span>
          </h1>
          <p className="mt-3 text-lg text-gray-500 sm:max-w-xl">
             Your curated collection of desires, goals, and dream items.
          </p>
        </div>
        {!isAdmin && (
            <div>
            <Button onClick={handleCreate} disabled={isMutating} size="lg" className="rounded-full shadow-lg bg-[#f54900] hover:bg-[#f54900]/90 text-white border-none transition-all">
                {isMutating ? <Loader2 className="h-5 w-5 animate-spin mr-2"/> : <Plus className="h-5 w-5 mr-2" />}
                Create New Wish
            </Button>
            </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center gap-3">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
             <p className="text-gray-500 animate-pulse">Loading your wishes...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {wishlistItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
               <div className="bg-gray-50 p-4 rounded-full shadow-sm mb-4 border border-gray-100">
                  <Plus className="h-10 w-10 text-gray-400" />
               </div>
              <h3 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h3>
              <p className="text-gray-500 mt-2 text-center max-w-sm">
                Start building your dream collection by adding items you love.
              </p>
              {!isAdmin && (
                  <Button variant="link" onClick={handleCreate} className="mt-4 text-[#f54900] hover:text-[#f54900]/90">
                    Add your first item &rarr;
                  </Button>
              )}
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
