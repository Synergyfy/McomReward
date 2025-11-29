import React, { useMemo } from 'react';
import { mockCustomerData } from '@/lib/mock-data/customer';
import { useGetParticipantGlobalBalance, useGetParticipantProfile } from '@/services/customer-campaigns/hook';
import { PointsBalanceDisplay } from './PointsBalanceDisplay';

export function PointsBalanceCard() {

  const { data: balanceData, isLoading: isBalanceLoading } = useGetParticipantGlobalBalance();
  const { data: profileData, isLoading: isProfileLoading } = useGetParticipantProfile();

  const totalPoints = balanceData?.globalTotalPoints || 0;
  const matchingPoints = balanceData?.matchingPoints || 0;
  const utilization = profileData?.point_utilization || 0;

  // Using mock data for badge if profile doesn't have it, or fallback
  const badgeLevel = mockCustomerData.customerBadge;

  return (
    <PointsBalanceDisplay
      totalPoints={totalPoints}
      matchingPoints={matchingPoints}
      utilization={utilization}
      badgeLevel={badgeLevel}
      isLoading={isBalanceLoading || isProfileLoading}
    />
  );
}
