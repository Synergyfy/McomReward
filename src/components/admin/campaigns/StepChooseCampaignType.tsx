'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignForm } from '@/context/CampaignFormContext';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const campaignTypes = [
  { value: 'qr_code', label: 'QR Code Campaign', description: 'For in-store rewards. A customer scans a code to claim or earn points.' },
  { value: 'referral', label: 'Referral Campaign', description: 'To reward users who invite friends (works with PerkZilla integration).' },
  { value: 'social_email', label: 'Social or Email Campaign', description: 'For sharing reward offers through social media or newsletters.' },
  { value: 'special_occasion', label: 'Special Occasion / Event Campaign', description: 'For birthdays, holidays, or promotions.' },
];

export default function StepChooseCampaignType({ onNext }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();

  const handleSelectType = (type: string) => {
    updateFormData({ campaignType: type });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Choose Campaign Type</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-600">Select the type of campaign you want to create:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="campaign-type-selection">
          {campaignTypes.map((type) => (
            <div
              key={type.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200
                ${formData.campaignType === type.value ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-gray-300'}`}
              onClick={() => handleSelectType(type.value)}
            >
              <h4 className="font-semibold text-lg mb-1">{type.label}</h4>
              <p className="text-sm text-gray-500">{type.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={onNext} disabled={!formData.campaignType}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}
