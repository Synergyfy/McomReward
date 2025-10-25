'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCampaignForm } from '@/context/CampaignFormContext';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepCampaignScheduling({ onNext, onBack }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();

  const isFormValid = () => {
    // No specific validation for this step yet, as all fields are optional or have defaults.
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Campaign Scheduling & Auto Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-600">Configure advanced scheduling and automation rules for your campaign.</p>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="stopAfterClaims">Stop after X claims</Label>
            <Input
              id="stopAfterClaims"
              type="number"
              placeholder="0 (unlimited)"
              value={formData.schedulingRules.stopAfterClaims}
              onChange={(e) => updateFormData({ schedulingRules: { ...formData.schedulingRules, stopAfterClaims: Number(e.target.value) } })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pauseOnRewardEmpty"
              checked={formData.schedulingRules.pauseOnRewardEmpty}
              onCheckedChange={(checked: boolean) => updateFormData({ schedulingRules: { ...formData.schedulingRules, pauseOnRewardEmpty: checked } })}
            />
            <Label htmlFor="pauseOnRewardEmpty">
              Pause automatically when reward balance runs out
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoSwitchToPoints"
              checked={formData.schedulingRules.autoSwitchToPoints}
              onCheckedChange={(checked: boolean) => updateFormData({ schedulingRules: { ...formData.schedulingRules, autoSwitchToPoints: checked } })}
            />
            <Label htmlFor="autoSwitchToPoints">
              Auto-switch to “matching points only” if rewards are finished
            </Label>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={onNext} disabled={!isFormValid()}>Review & Create</Button>
        </div>
      </CardContent>
    </Card>
  );
}
