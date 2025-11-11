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
import { BusinessTier, ConsumerBadge } from '@/lib/mock-data/tiers-badges';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog'; // Import FeedbackDialog

interface AddEditTierBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tier' | 'badge'; // 'tier' for BusinessTier, 'badge' for ConsumerBadge
  initialData?: BusinessTier | ConsumerBadge; // Optional data for editing
  onSave: (data: BusinessTier | ConsumerBadge) => void;
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
  const [criteria, setCriteria] = useState<string[]>(['']);
  const [privileges, setPrivileges] = useState<string[]>(['']);
  const [icon, setIcon] = useState('');
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
      setCriteria(initialData.criteria.length > 0 ? initialData.criteria : ['']);
      setPrivileges(initialData.privileges.length > 0 ? initialData.privileges : ['']);
      setIcon(initialData.icon);
      setColor(initialData.color);
    } else {
      // Reset form for new entry
      setName('');
      setDescription('');
      setCriteria(['']);
      setPrivileges(['']);
      setIcon('');
      setColor('');
    }
  }, [initialData]);

  const handleSave = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Name is required.');
    }
    if (!description.trim()) {
      errors.push('Description is required.');
    }
    if (!icon.trim()) {
      errors.push('Icon is required.');
    }
    if (!color.trim()) {
      errors.push('Color is required.');
    }

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

    const dataToSave = {
      id: initialData?.id || `new-${type}-${Date.now()}`, // Generate new ID if not editing
      name,
      description,
      criteria: criteria.filter(c => c.trim() !== ''),
      privileges: privileges.filter(p => p.trim() !== ''),
      icon,
      color,
    };

    onSave(dataToSave as BusinessTier | ConsumerBadge);
    onClose();
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
      <DialogContent className="sm:max-w-[600px]">
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

          {/* Criteria */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Criteria</Label>
            <div className="col-span-3 space-y-2">
              {criteria.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleChangeInput(index, e.target.value, setCriteria)}
                    placeholder="e.g., 1000+ Points"
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
            <Label htmlFor="icon" className="text-right">Icon (Lucide Name)</Label>
            <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., Star" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">Color (Hex or Tailwind)</Label>
            <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., #FFD700 or text-yellow-500" className="col-span-3" />
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