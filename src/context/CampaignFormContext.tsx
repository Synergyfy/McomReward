'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CampaignFormData {
  campaignType: string;
  campaignName: string;
  rewardId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  rewardsAvailable: number;
  audienceType: 'everyone' | 'members' | 'badge_level';
  badgeLevel?: string;
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
    stopAfterClaims: number;
    pauseOnRewardEmpty: boolean;
    autoSwitchToPoints: boolean;
  };
  bgColor: string;
  ctaBgColor: string;
  bgColorTextColor: string;
  ctaTextColor: string;
}

interface CampaignFormContextType {
  formData: CampaignFormData;
  updateFormData: (fields: Partial<CampaignFormData>) => void;
  resetFormData: () => void;
}

const defaultFormData: CampaignFormData = {
  campaignType: '',
  campaignName: '',
  rewardId: '',
  startDate: undefined,
  endDate: undefined,
  rewardsAvailable: 0,
  audienceType: 'everyone',
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
    autoSwitchToPoints: false,
  },
  bgColor: '#FFFFFF',
  ctaBgColor: '#000000',
  bgColorTextColor: '#000000',
  ctaTextColor: '#FFFFFF',
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
