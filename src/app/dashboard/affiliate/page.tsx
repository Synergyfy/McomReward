import React from 'react';
import InviteCard from '@/components/dashboard/affiliate/InviteCard';
import StatsSummary from '@/components/dashboard/affiliate/StatsSummary';
import ReferralsHistoryTable from '@/components/dashboard/affiliate/ReferralsHistoryTable';
import RewardsLadder from '@/components/dashboard/affiliate/RewardsLadder';
import { affiliateData } from '@/lib/mock-data/affiliate';

export default function AffiliatePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Affiliate Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <InviteCard 
            referralLink={affiliateData.referralLink} 
            qrCodeUrl={affiliateData.qrCodeUrl} 
          />
          <ReferralsHistoryTable referrals={affiliateData.referrals} />
        </div>
        <div className="space-y-8">
          <StatsSummary stats={affiliateData.stats} />
          <RewardsLadder tiers={affiliateData.rewardsLadder} />
        </div>
      </div>
    </div>
  );
}
