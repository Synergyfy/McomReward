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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { QrPlaque } from '@/services/qr-plaques/types';
import { useUpdateAdminQrPlaque } from '@/services/qr-plaques/hook';

interface RetirePlaqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  plaque: QrPlaque | undefined;
  onSuccess: () => void;
}

export function RetirePlaqueModal({
  isOpen,
  onClose,
  plaque,
  onSuccess,
}: RetirePlaqueModalProps) {
  const { mutate: updatePlaque, isPending } = useUpdateAdminQrPlaque();
  const [newStatus, setNewStatus] = useState<string>('RETIRED');

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
      setNewStatus('RETIRED'); // Reset on close
    }
  }, [isOpen]);

  const handleConfirmRetire = () => {
    if (!plaque) return;

    updatePlaque({
        id: plaque.id,
        data: { status: newStatus }
    }, {
        onSuccess: () => {
            onSuccess();
            onClose();
        }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Retire Plaque: {plaque?.name}</DialogTitle>
          <DialogDescription>
            Mark this plaque as lost, retired, or inactive. This will change its status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentStatus" className="text-right">
              Current Status
            </Label>
            <p className="col-span-3">{plaque?.status}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newStatus" className="text-right">
              New Status
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="RETIRED">Retired</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirmRetire} disabled={isPending}>
             {isPending ? 'Updating...' : 'Confirm Change'}
          </Button>
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
