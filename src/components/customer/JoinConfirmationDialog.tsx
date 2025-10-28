'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle } from 'lucide-react';

interface JoinConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
}

export const JoinConfirmationDialog = ({
  isOpen,
  onClose,
  campaignTitle,
}: JoinConfirmationDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <AlertDialogTitle className="text-center text-2xl font-bold">
            Welcome Aboard!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg">
            You have successfully joined the campaign: <span className="font-semibold">{campaignTitle}</span>. Get ready to earn rewards!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="w-full bg-orange-600 hover:bg-orange-700">
            Awesome!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
