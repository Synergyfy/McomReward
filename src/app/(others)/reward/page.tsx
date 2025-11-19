// src/app/(others)/reward/page.tsx
import React from 'react';
import HeroSection from '../../../components/reward/HeroSection';
import RewardLevelsSection from '../../../components/reward/RewardLevelsSection';
import RewardTypesSection from '../../../components/reward/RewardTypesSection';
import InteractiveRewardFlowSection from '../../../components/reward/InteractiveRewardFlowSection';
import HowItWorksBusiness from '@/components/reward/InteractiveRewardFlowSection copy' 
import BusinessConsumerCTASection from '../../../components/reward/BusinessConsumerCTASection';
import FinalCTASection from '../../../components/reward/FinalCTASection';

const RewardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <RewardLevelsSection />
      <RewardTypesSection />
      
      <HowItWorksBusiness />
      <BusinessConsumerCTASection />
      <InteractiveRewardFlowSection />
      <FinalCTASection />
    </div>
  );
};

export default RewardPage;