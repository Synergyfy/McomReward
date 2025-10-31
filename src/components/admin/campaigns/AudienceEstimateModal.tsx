'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AudienceEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  audienceCount: number;
}

export const AudienceEstimateModal = ({ isOpen, onClose, onConfirm, audienceCount }: AudienceEstimateModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Audience Estimate</DialogTitle>
          <DialogDescription>
            Your offer for this item matches an estimated audience of ~{audienceCount} customers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <div className="space-x-2">
            <Button variant="secondary" onClick={onConfirm}>Broaden Audience</Button>
            <Button onClick={onConfirm}>Use Targeting</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};