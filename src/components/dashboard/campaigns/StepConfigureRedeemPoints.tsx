'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignForm } from "@/context/CampaignFormContext";
import RichTextEditor from '@/components/ui/RichTextEditor';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepConfigureRedeemPoints({ onNext, onBack }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Redeem Points Page</CardTitle>
        <CardDescription>Customize the content for the page where customers redeem their points for rewards.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="redeemTitle">Page Title</Label>
          <Input
            id="redeemTitle"
            placeholder="e.g., Redeem Your Points"
            value={formData.redeemTitle || ''}
            onChange={(e) => updateFormData({ redeemTitle: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">This title will be displayed at the top of the Redeem Points page.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="redeemText">Page Description</Label>
          <RichTextEditor
            value={formData.redeemText || ''}
            onChange={(value) => updateFormData({ redeemText: value })}
          />
          <p className="text-sm text-gray-500 mt-1">A short description that appears below the title on the Redeem Points page.</p>
        </div>
      </CardContent>
      <div className="flex justify-between p-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </Card>
  );
}
