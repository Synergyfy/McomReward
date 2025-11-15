'use client';

import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plaque } from '@/lib/mock-data/plaques';
import { mockBusinessUsers } from '@/lib/mock-data/users';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';

interface TransferPlaqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  plaque: Plaque | undefined;
  onTransfer: (plaqueId: string, newOwnerId: string) => void;
}

export function TransferPlaqueModal({
  isOpen,
  onClose,
  plaque,
  onTransfer,
}: TransferPlaqueModalProps) {
  const [newOwnerId, setNewOwnerId] = useState('');

  // State for Feedback Dialog (local to modal for validation errors)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{ title: string; description: React.ReactNode; actionText: string }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowLocalFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setNewOwnerId(''); // Reset on close
    }
  }, [isOpen]);

  const handleTransfer = () => {
    if (!plaque) return;

    const errors: string[] = [];
    if (!newOwnerId.trim()) {
      errors.push('Please select a new owner.');
    }
    if (newOwnerId === plaque.ownerId) {
      errors.push('The new owner cannot be the same as the current owner.');
    }

    if (errors.length > 0) {
      handleShowLocalFeedback(
        "Validation Error",
        <ul className="list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      );
      return;
    }

    onTransfer(plaque.id, newOwnerId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Plaque: {plaque?.name}</DialogTitle>
          <DialogDescription>
            Move ownership of this plaque to another business.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentOwner" className="text-right">
              Current Owner
            </Label>
            <Input
              id="currentOwner"
              value={plaque?.ownerName || ''}
              readOnly
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newOwner" className="text-right">
              New Owner
            </Label>
            <Select value={newOwnerId} onValueChange={setNewOwnerId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select new owner" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {mockBusinessUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleTransfer}>Transfer Plaque</Button>
        </DialogFooter>
      </DialogContent>

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </Dialog>
  );
}
