'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAdminBusinessById } from "@/services/admin/hook";
import { Loader2 } from "lucide-react";

interface BusinessUserDetailsModalProps {
  businessId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessUserDetailsModal = ({ businessId, isOpen, onClose }: BusinessUserDetailsModalProps) => {
  const { data: business, isLoading, isError } = useAdminBusinessById(businessId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Business Owner Details</DialogTitle>
          <DialogDescription>
            Detailed information about the business owner.
          </DialogDescription>
        </DialogHeader>
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}
        {isError && (
          <div className="text-red-500 p-8">
            Error loading business details. Please try again.
          </div>
        )}
        {business && !isLoading && !isError && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-md font-semibold">{business.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-md font-semibold">{business.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-md font-semibold">{business.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Website</p>
                <p className="text-md font-semibold">{business.website}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-md font-semibold">{business.address}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-gray-500">Sector</p>
                <p className="text-md font-semibold">{business.sector.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Category</p>
                <p className="text-md font-semibold">{business.category.name}</p>
              </div>
              <div className="md:col-span-2">
                 <p className="text-sm font-medium text-gray-500">Sub-Category</p>
                 <p className="text-md font-semibold">{business.subCategory.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Points Earned</p>
                <p className="text-md font-semibold">{business.total_points_earned}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-gray-500">Total Points Redeemed</p>
                <p className="text-md font-semibold">{business.total_points_redeemed}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Remaining Point Balance</p>
                <p className="text-md font-semibold">{business.remainingPointBalance}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="text-md font-semibold">{new Date(business.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
