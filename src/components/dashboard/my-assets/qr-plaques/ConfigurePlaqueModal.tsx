'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Mock data for available campaigns/offers
const mockOffers = [
  { id: 'offer-1', name: 'Summer Voucher ($50)' },
  { id: 'offer-2', name: 'Discount Coupon (20% off)' },
  { id: 'offer-3', name: 'Free Coffee Reward' },
];

interface ConfigurePlaqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { linkedOffer: string; partnerCanLink: boolean }) => void;
  plaque: { id: string; linkedOffer: string | null; partner: string } | null;
}

export default function ConfigurePlaqueModal({ isOpen, onClose, onSave, plaque }: ConfigurePlaqueModalProps) {
  const [linkedOffer, setLinkedOffer] = useState('');
  const [partnerCanLink, setPartnerCanLink] = useState(false);

  useEffect(() => {
    if (plaque) {
      setLinkedOffer(plaque.linkedOffer || '');
    }
  }, [plaque]);

  const handleSave = () => {
    onSave({ linkedOffer, partnerCanLink });
  };

  const isAssigned = plaque && plaque.partner !== 'Unassigned' && plaque.partner !== 'Pending Assignment';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Plaque {plaque?.id}</DialogTitle>
          <DialogDescription>
            Choose which offer this plaque should link to when scanned.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="linkedOffer">Link to Offer</Label>
            <Select value={linkedOffer} onValueChange={setLinkedOffer}>
              <SelectTrigger id="linkedOffer">
                <SelectValue placeholder="Select an offer" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="none">None</SelectItem>
                {mockOffers.map(offer => (
                  <SelectItem key={offer.id} value={offer.name}>{offer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isAssigned && (
            <div className="flex items-center space-x-2 mt-4">
              <Switch id="partnerCanLink" checked={partnerCanLink} onCheckedChange={setPartnerCanLink} />
              <Label htmlFor="partnerCanLink">Allow partner to link their own offers</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
