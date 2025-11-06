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
import { CustomerActivity } from '@/lib/mock-data/activities';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: CustomerActivity | null;
}

// Mock detailed activities for a customer
const mockDetailedActivities = [
  { id: 1, type: 'Redemption', details: 'Redeemed “Summer Voucher ($50)”', date: '2025-11-05' },
  { id: 2, type: 'Purchase', details: 'Spent $25.50 at Bella’s Bakery', date: '2025-10-28' },
  { id: 3, type: 'Referral', details: 'Referred Jane Smith', date: '2025-10-15' },
  { id: 4, type: 'Wishlist', details: 'Added “Handmade Leather Wallet” to wishlist', date: '2025-10-10' },
];

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
              {mockDetailedActivities.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium">{item.type}</p>
                    <p className="text-sm text-gray-600">{item.details}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
