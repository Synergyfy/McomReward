'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCampaignForm } from '@/context/CampaignFormContext';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepAddDistributionChannels({ onNext, onBack }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();

  const handleCheckboxChange = (channel: keyof typeof formData.distributionChannels, checked: boolean) => {
    updateFormData({
      distributionChannels: {
        ...formData.distributionChannels,
        [channel]: checked,
      },
    });
  };

  const isFormValid = () => {
    return Object.values(formData.distributionChannels).some(Boolean); // At least one channel must be selected
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Add Distribution Channels</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-600">Select how you want to distribute your campaign:</p>
        <div className="grid gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="qrCode"
              checked={formData.distributionChannels.qrCode}
              onCheckedChange={(checked: boolean) => handleCheckboxChange('qrCode', checked)}
            />
            <Label htmlFor="qrCode">
              QR Code <span className="text-gray-500 text-sm">(Generate automatically for posters and stores)</span>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="shareLink"
              checked={formData.distributionChannels.shareLink}
              onCheckedChange={(checked: boolean) => handleCheckboxChange('shareLink', checked)}
            />
            <Label htmlFor="shareLink">
              Share Link <span className="text-gray-500 text-sm">(For WhatsApp, SMS, or social)</span>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="embedButton"
              checked={formData.distributionChannels.embedButton}
              onCheckedChange={(checked: boolean) => handleCheckboxChange('embedButton', checked)}
            />
            <Label htmlFor="embedButton">
              Embed Button <span className="text-gray-500 text-sm">(To use on their website)</span>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailSend"
              checked={formData.distributionChannels.emailSend}
              onCheckedChange={(checked: boolean) => handleCheckboxChange('emailSend', checked)}
            />
            <Label htmlFor="emailSend">
              Email Send <span className="text-gray-500 text-sm">(To existing customers)</span>
            </Label>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={onNext} disabled={!isFormValid()}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}
