
'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    // In a real app, this would navigate to the subscription page
    router.push('/dashboard/subscription');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upgrade to White-Label to Create from Scratch</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="my-4">
              To unlock full creative control and build custom rewards from the ground up, an upgrade to our White-Label plan is required.
            </p>
            <p className="font-semibold">Benefits of the White-Label plan include:</p>
            <ul className="list-disc list-inside my-2">
              <li>Full customization of rewards and campaigns</li>
              <li>Custom branding and domain masking</li>
              <li>Advanced analytics and insights</li>
              <li>Priority support</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleUpgrade}>Upgrade Now</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
