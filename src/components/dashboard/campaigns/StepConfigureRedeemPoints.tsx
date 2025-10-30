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
          <Textarea
            id="redeemText"
            placeholder="e.g., Use your points to claim exclusive rewards and discounts."
            value={formData.redeemText || ''}
            onChange={(e) => updateFormData({ redeemText: e.target.value })}
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
