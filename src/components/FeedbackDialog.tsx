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

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  cancelText?: string;
  onCancel?: () => void;
}

export default function FeedbackDialog({
  isOpen,
  onClose,
  title,
  description,
  actionText = 'OK',
  onAction,
  cancelText,
  onCancel,
}: FeedbackDialogProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelText && (
            <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleAction}>{actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
