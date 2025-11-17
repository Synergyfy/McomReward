
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCoupon, useUpdateCoupon } from '@/services/coupon';
import { Coupon } from '@/services/coupon/types';
import { format } from 'date-fns';

interface AddEditCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Coupon; // Optional data for editing
  onSave: (coupon: Coupon) => void;
}

export function AddEditCouponModal({ isOpen, onClose, initialData, onSave }: AddEditCouponModalProps) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setDiscountType(initialData.discountType);
      setDiscountValue(initialData.discountValue.toString());
      setExpiresAt(format(new Date(initialData.expiresAt), "yyyy-MM-dd'T'HH:mm"));
    } else {
      setCode('');
      setDiscountType('percentage');
      setDiscountValue('');
      setExpiresAt('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    const couponData = {
      code,
      discount_type: discountType,
      discount_value: Number(discountValue),
      expires_at: new Date(expiresAt).toISOString(),
    };

    try {
      let savedCoupon: Coupon;
      if (initialData) {
        savedCoupon = await updateCouponMutation.mutateAsync({ id: initialData.id, ...couponData });
      } else {
        savedCoupon = await createCouponMutation.mutateAsync(couponData);
      }
      onSave(savedCoupon);
      onClose();
    } catch (error) {
      console.error('Failed to save coupon:', error);
    }
  };

  const isPending = createCouponMutation.isPending || updateCouponMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-type">Discount Type</Label>
            <Select onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)} value={discountType}>
              <SelectTrigger>
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-value">Discount Value</Label>
            <Input id="discount-value" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires-at">Expires At</Label>
            <Input id="expires-at" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : initialData ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
