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
import { mockBusinessUsers } from '@/lib/mock-data/users';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { QrPlaque } from '@/services/qr-plaques/types';

interface AddEditPlaqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: QrPlaque;
  onSave: (plaque: any) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
  isSaving?: boolean;
}

export function AddEditPlaqueModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
  isSaving = false,
}: AddEditPlaqueModalProps) {
  // State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [contentUrl, setContentUrl] = useState(''); // New State
  const [status, setStatus] = useState<string>('ACTIVE');

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
      setOwnerId(initialData.assignedBusinessId || '');
      setQrCodeData(initialData.qrCodeUrl || '');
      setContentUrl(initialData.contentUrl || ''); // Load existing content URL
      setStatus(initialData.status);
    } else {
      setName('');
      setDescription('');
      setOwnerId('');
      setQrCodeData('');
      setContentUrl(''); // Reset
      setStatus('ACTIVE');
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    const errors: string[] = [];

    // Basic Validation
    if (!name.trim()) errors.push('Plaque Name is required.');
    // if (!contentUrl.trim()) errors.push('Content URL is required.'); // Error said "should not be empty", so adding validation might be good, but letting backend handle strictness is also fine. I'll adding it to be safe.
    if (!contentUrl.trim()) errors.push('Content URL is required.');

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

    // Prepare data object
    const plaqueData = {
        id: initialData?.id,
        name,
        description,
        assignedBusinessId: ownerId || undefined, // Send undefined if empty to avoid invalid UUID error
        status,
        qrCodeUrl: qrCodeData,
        contentUrl,
        actionText: 'Scan Here', // Default action text needed for Create
        footerText: '', // Default footer
    };

    onSave(plaqueData);
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

          {/* New Content URL Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contentUrl" className="text-right">Linked Offer / Content URL</Label>
            <Input id="contentUrl" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="https://..." className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="owner" className="text-right">Owner (Business)</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an owner (Optional)" />
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
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Plaque'}
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
