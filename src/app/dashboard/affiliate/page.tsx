'use client';

import React from 'react';
import InviteCard from '@/components/dashboard/affiliate/InviteCard';
import StatsSummary from '@/components/dashboard/affiliate/StatsSummary';
import ReferralsHistoryTable from '@/components/dashboard/affiliate/ReferralsHistoryTable';
import RewardsLadder from '@/components/dashboard/affiliate/RewardsLadder';
import { useAffiliateCode, useAffiliateStats } from '@/services/affiliate/hook';
import { affiliateData } from '@/lib/mock-data/affiliate';

export default function AffiliatePage() {
  const { data: affiliateCodeData, isLoading: isLoadingCode, isError: isErrorCode } = useAffiliateCode();
  const { data: statsData, isLoading: isLoadingStats, isError: isErrorStats } = useAffiliateStats();

  const referralLink = `https://mcom.loyal/signup?ref=${affiliateCodeData?.code || ''}`;
  const qrCodeUrl = '/placeholder-qr.svg';


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Affiliate Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isLoadingCode && <p>Loading invite code...</p>}
          {isErrorCode && <p>Error loading invite code.</p>}
          {affiliateCodeData && (
            <InviteCard
              referralLink={referralLink}
              qrCodeUrl={qrCodeUrl}
              inviteCode={affiliateCodeData.code}
            />
          )}
          {isLoadingStats && <p>Loading referrals...</p>}
          {isErrorStats && <p>Error loading referrals.</p>}
          {statsData && <ReferralsHistoryTable referrals={statsData.referredBusinesses || []} />}
        </div>
        <div className="space-y-8">
          {isLoadingStats && <p>Loading stats...</p>}
          {isErrorStats && <p>Error loading stats.</p>}
          {statsData && <StatsSummary stats={statsData} />}
          <RewardsLadder tiers={affiliateData.rewardsLadder} />
        </div>
      </div>
    </div>
  );
}
