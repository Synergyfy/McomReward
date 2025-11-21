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
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { useGetBusinessLevels, useGetCustomerBadges } from '@/services/progression/hook';
import { Loader2 } from 'lucide-react';

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
  const [overrideType, setOverrideType] = useState<'tier' | 'badge'>('tier');

  // Fetch data
  const { data: businessTiers, isLoading: isLoadingTiers } = useGetBusinessLevels();
  const { data: consumerBadges, isLoading: isLoadingBadges } = useGetCustomerBadges();

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

  const isLoading = overrideType === 'tier' ? isLoadingTiers : isLoadingBadges;
  const availableLevels = overrideType === 'tier' ? businessTiers : consumerBadges;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manually Override User Level</DialogTitle>
          <DialogDescription>
            Promote or demote a user&apos;s business tier or consumer badge.
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
              setSelectedLevelId('');
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
            <div className="col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select new ${overrideType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLevels?.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
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
