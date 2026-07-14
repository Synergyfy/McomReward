import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Plan } from '@/lib/mock-data/subscription';
import { ArrowRight } from 'lucide-react';

interface SubscriptionChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: Plan | undefined;
  targetPlan: Plan | null;
}

export default function SubscriptionChangeModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  targetPlan,
}: SubscriptionChangeModalProps) {
  if (!targetPlan || !currentPlan) return null;

  const isUpgrade = parseInt(targetPlan.price.replace(/[^0-9]/g, '')) > parseInt(currentPlan.price.replace(/[^0-9]/g, ''));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Plan Change</DialogTitle>
          <DialogDescription>
            You are about to change your subscription plan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="font-bold text-lg">{currentPlan.name}</p>
              <p className="text-gray-600">{currentPlan.price}</p>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <div className="text-center">
              <p className="font-bold text-lg text-orange-500">{targetPlan.name}</p>
              <p className="text-gray-600">{targetPlan.price}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 p-3 bg-gray-100 rounded-md">
            {isUpgrade
              ? 'Your new billing cycle starts today. You will be charged a prorated amount for the remainder of this month.'
              : 'Your new plan will take effect at the end of your current billing cycle on 2025-12-01.'}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>
            {isUpgrade ? 'Confirm & Proceed to Payment' : 'Confirm Downgrade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
