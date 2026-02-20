'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CreditsRule, CreditsPlatform, CreditsRewardType } from '@/services/cashback/types';
import { useCreateCreditsRule, useUpdateCreditsRule, useGetCreditsEvents } from '@/services/cashback/hook';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreditsRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleToEdit?: CreditsRule | null;
  onSuccess: () => void;
}

export default function CreditsRuleDialog({ open, onOpenChange, ruleToEdit, onSuccess }: CreditsRuleDialogProps) {
  const isEditMode = !!ruleToEdit;
  const { mutate: createRule, isPending: isCreating } = useCreateCreditsRule();
  const { mutate: updateRule, isPending: isUpdating } = useUpdateCreditsRule();
  const { data: creditsEvents, isLoading: isEventsLoading, isError: isEventsError } = useGetCreditsEvents();

  const [platform, setPlatform] = useState<CreditsPlatform>('MCOM_LOYALTY');
  const [eventType, setEventType] = useState<string>('');
  const [rewardType, setRewardType] = useState<CreditsRewardType>('PERCENTAGE');
  const [rewardValue, setRewardValue] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      if (ruleToEdit) {
        setPlatform(ruleToEdit.platform);
        setEventType(ruleToEdit.eventType);
        setRewardType(ruleToEdit.rewardType);
        setRewardValue(String(ruleToEdit.rewardValue));
        setIsActive(ruleToEdit.isActive);
      } else {
        setPlatform('MCOM_LOYALTY');
        setEventType('');
        setRewardType('PERCENTAGE');
        setRewardValue('');
        setIsActive(true);
      }
    }
  }, [open, ruleToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventType.trim()) {
      toast.error('Event Type is required');
      return;
    }
    const val = parseFloat(rewardValue);
    if (isNaN(val) || val < 0) {
      toast.error('Please enter a valid reward value');
      return;
    }

    if (isEditMode && ruleToEdit) {
      updateRule({
        id: ruleToEdit.id,
        rewardValue: val,
        isActive
      }, {
        onSuccess: () => {
          toast.success('Rule updated successfully');
          onOpenChange(false);
          onSuccess();
        },
        onError: (err) => {
          toast.error(`Failed to update rule: ${err.message}`);
        }
      });
    } else {
      createRule({
        platform,
        eventType: eventType.trim(),
        rewardType,
        rewardValue: val,
        isActive
      }, {
        onSuccess: () => {
          toast.success('Rule created successfully');
          onOpenChange(false);
          onSuccess();
        },
        onError: (err) => {
          toast.error(`Failed to create rule: ${err.message}`);
        }
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Credit Rule' : 'Create Credit Rule'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the reward value or status of this credit rule.'
              : 'Configure a new credit rule for specific events.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid gap-4">
            {/* Platform */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="platform" className="text-right pt-2 font-bold uppercase text-[10px]">Platform</Label>
              <div className="col-span-3">
                <Input
                  id="platform"
                  value="MCOM Loyalty Engine"
                  disabled
                  readOnly
                  className="bg-muted text-muted-foreground font-medium"
                />
              </div>
            </div>

            {/* Event Type */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="eventType" className="text-right pt-2 font-bold uppercase text-[10px]">Event Type</Label>
              <div className="col-span-3">
                <Select
                  value={eventType}
                  onValueChange={setEventType}
                  disabled={isEditMode || isPending}
                >
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder={isEventsLoading ? "Loading..." : "Select event"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isEventsLoading && (
                      <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading events...
                      </div>
                    )}
                    {creditsEvents?.map((event) => (
                      <SelectItem key={event} value={event}>
                        {(event || '').replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reward Type */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="rewardType" className="text-right pt-2 font-bold uppercase text-[10px]">Reward Unit</Label>
              <div className="col-span-3">
                <Select
                  value={rewardType}
                  onValueChange={(v) => setRewardType(v as CreditsRewardType)}
                  disabled={isEditMode || isPending}
                >
                  <SelectTrigger id="rewardType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Value Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Credits (CR)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[0.8rem] text-muted-foreground mt-1">
                  Credits must be matching-contributed to become cashback.
                </p>
              </div>
            </div>

            {/* Reward Value */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="rewardValue" className="text-right pt-2 font-bold uppercase text-[10px]">Value</Label>
              <div className="col-span-3">
                <Input
                  id="rewardValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rewardValue}
                  onChange={(e) => setRewardValue(e.target.value)}
                  placeholder="e.g. 10"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Is Active */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="isActive" className="text-right pt-2 font-bold uppercase text-[10px]">Status</Label>
              <div className="col-span-3">
                <div className="flex items-center">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    disabled={isPending}
                  />
                  <span className="ml-2 text-sm font-medium">{isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Rule' : 'Create Credit Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
