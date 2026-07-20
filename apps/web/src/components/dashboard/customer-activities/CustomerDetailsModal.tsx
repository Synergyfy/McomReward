import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface CustomerActivity {
  id: string;
  customer: { name: string; avatarUrl: string };
  activityType: 'Redemption' | 'Referral' | 'Wishlist';
  details: string;
  date: string;
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: CustomerActivity | null;
}

// No mock activities - data should be passed via props

export default function CustomerDetailsModal({ isOpen, onClose, activity }: CustomerDetailsModalProps) {
  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Customer Details</DialogTitle>
          <DialogDescription>
            Activity history and details for {activity.customer.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {/* Customer Profile Section */}
          <div className="flex items-center gap-4">
            <Image
              src={activity.customer.avatarUrl}
              alt={activity.customer.name}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <h3 className="text-xl font-semibold">{activity.customer.name}</h3>
              <Badge>Gold Tier</Badge>
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Activity Timeline</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">{activity.activityType}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
