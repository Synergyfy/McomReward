// components/model/JoinCampaignModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CampaignCustomerSignUp from "@/app/(customer)/components/form/CampaignCustomerSignUp";

interface JoinCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignTitle?: string;
  onSuccess?: () => void;
}

export default function JoinCampaignModal({
  open,
  onOpenChange,
  campaignTitle,
  onSuccess,
}: JoinCampaignModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Join {campaignTitle || "Campaign"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Fill in your details to participate and start earning rewards.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <CampaignCustomerSignUp onSuccess={onSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
