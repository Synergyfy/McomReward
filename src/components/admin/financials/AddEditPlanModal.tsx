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
import { Switch } from '@/components/ui/switch';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/mock-data/financials';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';

interface AddEditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SubscriptionPlan; // Optional data for editing
  onSave: (plan: SubscriptionPlan) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditPlanModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
}: AddEditPlanModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState<string[]>(['']);
  const [isPopular, setIsPopular] = useState(false);

  // State for Feedback Dialog (local to modal for validation errors)
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

  const handleShowLocalFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price);
      setFeatures(initialData.features.length > 0 ? initialData.features : ['']);
      setIsPopular(initialData.isPopular);
    } else {
      // Reset form for new entry
      setName('');
      setPrice(0);
      setFeatures(['']);
      setIsPopular(false);
    }
  }, [initialData]);

  const handleSave = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Plan Name is required.');
    }
    if (price < 0) {
      errors.push('Price cannot be negative.');
    }
    if (features.every(f => f.trim() === '')) {
      errors.push('At least one feature is required.');
    }

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

    const planToSave: SubscriptionPlan = {
      id: initialData?.id || `new-plan-${Date.now()}`,
      name,
      price,
      features: features.filter(f => f.trim() !== ''),
      isPopular,
    };

    onSave(planToSave);
    onClose();
  };

  const handleAddFeature = () => {
    setFeatures(prev => [...prev, '']);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleChangeFeature = (index: number, value: string) => {
    setFeatures(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const dialogTitle = initialData ? `Edit Plan: ${initialData.name}` : 'Create New Subscription Plan';
  const dialogDescription = initialData ? 'Modify the details of this subscription plan.' : 'Enter the details for a new subscription plan.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Plan Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price (£/month)</Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="col-span-3" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Features</Label>
            <div className="col-span-3 space-y-2">
              {features.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleChangeFeature(index, e.target.value)}
                    placeholder="e.g., Unlimited Campaigns"
                  />
                  {features.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFeature(index)}>
                      <MinusCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                  {index === features.length - 1 && (
                    <Button variant="ghost" size="icon" onClick={handleAddFeature}>
                      <PlusCircle className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isPopular" className="text-right">Mark as Popular</Label>
            <Switch id="isPopular" checked={isPopular} onCheckedChange={setIsPopular} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Plan</Button>
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
