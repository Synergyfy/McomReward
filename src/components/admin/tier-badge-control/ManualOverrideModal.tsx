'use client';

import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockBusinessTiers, mockConsumerBadges } from '@/lib/mock-data/tiers-badges';
import { FeedbackDialog } from '@/components/ui/feedback-dialog'; // Import FeedbackDialog

interface ManualOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOverride: (userId: string, newLevelId: string, type: 'tier' | 'badge') => void;
}

export function ManualOverrideModal({
  isOpen,
  onClose,
  onOverride,
}: ManualOverrideModalProps) {
  const [userId, setUserId] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [overrideType, setOverrideType] = useState<'tier' | 'badge'>('tier'); // Default to tier

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  const handleOverride = () => {
    const errors: string[] = [];

    if (!userId.trim()) {
      errors.push('User ID/Email is required.');
    }
    if (!selectedLevelId.trim()) {
      errors.push('A new level must be selected.');
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

    onOverride(userId, selectedLevelId, overrideType);
    setUserId('');
    setSelectedLevelId('');
    onClose();
  };

  const availableLevels = overrideType === 'tier' ? mockBusinessTiers : mockConsumerBadges;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manually Override User Level</DialogTitle>
          <DialogDescription>
            Promote or demote a user's business tier or consumer badge.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userId" className="text-right">
              User ID/Email
            </Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID or Email"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="overrideType" className="text-right">
              Level Type
            </Label>
            <Select value={overrideType} onValueChange={(value: 'tier' | 'badge') => {
              setOverrideType(value);
              setSelectedLevelId(''); // Reset selected level when type changes
            }}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select level type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tier">Business Tier</SelectItem>
                <SelectItem value="badge">Consumer Badge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newLevel" className="text-right">
              New Level
            </Label>
            <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={`Select new ${overrideType}`} />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleOverride}>Override Level</Button>
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
