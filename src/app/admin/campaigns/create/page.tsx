'use client';

import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { CampaignFormProvider } from '@/context/CampaignFormContext';

import StepChoosePlanType from '@/components/admin/campaigns/StepChoosePlanType';
import StepChooseCampaignType from '@/components/admin/campaigns/StepChooseCampaignType';
import StepSelectTier from '@/components/admin/campaigns/StepSelectTier';
import StepSetCampaignDetails from '@/components/admin/campaigns/StepSetCampaignDetails';
import StepConfigureEarnPoints from '@/components/admin/campaigns/StepConfigureEarnPoints';
import StepConfigureRedeemPoints from '@/components/admin/campaigns/StepConfigureRedeemPoints';
import StepConfigureContactUs from '@/components/admin/campaigns/StepConfigureContactUs';
import StepConfigureFooter from '@/components/admin/campaigns/StepConfigureFooter';
import StepAddDistributionChannels from '@/components/admin/campaigns/StepAddDistributionChannels';
import StepCampaignScheduling from '@/components/admin/campaigns/StepCampaignScheduling';
import StepReviewAndCreate from '@/components/admin/campaigns/StepReviewAndCreate';
import { useSearchParams } from 'next/navigation';
import { useGuide } from '@/context/GuideContext';
import { Suspense, useEffect } from 'react';

function CreateCampaignContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const searchParams = useSearchParams();
  const shouldStartTour = searchParams.get('tour') === 'true';
  const { startGuide, goToStep } = useGuide();

  useEffect(() => {
    if (shouldStartTour) {
        startGuide('CAMPAIGN');
        // Map wizard steps to guide steps roughly
        // Step 1 (Plan) -> Guide Step 0? No, Guide likely expects old flow.
        // Step 2 (Type) -> Guide Step 0
        // Step 4 (Details) -> Guide Step 1
        // Step 11 (Review) -> Guide Step 2 (assuming minimal guide steps)

        // You might want to adjust the index mapping based on your guide-content.ts
        if (currentStep === 2) goToStep(0);
        else if (currentStep === 4) goToStep(1);
        else if (currentStep === 11) goToStep(2);
    }
  }, [shouldStartTour, startGuide, currentStep, goToStep]);

  const totalSteps = 11; // Adjust based on actual steps

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepChoosePlanType onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <StepChooseCampaignType onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <StepSelectTier onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <StepSetCampaignDetails onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <StepConfigureEarnPoints onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <StepConfigureRedeemPoints onNext={handleNext} onBack={handleBack} />;
      case 7:
        return <StepConfigureContactUs onNext={handleNext} onBack={handleBack} />;
      case 8:
        return <StepConfigureFooter onNext={handleNext} onBack={handleBack} />;
      case 9:
        return <StepAddDistributionChannels onNext={handleNext} onBack={handleBack} />;
      case 10:
        return <StepCampaignScheduling onNext={handleNext} onBack={handleBack} />;
      case 11:
        return <StepReviewAndCreate onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <CampaignFormProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" id="campaign-step-indicator">Create New Campaign</h1>
          <p className="text-gray-600 mb-8">Follow the steps to set up your loyalty campaign.</p>

          <Progress value={(currentStep / totalSteps) * 100} className="mb-8" />

          {renderStep()}
        </div>
      </div>
    </CampaignFormProvider>
  );
}

export default function AdminCreateCampaignPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCampaignContent />
    </Suspense>
  );
}