'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetBusinessProfile } from '@/services/business/hook';
import { useGetBusinessRewards } from '@/services/business-reward/hooks';
import { useGetMyCreatedCampaigns } from '@/services/campaigns/hook';
import { useGetAllStaff } from '@/services/staff/hook';
import { GuideStep } from '@/lib/guide-content';

interface GuideContextType {
  currentStep: GuideStep;
  isLoading: boolean;
  refreshGuide: () => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<GuideStep>('PROFILE');

  // Fetch data to determine step
  // 1. Profile
  const { data: profile, isLoading: loadingProfile, refetch: refetchProfile } = useGetBusinessProfile();

  // 2. Rewards (Check if any exist)
  const { data: rewards, isLoading: loadingRewards, refetch: refetchRewards } = useGetBusinessRewards(1, 1);

  // 3. Campaigns (Check if any created)
  const { data: campaigns, isLoading: loadingCampaigns, refetch: refetchCampaigns } = useGetMyCreatedCampaigns(1, 1);

  // 4. Staff (Check if any exist)
  const { data: staff, isLoading: loadingStaff, refetch: refetchStaff } = useGetAllStaff();

  const isLoading = loadingProfile || loadingRewards || loadingCampaigns || loadingStaff;

  useEffect(() => {
    if (isLoading) return;

    if (!profile) {
      // If profile fails to load, maybe default to PROFILE or handle error
      setCurrentStep('PROFILE');
      return;
    }

    // Check Profile Completion
    // We consider it incomplete if address or phone is missing, or if the name is just default?
    // Let's assume critical fields: address, phone.
    const isProfileComplete = !!(profile.address && profile.phone);

    if (!isProfileComplete) {
      setCurrentStep('PROFILE');
      return;
    }

    // Check Rewards
    const hasRewards = rewards?.total ? rewards.total > 0 : false;
    if (!hasRewards) {
      setCurrentStep('REWARD');
      return;
    }

    // Check Campaigns
    const hasCampaigns = campaigns?.total ? campaigns.total > 0 : false;
    if (!hasCampaigns) {
      setCurrentStep('CAMPAIGN');
      return;
    }

    // Check Staff
    // The staff API returns an array directly in .data usually, but let's check the type.
    // PaginatedStaffResponse: { data: Staff[], total: number, ... }
    const hasStaff = staff?.length ? staff.length > 0 : false;
    // Wait, useGetAllStaff select: (data) => data.data. So `staff` is Staff[].
    // Let's re-verify the hook return type.

    if (!hasStaff) {
      setCurrentStep('STAFF');
      return;
    }

    setCurrentStep('COMPLETED');

  }, [profile, rewards, campaigns, staff, isLoading]);

  const refreshGuide = () => {
    refetchProfile();
    refetchRewards();
    refetchCampaigns();
    refetchStaff();
  };

  return (
    <GuideContext.Provider value={{ currentStep, isLoading, refreshGuide }}>
      {children}
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
};
