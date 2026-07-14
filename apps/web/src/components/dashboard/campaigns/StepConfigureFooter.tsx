'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignForm } from "@/context/CampaignFormContext";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepConfigureFooter({ onNext, onBack }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Footer</CardTitle>
        <CardDescription>Customize the content for the footer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="footerText">Footer Text</Label>
          <Input
            id="footerText"
            placeholder="e.g., © 2025 Mcom Loyalty. All rights reserved."
            value={formData.footerText || ''}
            onChange={(e) => updateFormData({ footerText: e.target.value })}
          />
        </div>
      </CardContent>
      <div className="flex justify-between p-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </Card>
  );
}
