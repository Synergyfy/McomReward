'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignFormProvider, useCampaignForm } from '@/context/CampaignFormContext';

import StepChooseCampaignType from '@/components/dashboard/campaigns/StepChooseCampaignType';
import StepSetCampaignDetails from '@/components/dashboard/campaigns/StepSetCampaignDetails';
import StepAddDistributionChannels from '@/components/dashboard/campaigns/StepAddDistributionChannels';
import StepCampaignScheduling from '@/components/dashboard/campaigns/StepCampaignScheduling';
import StepReviewAndCreate from '@/components/dashboard/campaigns/StepReviewAndCreate';


export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 5; // Adjust based on actual steps

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepChooseCampaignType onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <StepSetCampaignDetails onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <StepAddDistributionChannels onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <StepCampaignScheduling onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <StepReviewAndCreate onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <CampaignFormProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
          <p className="text-gray-600 mb-8">Follow the steps to set up your loyalty campaign.</p>

          <Progress value={(currentStep / totalSteps) * 100} className="mb-8" />

          {renderStep()}
        </div>
      </div>
    </CampaignFormProvider>
  );
}
