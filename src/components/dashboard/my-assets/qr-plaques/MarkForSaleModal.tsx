'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MarkForSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (price: string) => void;
  plaqueId: string | null;
}

export default function MarkForSaleModal({ isOpen, onClose, onConfirm, plaqueId }: MarkForSaleModalProps) {
  const [price, setPrice] = useState('');

  const handleConfirm = () => {
    if (!price || parseFloat(price) <= 0) {
      alert('Please enter a valid price.');
      return;
    }
    onConfirm(`£${parseFloat(price).toFixed(2)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Plaque {plaqueId} for Sale</DialogTitle>
          <DialogDescription>
            Set a price for this plaque. It will be listed as available for purchase by other businesses.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (£)
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 25.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm Sale Price</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
