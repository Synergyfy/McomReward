'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AdjustPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (amount: number, reason: string) => void;
  userName: string;
  currentPoints: number;
}

export function AdjustPointsModal({
  isOpen,
  onClose,
  onAdjust,
  userName,
  currentPoints,
}: AdjustPointsModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  const handleAdjust = () => {
    onAdjust(amount, reason);
    setAmount(0);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Points for {userName}</DialogTitle>
          <DialogDescription>
            Current Points: {currentPoints}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for adjustment (e.g., 'Bonus for activity', 'Correction')"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdjust}>Adjust Points</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
