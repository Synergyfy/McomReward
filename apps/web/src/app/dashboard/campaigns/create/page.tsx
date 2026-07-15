'use client';

import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { CampaignFormProvider } from '@/context/CampaignFormContext';
import Link from 'next/link';
import { Lock } from 'lucide-react';

import StepChooseCampaignType from '@/components/dashboard/campaigns/StepChooseCampaignType';
import StepSetCampaignDetails from '@/components/dashboard/campaigns/StepSetCampaignDetails';
import StepConfigureEarnPoints from '@/components/dashboard/campaigns/StepConfigureEarnPoints';
import StepConfigureRedeemPoints from '@/components/dashboard/campaigns/StepConfigureRedeemPoints';
import StepConfigureContactUs from '@/components/dashboard/campaigns/StepConfigureContactUs';
import StepConfigureFooter from '@/components/dashboard/campaigns/StepConfigureFooter';
import StepReviewAndCreate from '@/components/dashboard/campaigns/StepReviewAndCreate';

import { useGetMySubscription } from '@/services/tiers/hook';
import { useGetBusinessProfile } from '@/services/business/hook';
import { useGetGeneralAnalytics } from '@/services/business-dashboard/hook';
import Loader from '@/components/ui/loader';

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const { data: subscription, isLoading: isSubLoading } = useGetMySubscription();
  const { data: profile, isLoading: isProfileLoading } = useGetBusinessProfile();
  const { data: analytics, isLoading: isAnalyticsLoading } = useGetGeneralAnalytics();

  const totalSteps = 7; // Updated total steps

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
        return <StepReviewAndCreate onBack={handleBack} />;
      default:
        return null;
    }
  };

  if (isSubLoading || isAnalyticsLoading || isProfileLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  }

  const isTrial = subscription?.isTrial;
  const maxCampaigns = subscription?.tier?.configuration?.quotas?.maxActiveCampaigns;
  const currentActive = analytics?.totalActiveCampaigns || 0;

  // Check if trial limit is reached - Bypass for Super Business
  if (!profile?.isSuperBusiness && isTrial && typeof maxCampaigns === 'number' && currentActive >= maxCampaigns) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Trial Limit Reached</h2>
          <p className="text-gray-600 mb-6">
            You have reached the maximum number of active campaigns ({maxCampaigns}) allowed during your trial.
            Upgrade to the full plan to create unlimited campaigns.
          </p>

          <div className="space-y-3">
            <Link
              href="/dashboard/subscription"
              className="block w-full bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-700 transition"
            >
              Upgrade Plan
            </Link>
            <Link
              href="/dashboard/campaigns/list"
              className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition"
            >
              Manage Existing Campaigns
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CampaignFormProvider>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
          <p className="text-gray-600 mb-8">Follow the steps to set up your loyalty campaign.</p>

          {isTrial && (
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="text-sm text-indigo-800">
                <span className="font-bold">Trial Mode:</span> You are creating a trial campaign.
                Active campaigns: {currentActive} / {maxCampaigns}
              </div>
              <Link href="/dashboard/subscription" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 underline">
                Upgrade for unlimited
              </Link>
            </div>
          )}

          <Progress value={(currentStep / totalSteps) * 100} className="mb-8" />

          {renderStep()}
        </div>
      </div>
    </CampaignFormProvider>
  );
}
