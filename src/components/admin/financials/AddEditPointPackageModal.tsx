'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PointPackage } from '@/services/financials/types';

interface AddEditPointPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PointPackage;
  onSave: (pkg: any) => void; // Using any for placeholder
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export const AddEditPointPackageModal: React.FC<AddEditPointPackageModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Create'} Point Package</DialogTitle>
        </DialogHeader>
        <div>
          <p>This is a placeholder for the Add/Edit Point Package form.</p>
          <p>Fields to implement:</p>
          <ul>
            <li>Name (text)</li>
            <li>Description (textarea)</li>
            <li>Points (number)</li>
            <li>Price (number)</li>
            <li>Currency (text)</li>
            <li>Tiers (multi-select)</li>
            <li>Active (switch)</li>
          </ul>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
