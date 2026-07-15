'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { CampaignFormProvider, useCampaignForm } from '@/context/CampaignFormContext';
import { useGetCampaignById } from '@/services/campaigns/hook';
import { Loader2 } from 'lucide-react';
import { CampaignResponse, BusinessCampaign } from '@/services/campaigns/types';

import StepChooseCampaignType from '@/components/dashboard/campaigns/StepChooseCampaignType';
import StepSetCampaignDetails from '@/components/dashboard/campaigns/StepSetCampaignDetails';
import StepConfigureEarnPoints from '@/components/dashboard/campaigns/StepConfigureEarnPoints';
import StepConfigureRedeemPoints from '@/components/dashboard/campaigns/StepConfigureRedeemPoints';
import StepConfigureContactUs from '@/components/dashboard/campaigns/StepConfigureContactUs';
import StepConfigureFooter from '@/components/dashboard/campaigns/StepConfigureFooter';
import StepReviewAndCreate from '@/components/dashboard/campaigns/StepReviewAndCreate';

function EditCampaignContent() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const { updateFormData } = useCampaignForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);
  const totalSteps = 7;

  const { data: campaignData, isLoading, isError } = useGetCampaignById(campaignId);

  // Determine if it's a claimed campaign
  const campaign = campaignData as (CampaignResponse | BusinessCampaign);
  // Check for 'campaign' property which exists on BusinessCampaign (claimed) but is optional/undefined on CampaignResponse
  const isClaimed = !!((campaign as BusinessCampaign)?.campaign); // Retain original logic to determine if it's a claimed campaign

  // Type guard to determine if the campaign is a BusinessCampaign
  // Checks for snake_case property or if the object has businessRewards populated
  const isBusinessCampaign = (campaign: CampaignResponse | BusinessCampaign): campaign is BusinessCampaign => {
    return (campaign as BusinessCampaign).campaign_type !== undefined || (campaign as any).businessRewards !== undefined;
  };

  useEffect(() => {
    if (campaign && !dataLoaded) {
      const reverseCampaignTypeMap: Record<string, string> = {
        'qr_code': 'QR Code',
        'referral': 'Referral',
        'social_or_email': 'Social / Email',
        'special_occasion': 'Special Occasion'
      };

      const reverseAudienceTypeMap: Record<string, string> = {
        'members': 'members',
        'badge_level': 'badge_level',
        'target_wishlist': 'wishlist_target'
      };

      const currentCampaign = campaign; // Use a local variable to leverage the type guard
      
      const campaignType = isBusinessCampaign(currentCampaign)
        ? (currentCampaign.campaign_type || (currentCampaign as any).campaignType)
        : currentCampaign.campaignType || '';

      const audienceTypeStr = isBusinessCampaign(currentCampaign)
        ? (currentCampaign.audience_type || (currentCampaign as any).audienceType)
        : currentCampaign.audienceType || '';

      const audienceTypes = audienceTypeStr
        ? audienceTypeStr.split(',').map((t: string) => reverseAudienceTypeMap[t.trim()] || t.trim())
        : [];
      
      // Robust reward retrieval: check businessRewards, business_rewards, and rewards
      const getRewards = (c: any) => {
        if (c.businessRewards && c.businessRewards.length > 0) return c.businessRewards;
        if (c.business_rewards && c.business_rewards.length > 0) return c.business_rewards;
        if (c.rewards && c.rewards.length > 0) return c.rewards;
        return [];
      };
      const rewards = getRewards(currentCampaign);

      const getField = (fieldSnake: keyof BusinessCampaign, fieldCamel: keyof CampaignResponse) => {
          if (isBusinessCampaign(currentCampaign)) {
             return currentCampaign[fieldSnake] ?? (currentCampaign as any)[fieldCamel];
          }
          return currentCampaign[fieldCamel];
      }

      updateFormData({
        campaignName: currentCampaign.name,
        campaignType: reverseCampaignTypeMap[campaignType] || campaignType,
        campaignMessage: getField('campaign_message', 'campaignMessage'),
        startDate: (getField('start_date', 'startDate')) ? new Date(getField('start_date', 'startDate')) : undefined,
        endDate: (getField('end_date', 'endDate')) ? new Date(getField('end_date', 'endDate')) : undefined,
        rewardsAvailable: currentCampaign.quantity,
        // Populate with Available Slots (quantity/remaining) instead of Total Capacity
        totalSlots: currentCampaign.remainingSlots ?? currentCampaign.quantity ?? 0,
        audienceType: audienceTypes,
        imageUrl: getField('banner_url', 'bannerUrl'),
        logoUrl: getField('logo_url', 'logoUrl'),
        ctaButtonText: getField('cta_text', 'ctaText') as 'Claim Reward' | 'Join Now' | 'Refer & Earn',
        ctaBgColor: getField('cta_background_color', 'ctaBackgroundColor'),
        ctaTextColor: getField('cta_text_color', 'ctaTextColor'),
        bgColorTextColor: getField('text_color', 'textColor'),
        bgColor: getField('background_color', 'backgroundColor'),
        earnTitle: getField('earn_point_page_title', 'earnPointPageTitle'),
        earnText: getField('earn_point_page_description', 'earnPointPageDescription'),
        redeemTitle: getField('redeem_reward_page_title', 'redeemRewardPageTitle'),
        redeemText: getField('redeem_reward_page_description', 'redeemRewardPageDescription'),
        contactTitle: getField('contact_us_page_title', 'contactUsPageTitle'),
        contactText: getField('contact_us_page_description', 'contactUsPageDescription'),
        contactEmail: getField('contact_email', 'contactEmail'),
        contactPhone: getField('contact_phone_number', 'contactPhoneNumber'),
        footerText: getField('footer_text', 'footerText'),
        rewardIds: rewards.map((r: { id: string }) => r.id),
        selectedRewards: rewards.map((r: { id: string; title: string }) => ({ id: r.id, title: r.title })),
      });
      setDataLoaded(true);
    }
  }, [campaign, updateFormData, dataLoaded]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-red-500">
        Failed to load campaign.
      </div>
    );
  }

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

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
        return <StepReviewAndCreate onBack={handleBack} campaignId={campaignId} isClaimed={isClaimed} originalCampaign={campaignData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Edit Campaign</h1>
        <p className="text-gray-600 mb-8">Update your loyalty campaign details.</p>

        <Progress value={(currentStep / totalSteps) * 100} className="mb-8" />

        {renderStep()}
      </div>
    </div>
  );
}

export default function EditCampaignPage() {
  return (
    <CampaignFormProvider>
      <EditCampaignContent />
    </CampaignFormProvider>
  );
}