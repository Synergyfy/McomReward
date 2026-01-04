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
  const isBusinessCampaign = (campaign: CampaignResponse | BusinessCampaign): campaign is BusinessCampaign => {
    return (campaign as BusinessCampaign).campaign_type !== undefined;
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
      
      const campaignType = isBusinessCampaign(currentCampaign) ? currentCampaign.campaign_type : currentCampaign.campaignType || '';
      const audienceTypeStr = isBusinessCampaign(currentCampaign) ? currentCampaign.audience_type : currentCampaign.audienceType || '';
      const audienceTypes = audienceTypeStr
        ? audienceTypeStr.split(',').map((t: string) => reverseAudienceTypeMap[t.trim()] || t.trim())
        : [];
      
      const rewards = isBusinessCampaign(currentCampaign) ? currentCampaign.businessRewards : currentCampaign.rewards || [];

      updateFormData({
        campaignName: currentCampaign.name,
        campaignType: reverseCampaignTypeMap[campaignType] || campaignType,
        campaignMessage: isBusinessCampaign(currentCampaign) ? currentCampaign.campaign_message : currentCampaign.campaignMessage,
        startDate: (isBusinessCampaign(currentCampaign) ? currentCampaign.start_date : currentCampaign.startDate) ? new Date(isBusinessCampaign(currentCampaign) ? currentCampaign.start_date : currentCampaign.startDate) : undefined,
        endDate: (isBusinessCampaign(currentCampaign) ? currentCampaign.end_date : currentCampaign.endDate) ? new Date(isBusinessCampaign(currentCampaign) ? currentCampaign.end_date : currentCampaign.endDate) : undefined,
        rewardsAvailable: currentCampaign.quantity,
        audienceType: audienceTypes,
        imageUrl: isBusinessCampaign(currentCampaign) ? currentCampaign.banner_url : currentCampaign.bannerUrl,
        logoUrl: isBusinessCampaign(currentCampaign) ? currentCampaign.logo_url : currentCampaign.logoUrl,
        ctaButtonText: (isBusinessCampaign(currentCampaign) ? currentCampaign.cta_text : currentCampaign.ctaText) as 'Claim Reward' | 'Join Now' | 'Refer & Earn',
        ctaBgColor: isBusinessCampaign(currentCampaign) ? currentCampaign.cta_background_color : currentCampaign.ctaBackgroundColor,
        ctaTextColor: isBusinessCampaign(currentCampaign) ? currentCampaign.cta_text_color : currentCampaign.ctaTextColor,
        bgColorTextColor: isBusinessCampaign(currentCampaign) ? currentCampaign.text_color : currentCampaign.textColor,
        bgColor: isBusinessCampaign(currentCampaign) ? currentCampaign.background_color : currentCampaign.backgroundColor,
        earnTitle: isBusinessCampaign(currentCampaign) ? currentCampaign.earn_point_page_title : currentCampaign.earnPointPageTitle,
        earnText: isBusinessCampaign(currentCampaign) ? currentCampaign.earn_point_page_description : currentCampaign.earnPointPageDescription,
        redeemTitle: isBusinessCampaign(currentCampaign) ? currentCampaign.redeem_reward_page_title : currentCampaign.redeemRewardPageTitle,
        redeemText: isBusinessCampaign(currentCampaign) ? currentCampaign.redeem_reward_page_description : currentCampaign.redeemRewardPageDescription,
        contactTitle: isBusinessCampaign(currentCampaign) ? currentCampaign.contact_us_page_title : currentCampaign.contactUsPageTitle,
        contactText: isBusinessCampaign(currentCampaign) ? currentCampaign.contact_us_page_description : currentCampaign.contactUsPageDescription,
        contactEmail: isBusinessCampaign(currentCampaign) ? currentCampaign.contact_email : currentCampaign.contactEmail,
        contactPhone: isBusinessCampaign(currentCampaign) ? currentCampaign.contact_phone_number : currentCampaign.contactPhoneNumber,
        footerText: isBusinessCampaign(currentCampaign) ? currentCampaign.footer_text : currentCampaign.footerText,
        rewardIds: rewards.map((r: { id: string }) => r.id),
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Campaign</h1>
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