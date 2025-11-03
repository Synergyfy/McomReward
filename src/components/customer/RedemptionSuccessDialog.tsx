'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface RedemptionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rewardTitle: string;
}

export const RedemptionSuccessDialog: React.FC<RedemptionSuccessDialogProps> = ({ isOpen, onClose, rewardTitle }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <span className="text-2xl font-bold text-gray-800">Redemption Successful!</span>
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-gray-600 mt-2">
            You have successfully redeemed<br /><strong>{rewardTitle}</strong>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};