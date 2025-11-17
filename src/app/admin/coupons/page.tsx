
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useGetCoupons } from '@/services/coupon';
import { AddEditCouponModal } from '@/components/admin/coupons/AddEditCouponModal';
import { CouponsDataTable } from '@/components/admin/coupons/CouponsDataTable';
import { Coupon } from '@/services/coupon/types';

export default function CouponsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditCoupon, setCurrentEditCoupon] = useState<Coupon | undefined>(undefined);
  const { data: coupons, isLoading, error } = useGetCoupons();

  const handleSaveCoupon = (coupon: Coupon) => {
    // The useCreateCoupon/useUpdateCoupon hooks already invalidate the query,
    // so the table will be updated automatically.
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setCurrentEditCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEditCoupon(undefined); // Reset currentEditCoupon when modal closes
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
        <p className="text-muted-foreground">Create and manage coupons for your platform.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Coupons</CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Coupon
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading coupons...</p>}
          {error && <p>Error fetching coupons: {error.message}</p>}
          {coupons && <CouponsDataTable coupons={coupons} onEdit={handleEditCoupon} />}
        </CardContent>
      </Card>

      <AddEditCouponModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={currentEditCoupon}
        onSave={handleSaveCoupon}
      />
    </div>
  );
}
