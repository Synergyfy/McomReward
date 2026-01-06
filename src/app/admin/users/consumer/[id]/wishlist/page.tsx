'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import WishlistContent from '@/components/customer/wishlist/WishlistContent';
import { useAdminParticipantWishlist } from '@/services/admin/hook';

export default function AdminWishlistPage() {
  const params = useParams();
  const id = params?.id as string;
  const page = 1;
  const limit = 100;

  const { data: wishlistData, isLoading: loading, error } = useAdminParticipantWishlist(id, page, limit);

  return (
    <WishlistContent
      data={wishlistData}
      isLoading={loading}
      error={error}
      isAdmin={true} // Disable editing
    />
  );
}
