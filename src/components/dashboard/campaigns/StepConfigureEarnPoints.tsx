'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCampaignForm } from "@/context/CampaignFormContext";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepConfigureEarnPoints({ onNext, onBack }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Earn Points Page</CardTitle>
        <CardDescription>Customize the content for the page where customers learn how to earn points.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="earnTitle">Page Title</Label>
          <Input
            id="earnTitle"
            placeholder="e.g., Earn Points"
            value={formData.earnTitle || ''}
            onChange={(e) => updateFormData({ earnTitle: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">This title will be displayed at the top of the Earn Points page.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="earnText">Page Description</Label>
          <Textarea
            id="earnText"
            placeholder="e.g., Get points for every dollar you spend."
            value={formData.earnText || ''}
            onChange={(e) => updateFormData({ earnText: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">A short description that appears below the title on the Earn Points page.</p>
        </div>
        {/* Add checkboxes for enabling/disabling earn methods in the future */}
      </CardContent>
      <div className="flex justify-between p-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </Card>
  );
}
