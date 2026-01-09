'use client';

import { useGetMyWishlist, useCreateWishlistItem, useUpdateWishlistItem, useDeleteWishlistItem } from '@/services/wishlist/hook';
import { CreateWishlistDto, UpdateWishlistDto } from '@/services/wishlist/types';
import WishlistContent from '@/components/customer/wishlist/WishlistContent';
import { WishlistFormValues } from '@/components/customer/wishlist/WishlistModal';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { data: wishlistData, isLoading: loading, error } = useGetMyWishlist({ page: 1, limit: 100 });
  const { mutateAsync: createWishlist, isPending: isCreating } = useCreateWishlistItem();
  const { mutateAsync: updateWishlist, isPending: isUpdating } = useUpdateWishlistItem();
  const { mutateAsync: deleteWishlist, isPending: isDeleting } = useDeleteWishlistItem();

  const handleCreate = async (item: WishlistFormValues) => {
    // Validate category ID is UUID
    const categoryId = item.category;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);

    if (!isUuid) {
        toast.error("Please select a valid category.");
        return;
    }

    const payload: CreateWishlistDto = {
        itemName: item.name,
        itemImageUrl: item.imageUrl,
        categoryId: categoryId,
        occasion: item.occasion ? item.occasion.toUpperCase() as 'BIRTHDAY' | 'ANNIVERSARY' | 'NONE' | 'CUSTOM' : 'NONE',
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
        await createWishlist(payload);
        toast.success("Item added to your wishlist.");
    } catch (error) {
        console.error("Error saving wishlist item:", error);
        toast.error("Failed to save item. Please try again.");
    }
  };

  const handleUpdate = async (id: string, item: WishlistFormValues) => {
    const categoryId = item.category;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    
    if (!isUuid) {
        toast.error("Please select a valid category.");
        return;
    }

    const payload: UpdateWishlistDto = {
        itemName: item.name,
        itemImageUrl: item.imageUrl,
        categoryId: categoryId, 
        occasion: item.occasion ? item.occasion.toUpperCase() as 'BIRTHDAY' | 'ANNIVERSARY' | 'NONE' | 'CUSTOM' : 'NONE',
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
        await updateWishlist({ id, data: payload });
        toast.success("Item updated successfully.");
    } catch (error) {
        console.error("Error updating wishlist item:", error);
        toast.error("Failed to update item. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteWishlist(id);
  };

  return (
    <WishlistContent
      data={wishlistData}
      isLoading={loading}
      error={error}
      isAdmin={false}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      isMutating={isCreating || isUpdating || isDeleting}
    />
  );
}
