'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CampaignFormData {
  campaignType: string;
  campaignName: string;
  rewardIds: string[];
  startDate: Date | undefined;
  endDate: Date | undefined;
  rewardsAvailable: number | string;
  audienceType: string[];
  badgeLevels?: string[];
  wishlistItemIds?: string[];
  wishlistAggregateId?: string; // Added field for wishlist aggregate ID
  campaignMessage: string;
  imageUrl: string;
  logoUrl: string;
  ctaButtonText: 'Claim Reward' | 'Join Now' | 'Refer & Earn';
  distributionChannels: {
    qrCode: boolean;
    shareLink: boolean;
    embedButton: boolean;
    emailSend: boolean;
  };
  schedulingRules: {
    startDate: Date | undefined;
    stopAfterClaims: number | string;
    pauseOnRewardEmpty: boolean;
    autoSwitchToPoints: boolean;
  };
  bgColor: string;
  ctaBgColor: string;
  bgColorTextColor: string;
  ctaTextColor: string;
  earnTitle?: string;
  earnText?: string;
  redeemTitle?: string;
  redeemText?: string;
  contactTitle?: string;
  contactText?: string;
  contactEmail?: string;
  contactPhone?: string;
  footerText?: string;
  howToEarn: string[];
  termsAndConditions: string[];
}

interface CampaignFormContextType {
  formData: CampaignFormData;
  updateFormData: (fields: Partial<CampaignFormData>) => void;
  resetFormData: () => void;
}

const defaultFormData: CampaignFormData = {
  campaignType: '',
  campaignName: '',
  rewardIds: [],
  startDate: undefined,
  endDate: undefined,
  rewardsAvailable: 0,
  audienceType: [],
  badgeLevels: [],
  wishlistItemIds: [],
  wishlistAggregateId: undefined,
  campaignMessage: '',
  imageUrl: '',
  logoUrl: '',
  ctaButtonText: 'Claim Reward',
  distributionChannels: {
    qrCode: false,
    shareLink: false,
    embedButton: false,
    emailSend: false,
  },
  schedulingRules: {
    startDate: undefined,
    stopAfterClaims: 0,
    pauseOnRewardEmpty: false,
    autoSwitchToPoints: true,
  },
  bgColor: '#FFFFFF',
  ctaBgColor: '#000000',
  bgColorTextColor: '#000000',
  ctaTextColor: '#FFFFFF',
  earnTitle: '',
  earnText: '',
  redeemTitle: '',
  redeemText: '',
  contactTitle: '',
  contactText: '',
  contactEmail: '',
  contactPhone: '',
  footerText: '',
  howToEarn: [],
  termsAndConditions: [],
};

const CampaignFormContext = createContext<CampaignFormContextType | undefined>(undefined);

export const CampaignFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<CampaignFormData>(defaultFormData);

  const updateFormData = (fields: Partial<CampaignFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const resetFormData = () => {
    setFormData(defaultFormData);
  };

  return (
    <CampaignFormContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </CampaignFormContext.Provider>
  );
};

export const useCampaignForm = () => {
  const context = useContext(CampaignFormContext);
  if (!context) {
    throw new Error('useCampaignForm must be used within a CampaignFormProvider');
  }
  return context;
};
