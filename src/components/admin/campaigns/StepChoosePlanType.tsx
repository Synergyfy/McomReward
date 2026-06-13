'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCampaignForm } from '@/context/CampaignFormContext';
import { Calendar, Snowflake } from 'lucide-react';

interface StepProps {
  onNext: () => void;
  onBack: () => void; // Kept for consistency, though step 1 usually has no back
}

export default function StepChoosePlanType({ onNext }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();

  const handleSelect = (type: 'standard' | 'seasonal') => {
    updateFormData({ planType: type });
    onNext();
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">Choose Plan Type</h2>
            <p className="text-gray-600">
                Select the type of subscription plan you want to create for your users.
            </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard Plan */}
        <div
            className={`cursor-pointer transition-all duration-200 bg-white rounded-xl border-2 p-6 hover:shadow-md
                ${formData.planType === 'standard' ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-100 hover:border-gray-200'}`}
            onClick={() => handleSelect('standard')}
        >
            <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Standard Plan</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
                Recurring subscription plan billed monthly, quarterly, or annually. Includes trial period configuration.
            </p>
        </div>

        {/* Seasonal Plan */}
        <div
            className={`cursor-pointer transition-all duration-200 bg-white rounded-xl border-2 p-6 hover:shadow-md
                ${formData.planType === 'seasonal' ? 'border-pink-200 ring-2 ring-pink-100' : 'border-gray-100 hover:border-gray-200'}`}
            onClick={() => handleSelect('seasonal')}
        >
             <div className="h-10 w-10 bg-pink-50 rounded-lg flex items-center justify-center mb-4">
                <Snowflake className="h-6 w-6 text-pink-500" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Seasonal Plan</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
                Time-limited plan for specific seasons or events. Fixed duration with start and end dates. No trial period.
            </p>
        </div>
      </div>
    </Card>
  );
}
