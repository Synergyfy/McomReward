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
import { BusinessLevel, CustomerBadge, CreateBusinessLevelPayload, CreateCustomerBadgePayload } from '@/services/progression/types';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';

interface AddEditTierBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tier' | 'badge';
  initialData?: BusinessLevel | CustomerBadge;
  onSave: (data: CreateBusinessLevelPayload | CreateCustomerBadgePayload) => void;
}

export function AddEditTierBadgeModal({
  isOpen,
  onClose,
  type,
  initialData,
  onSave,
}: AddEditTierBadgeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minPoints, setMinPoints] = useState<number>(0);
  const [maxPoints, setMaxPoints] = useState<number | undefined>(undefined);
  const [minCampaigns, setMinCampaigns] = useState<number>(0);
  const [maxCampaigns, setMaxCampaigns] = useState<number | undefined>(undefined);

  const [criteria, setCriteria] = useState<string[]>(['']);
  const [privileges, setPrivileges] = useState<string[]>(['']);
  const [color, setColor] = useState('');

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{
    title: string;
    description: React.ReactNode;
    actionText: string;
  }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrivileges(initialData.privileges && initialData.privileges.length > 0 ? initialData.privileges : ['']);
      setColor(initialData.color || '');
      setCriteria(initialData.criteria && initialData.criteria.length > 0 ? initialData.criteria : ['']);

      if (type === 'tier') {
        const tier = initialData as BusinessLevel;
        setMinPoints(tier.minPoints);
        setMaxPoints(tier.maxPoints);
        setMinCampaigns(tier.minCampaigns);
        setMaxCampaigns(tier.maxCampaigns);
      } else {
        const badge = initialData as CustomerBadge;
        setMinPoints(badge.minPoints);
        setMinCampaigns(badge.minCampaignsJoined);
      }
    } else {
      // Reset form
      setName('');
      setDescription('');
      setMinPoints(0);
      setMaxPoints(undefined);
      setMinCampaigns(0);
      setMaxCampaigns(undefined);
      setCriteria(['']);
      setPrivileges(['']);
      setColor('');
    }
  }, [initialData, type, isOpen]);

  const handleSave = () => {
    const errors: string[] = [];

    if (!name.trim()) errors.push('Name is required.');
    if (!description.trim()) errors.push('Description is required.');

    if (errors.length > 0) {
      handleShowFeedback(
        "Validation Error",
        <ul className="list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      );
      return;
    }

    const commonData = {
      name,
      description,
      minPoints,
      privileges: privileges.filter(p => p.trim() !== ''),
      color,
      criteria: criteria.filter(c => c.trim() !== ''),
    };

    let dataToSave;
    if (type === 'tier') {
      dataToSave = {
        ...commonData,
        maxPoints,
        minCampaigns,
        maxCampaigns,
      };
    } else {
      dataToSave = {
        ...commonData,
        minCampaignsJoined: minCampaigns,
      };
    }

    onSave(dataToSave);
    // onClose(); // Let parent close it on success
  };

  const handleAddInput = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const handleRemoveInput = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleChangeInput = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const title = initialData ? `Edit ${type === 'tier' ? 'Tier' : 'Badge'}: ${initialData.name}` : `Add New ${type === 'tier' ? 'Business Tier' : 'Consumer Badge'}`;
  const descriptionText = `Define the properties for this ${type === 'tier' ? 'business tier' : 'consumer badge'}.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minPoints" className="text-right">Min Points</Label>
            <Input type="number" id="minPoints" value={minPoints} onChange={(e) => setMinPoints(Number(e.target.value))} className="col-span-3" />
          </div>

          {type === 'tier' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxPoints" className="text-right">Max Points</Label>
              <Input type="number" id="maxPoints" value={maxPoints || ''} onChange={(e) => setMaxPoints(e.target.value ? Number(e.target.value) : undefined)} className="col-span-3" placeholder="Optional" />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minCampaigns" className="text-right">{type === 'tier' ? 'Min Campaigns' : 'Min Joined'}</Label>
            <Input type="number" id="minCampaigns" value={minCampaigns} onChange={(e) => setMinCampaigns(Number(e.target.value))} className="col-span-3" />
          </div>

          {type === 'tier' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxCampaigns" className="text-right">Max Campaigns</Label>
              <Input type="number" id="maxCampaigns" value={maxCampaigns || ''} onChange={(e) => setMaxCampaigns(e.target.value ? Number(e.target.value) : undefined)} className="col-span-3" placeholder="Optional" />
            </div>
          )}

          {/* Criteria (Visual Only) */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Display Criteria</Label>
            <div className="col-span-3 space-y-2">
              {criteria.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleChangeInput(index, e.target.value, setCriteria)}
                    placeholder="e.g., 1000+ Points (Visual description)"
                  />
                  {criteria.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveInput(index, setCriteria)}>
                      <MinusCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                  {index === criteria.length - 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleAddInput(setCriteria)}>
                      <PlusCircle className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Privileges */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Privileges</Label>
            <div className="col-span-3 space-y-2">
              {privileges.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleChangeInput(index, e.target.value, setPrivileges)}
                    placeholder="e.g., Priority Support"
                  />
                  {privileges.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveInput(index, setPrivileges)}>
                      <MinusCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                  {index === privileges.length - 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleAddInput(setPrivileges)}>
                      <PlusCircle className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">Color</Label>
            <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., #FFD700" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
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