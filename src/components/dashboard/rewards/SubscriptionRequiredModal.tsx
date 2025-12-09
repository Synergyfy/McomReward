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

interface SubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionRequiredModal({ isOpen, onClose }: SubscriptionRequiredModalProps) {
  const router = useRouter();

  const handleSubscribe = () => {
    router.push('/dashboard/subscription');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Subscription Required</AlertDialogTitle>
          <AlertDialogDescription>
            You are not yet subscribed. Please subscribe to add rewards to your business.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleSubscribe}>Subscribe Now</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
