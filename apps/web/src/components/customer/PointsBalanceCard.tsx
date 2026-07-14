import React from 'react';
import { mockCustomerData } from '@/lib/mock-data/customer';
import { useGetParticipantGlobalBalance, useGetParticipantProfile } from '@/services/customer-campaigns/hook';
import { PointsBalanceDisplay } from './PointsBalanceDisplay';

export function PointsBalanceCard() {

  const { data: balanceData, isLoading: isBalanceLoading } = useGetParticipantGlobalBalance();
  const { data: profileData, isLoading: isProfileLoading } = useGetParticipantProfile();

  const totalPoints = balanceData?.globalTotalPoints || 0;
  const matchingPoints = balanceData?.matchingPoints || 0;
  
  // Calculate total stamps from campaign balances
  const totalStamps = (profileData?.campaignBalances || profileData?.campaign_balances || []).reduce(
    (acc, cb) => {
      const stampBalance = 'stampBalance' in cb ? cb.stampBalance : (cb as any).stamp_balance;
      return acc + (stampBalance || 0);
    },
    0
  );

  const utilization = profileData?.point_utilization || profileData?.pointUtilization || 0;
  // Use profile data badge if available, otherwise mock or default
  // Note: customerBadge is not in the ParticipantProfileResponse type yet, so we default to mock
  const badgeLevel = mockCustomerData.customerBadge;

  return (
    <PointsBalanceDisplay
      totalPoints={totalPoints}
      matchingPoints={matchingPoints}
      totalStamps={totalStamps}
      utilization={utilization}
      badgeLevel={badgeLevel}
      isLoading={isBalanceLoading || isProfileLoading}
    />
  );
}
