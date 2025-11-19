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

export default function StepConfigureContactUs({ onNext, onBack }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Contact Us Page</CardTitle>
        <CardDescription>Customize the content for the contact page.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="contactTitle">Page Title</Label>
          <Input
            id="contactTitle"
            placeholder="e.g., Contact Us"
            value={formData.contactTitle || ''}
            onChange={(e) => updateFormData({ contactTitle: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">This title will be displayed at the top of the Contact Us page.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactText">Page Description</Label>
          <Textarea
            id="contactText"
            placeholder="e.g., We're here to help. Reach out to us with any questions."
            value={formData.contactText || ''}
            onChange={(e) => updateFormData({ contactText: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">A short description that appears below the title on the Contact Us page.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="e.g., support@example.com"
            value={formData.contactEmail || ''}
            onChange={(e) => updateFormData({ contactEmail: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">The email address customers can use to contact you.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="e.g., +1 (555) 123-4567"
            value={formData.contactPhone || ''}
            onChange={(e) => updateFormData({ contactPhone: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">The phone number customers can use to call you.</p>
        </div>
      </CardContent>
      <div className="flex justify-between p-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </Card>
  );
}
