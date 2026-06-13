'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CreditsRule, CreditsPlatform, CreditsRewardType } from '@/services/cashback/types';
import { useCreateCreditsRule, useUpdateCreditsRule, useGetCreditsEvents } from '@/services/cashback/hook';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { data: creditsEvents, isLoading: isEventsLoading } = useGetCreditsEvents();

  const [platform, setPlatform] = useState<CreditsPlatform>('MCOM_LOYALTY');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [rewardType, setRewardType] = useState<CreditsRewardType>('PERCENTAGE');
  const [rewardValue, setRewardValue] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [level, setLevel] = useState<string>('1');

  useEffect(() => {
    if (open) {
      if (ruleToEdit) {
        setPlatform(ruleToEdit.platform);
        setSelectedEvents([ruleToEdit.eventType]);
        setRewardType(ruleToEdit.rewardType);
        setRewardValue(String(ruleToEdit.rewardValue));
        setIsActive(ruleToEdit.isActive);
        setLevel(String(ruleToEdit.level || '1'));
      } else {
        setPlatform('MCOM_LOYALTY');
        setSelectedEvents([]);
        setRewardType('PERCENTAGE');
        setRewardValue('');
        setIsActive(true);
        setLevel('1');
      }
    }
  }, [open, ruleToEdit]);

  const handleEventToggle = (event: string) => {
    if (isEditMode) return;
    setSelectedEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event) 
        : [...prev, event]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEvents.length === 0) {
      toast.error('At least one Event Type is required');
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
        eventType: selectedEvents,
        rewardType,
        rewardValue: val,
        isActive,
        level: parseInt(level)
      }, {
        onSuccess: () => {
          toast.success(`${selectedEvents.length} rule(s) created successfully`);
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col z-[1500]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Credit Rule' : 'Create Credit Rule'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the reward value or status of this credit rule.'
              : 'Configure a new credit rule for specific events and levels.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4 flex-1 overflow-y-auto pr-2">
          <div className="grid gap-6">
            {/* Platform */}
            <div className="grid gap-2">
              <Label htmlFor="platform" className="font-bold uppercase text-[10px] text-slate-500">Platform</Label>
              <Input
                id="platform"
                value="MCOM Loyalty Engine"
                disabled
                readOnly
                className="bg-slate-50 border-slate-200 text-slate-900 font-semibold"
              />
            </div>

            {/* Level Selection */}
            <div className="grid gap-2">
              <Label htmlFor="level" className="font-bold uppercase text-[10px] text-slate-500">Applicable Level</Label>
              <Select
                value={level}
                onValueChange={setLevel}
                disabled={isEditMode || isPending}
              >
                <SelectTrigger id="level" className="border-slate-200 font-semibold">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                  <SelectItem value="1" className="font-semibold">Level One (Entry)</SelectItem>
                  <SelectItem value="2" className="font-semibold">Level Two (Intermediate)</SelectItem>
                  <SelectItem value="3" className="font-semibold">Level Three (Advanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Type - Multi Select */}
            <div className="grid gap-2">
              <Label className="font-bold uppercase text-[10px] text-slate-500 flex items-center h-5">
                Event Types {selectedEvents.length > 0 && <Badge variant="secondary" className="ml-2 bg-indigo-50 text-indigo-600 text-[10px]">{selectedEvents.length} selected</Badge>}
              </Label>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <ScrollArea className="h-[200px] w-full p-2">
                  {isEventsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1">
                      {creditsEvents?.map((event) => {
                        const isSelected = selectedEvents.includes(event);
                        return (
                          <div 
                            key={event} 
                            className={`flex items-center space-x-3 p-2.5 rounded-lg transition-colors border ${
                              isSelected 
                                ? 'bg-white border-indigo-200 shadow-sm' 
                                : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                            }`}
                          >
                            <Checkbox 
                              id={`event-${event}`} 
                              checked={isSelected}
                              onCheckedChange={() => handleEventToggle(event)}
                              disabled={isEditMode || isPending}
                              className="data-[state=checked]:bg-indigo-600 border-slate-300"
                            />
                            <Label 
                              htmlFor={`event-${event}`}
                              className="flex-1 font-semibold text-sm cursor-pointer text-slate-700 select-none py-1"
                            >
                              {(event || '').replace(/_/g, ' ')}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
              {!isEditMode && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Select all events that should trigger this rule</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Reward Type */}
              <div className="grid gap-2">
                <Label htmlFor="rewardType" className="font-bold uppercase text-[10px] text-slate-500">Reward Unit</Label>
                <Select
                  value={rewardType}
                  onValueChange={(v) => setRewardType(v as CreditsRewardType)}
                  disabled={isEditMode || isPending}
                >
                  <SelectTrigger id="rewardType" className="border-slate-200 font-semibold">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="z-[2000]">
                    <SelectItem value="PERCENTAGE" className="font-semibold">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED" className="font-semibold">Fixed (CR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reward Value */}
              <div className="grid gap-2">
                <Label htmlFor="rewardValue" className="font-bold uppercase text-[10px] text-slate-500">Value</Label>
                <Input
                  id="rewardValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rewardValue}
                  onChange={(e) => setRewardValue(e.target.value)}
                  placeholder="e.g. 10"
                  disabled={isPending}
                  className="border-slate-200 font-bold text-indigo-600"
                />
              </div>
            </div>

            {/* Is Active */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="font-bold uppercase text-[10px] text-slate-500">Rule Status</Label>
                <p className="text-xs text-slate-500 font-medium">{isActive ? 'Earning is currently active' : 'Rule is currently paused'}</p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isPending}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
          </div>
        </form>

        <DialogFooter className="border-t border-slate-100 pt-6">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            disabled={isPending}
            className="font-bold text-slate-500"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isPending} 
            className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 shadow-lg shadow-indigo-100 h-11 rounded-xl"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Rule' : `Create ${selectedEvents.length > 1 ? `${selectedEvents.length} Rules` : 'Credit Rule'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
