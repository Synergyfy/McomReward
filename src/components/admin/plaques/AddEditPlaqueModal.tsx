'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Save } from 'lucide-react';
import { mockPlaqueGroups } from '@/lib/mock-data/plaque-groups';
import { mockBusinessUsers } from '@/lib/mock-data/users';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { QrPlaque } from '@/services/qr-plaques/types';
import { useUpdateAdminQrPlaque } from '@/services/qr-plaques/hook';

interface AddEditPlaqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: QrPlaque;
  onSave: (plaque: QrPlaque) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditPlaqueModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
}: AddEditPlaqueModalProps) {
  // Hooks
  const { mutate: updatePlaque, isPending } = useUpdateAdminQrPlaque();

  // State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [status, setStatus] = useState<string>('Active');

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{ title: string; description: React.ReactNode; actionText: string }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowLocalFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setGroupId(''); // Mapping needed if groups exist in API data
      setOwnerId(initialData.assignedBusinessId || '');
      setLocationDetails(''); // Not in QrPlaque interface yet
      setQrCodeData(initialData.qrCodeUrl || '');
      setStatus(initialData.status);
    } else {
      setName('');
      setDescription('');
      setGroupId('');
      setOwnerId('');
      setLocationDetails('');
      setQrCodeData('');
      setStatus('Active');
    }
  }, [initialData]);

  const handleSave = () => {
    const errors: string[] = [];

    // Basic Validation
    if (!name.trim()) errors.push('Plaque Name is required.');
    // if (!ownerId.trim()) errors.push('Owner is required.'); // Maybe optional if creating unassigned?

    if (errors.length > 0) {
      handleShowLocalFeedback(
        "Validation Error",
        <ul className="list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      );
      return;
    }

    if (!initialData) {
       // Create Logic - Admins don't create plaques per instructions "create is for business not for admin"
       // But if they were to edit, we need initialData.
       // If this modal is somehow opened for create, we should probably block it or clarification needed.
       // Assuming this is EDIT only based on previous turns.
       handleShowLocalFeedback("Error", "Admins cannot create plaques.");
       return;
    }

    updatePlaque({
        id: initialData.id,
        data: {
            name,
            description,
            // groupId, // Not in API type
            assignedBusinessId: ownerId,
            status,
            qrCodeUrl: qrCodeData
        }
    }, {
        onSuccess: (data) => {
            onSave(data);
            onClose();
        }
    });
  };

  const dialogTitle = initialData ? `Edit Plaque: ${initialData.name}` : 'Create New Plaque';
  const dialogDescription = initialData ? 'Modify the details of this plaque.' : 'Enter the details for a new plaque.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Plaque Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Front Desk QR" className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="owner" className="text-right">Owner (Business)</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an owner" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                 {/* This would ideally come from an API too */}
                {mockBusinessUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
                <SelectItem value="RETIRED">Retired</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

           {/* QR Code URL Input for Admin */}
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="qrCodeUrl" className="text-right">QR Code URL</Label>
             <Input id="qrCodeUrl" value={qrCodeData} onChange={(e) => setQrCodeData(e.target.value)} placeholder="https://..." className="col-span-3" />
           </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" /> {isPending ? 'Saving...' : 'Save Plaque'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </Dialog>
  );
}
