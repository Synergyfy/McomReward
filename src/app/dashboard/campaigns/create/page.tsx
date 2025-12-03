'use client';

import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { CampaignFormProvider } from '@/context/CampaignFormContext';

import StepChooseCampaignType from '@/components/dashboard/campaigns/StepChooseCampaignType';
import StepSetCampaignDetails from '@/components/dashboard/campaigns/StepSetCampaignDetails';
import StepConfigureEarnPoints from '@/components/dashboard/campaigns/StepConfigureEarnPoints';
import StepConfigureRedeemPoints from '@/components/dashboard/campaigns/StepConfigureRedeemPoints';
import StepConfigureContactUs from '@/components/dashboard/campaigns/StepConfigureContactUs';
import StepConfigureFooter from '@/components/dashboard/campaigns/StepConfigureFooter';
import StepAddDistributionChannels from '@/components/dashboard/campaigns/StepAddDistributionChannels';
import StepCampaignScheduling from '@/components/dashboard/campaigns/StepCampaignScheduling';
import StepReviewAndCreate from '@/components/dashboard/campaigns/StepReviewAndCreate';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGuide } from '@/context/GuideContext';
import { useEffect, Suspense } from 'react';

function CreateCampaignContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const searchParams = useSearchParams();
  const shouldStartTour = searchParams.get('tour') === 'true';
  const { startGuide, goToStep } = useGuide();
  const router = useRouter();

  useEffect(() => {
    if (shouldStartTour) {
        startGuide('BUSINESS_CAMPAIGN');
        if (currentStep === 1) goToStep(0);
        else if (currentStep === 2) goToStep(1);
        else if (currentStep === 9) goToStep(2);
    }
  }, [shouldStartTour, startGuide, currentStep, goToStep]);

  const totalSteps = 9; // Updated total steps

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
        return <StepConfigureEarnPoints onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <StepConfigureRedeemPoints onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <StepConfigureContactUs onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <StepConfigureFooter onNext={handleNext} onBack={handleBack} />;
      case 7:
        return <StepAddDistributionChannels onNext={handleNext} onBack={handleBack} />;
      case 8:
        return <StepCampaignScheduling onNext={handleNext} onBack={handleBack} />;
      case 9:
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

export default function CreateCampaignPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCampaignContent />
    </Suspense>
  );
}