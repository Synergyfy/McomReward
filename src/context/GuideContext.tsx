'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetBusinessSetupStatus } from '@/services/business/hook';
import { GuideStep } from '@/lib/guide-content';

interface GuideContextType {
  currentStep: GuideStep;
  isLoading: boolean;
  refreshGuide: () => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<GuideStep>('REWARD');

  const { data: status, isLoading, refetch } = useGetBusinessSetupStatus();

  useEffect(() => {
    if (isLoading) return;

    if (!status) {
      // If status fails to load, maybe default to REWARD or handle error
      setCurrentStep('REWARD');
      return;
    }

    if (!status.hasReward) {
      setCurrentStep('REWARD');
      return;
    }

    if (!status.hasCampaign) {
      setCurrentStep('CAMPAIGN');
      return;
    }

    if (!status.hasStaff) {
      setCurrentStep('STAFF');
      return;
    }

    setCurrentStep('COMPLETED');

  }, [status, isLoading]);

  const refreshGuide = () => {
    refetch();
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
