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
import { Plaque } from '@/lib/mock-data/plaques';

interface AddEditPlaqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Plaque; // Optional data for editing
  onSave: (plaque: Plaque) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditPlaqueModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
}: AddEditPlaqueModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [qrCodeData, setQrCodeData] = useState(''); // To store generated QR code data
  const [status, setStatus] = useState<Plaque['status']>('Active');

  // State for Feedback Dialog (local to modal for validation errors)
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
      setName(initialData.name);
      setDescription(initialData.description);
      setGroupId(initialData.groupId);
      setOwnerId(initialData.ownerId);
      setLocationDetails(initialData.locationDetails);
      setQrCodeData(initialData.qrCodeData);
      setStatus(initialData.status);
    } else {
      // Reset form for new entry
      setName('');
      setDescription('');
      setGroupId('');
      setOwnerId('');
      setLocationDetails('');
      setQrCodeData('');
      setStatus('Active');
    }
  }, [initialData]);

  const handleGenerateQrCode = () => {
    // In a real application, this would call an API to generate a QR code
    // For now, we'll use a placeholder base64 image
    const placeholderQr = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    setQrCodeData(placeholderQr);
    handleShowLocalFeedback("QR Code Generated", "A placeholder QR code has been generated.");
  };

  const handleSave = () => {
    const errors: string[] = [];

    if (!name.trim()) errors.push('Plaque Name is required.');
    if (!description.trim()) errors.push('Description is required.');
    if (!groupId.trim()) errors.push('Group is required.');
    if (!ownerId.trim()) errors.push('Owner is required.');
    if (!locationDetails.trim()) errors.push('Location Details are required.');
    if (!qrCodeData.trim()) errors.push('QR Code must be generated.');

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

    const plaqueToSave: Plaque = {
      id: initialData?.id || `plaque-${Date.now()}`,
      name,
      description,
      groupId,
      groupName: mockPlaqueGroups.find(g => g.id === groupId)?.name || 'Unknown Group',
      ownerId,
      ownerName: mockBusinessUsers.find(u => u.id === ownerId)?.name || 'Unknown Owner',
      qrCodeData,
      status,
      scanCounts: initialData?.scanCounts || 0,
      lastScanTime: initialData?.lastScanTime || null,
      transferHistory: initialData?.transferHistory || [],
      locationDetails,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(plaqueToSave);
    onClose();
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
            <Label htmlFor="group" className="text-right">Group</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {mockPlaqueGroups.map(group => (
                  <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the plaque's purpose or location." className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="owner" className="text-right">Owner (Business)</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an owner" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {mockBusinessUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="locationDetails" className="text-right">Location Details</Label>
            <Input id="locationDetails" value={locationDetails} onChange={(e) => setLocationDetails(e.target.value)} placeholder="e.g., Main Entrance, Counter" className="col-span-3" />
          </div>
          {initialData && ( // Only show status for editing existing plaques
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select value={status} onValueChange={(value: Plaque['status']) => setStatus(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4 flex justify-center">
              <Button onClick={handleGenerateQrCode}><QrCode className="mr-2 h-4 w-4" /> Generate QR Code</Button>
            </div>
            {qrCodeData && (
              <div className="col-span-4 flex flex-col items-center mt-4 p-4 border rounded-md">
                <p className="text-sm text-muted-foreground mb-2">Generated QR Code:</p>
                <img src={qrCodeData} alt="Generated QR Code" className="w-32 h-32 border p-1" />
                <p className="text-xs text-muted-foreground mt-2">This is a placeholder QR code.</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Plaque</Button>
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
