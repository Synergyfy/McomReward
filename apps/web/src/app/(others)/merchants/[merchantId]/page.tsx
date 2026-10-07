"use client";

import React, { use } from 'react';
import Link from 'next/link';
import {
  useGetPublicCampaignDetails,
  useGetParticipantBalance,
  useRedeemRewardSelf,
  useCheckCampaignJoinStatus,
  useJoinCampaign,
} from '@/services/customer-campaigns/hook';

interface PageProps {
  params: Promise<{ merchantId: string }>;
}

export default function PartnerMerchantDetails({ params }: PageProps) {
  const { merchantId } = use(params);

  const { data: campaign, isLoading, isError } = useGetPublicCampaignDetails(merchantId);
  const { data: joinStatus } = useCheckCampaignJoinStatus(merchantId);
  const { data: balance } = useGetParticipantBalance(merchantId);
  const joinMutation = useJoinCampaign();
  const redeemMutation = useRedeemRewardSelf();

  if (isLoading) {
    return <p className="max-w-7xl mx-auto px-6 py-8 text-sm text-gray-500">Loading merchant…</p>;
  }
  if (isError || !campaign) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
        <p className="text-sm text-red-600">This merchant campaign could not be found.</p>
        <Link href="/campaigns" className="text-orange-500 font-bold text-xs">Browse campaigns</Link>
      </div>
    );
  }

  const business = campaign.business;
  const rewards = [...(campaign.businessRewards ?? []), ...(campaign.rewards ?? [])];
  const availablePoints = balance?.balance ?? 0;

  const handleRedeem = (rewardId: string) => {
    redeemMutation.mutate(
      { rewardId, campaignId: merchantId },
      {
        onError: () => alert('Redemption failed. You may not have enough points or need to join first.'),
      },
    );
  };

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-16">

      {/* Breadcrumbs */}
      <nav className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Link href="/brands" className="hover:text-orange-500 transition-colors">Brands</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-gray-650">{business?.name ?? campaign.name}</span>
      </nav>

      {/* Hero / Partner Identity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-50 text-orange-650 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px] fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            {campaign.audienceType ?? 'Partner'}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-headline-lg text-gray-900 leading-tight">
            {business?.name ?? campaign.name}
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl">
            {campaign.campaignMessage}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {!joinStatus?.isJoined ? (
              <button
                onClick={() => joinMutation.mutate(merchantId)}
                disabled={joinMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-xs shadow-md shadow-orange-500/10 active:scale-95 transition-all disabled:opacity-50"
              >
                {joinMutation.isPending ? 'Joining…' : 'Join Campaign'}
              </button>
            ) : (
              <span className="border border-green-300 text-green-700 px-8 py-3 rounded-full font-bold text-xs">
                Campaign Joined
              </span>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div
            className="aspect-square rounded-[32px] overflow-hidden shadow-md bg-cover bg-center transform hover:scale-[1.01] transition-transform duration-500"
            style={{ backgroundImage: `url('${campaign.bannerUrl || business?.banner || business?.profileImage || ''}')` }}
          />
          {business?.address && (
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">{business.address}</p>
                {business.phone && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{business.phone}</p>}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Points Status */}
      <section>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-150 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-orange-550 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[140px]">workspace_premium</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Status</h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-extrabold text-orange-500">{campaign.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Total Earned in Campaign</span>
                  <span className="text-orange-550">{campaign.totalPointsEarned.toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Total Redeemed in Campaign</span>
                  <span className="text-orange-550">{campaign.totalPointsRedeemed.toLocaleString()} pts</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 text-center space-y-1">
                <p className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Rewards Left</p>
                <p className="text-3xl font-extrabold text-gray-800">{campaign.remainingQuantity}</p>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 text-center space-y-1">
                <p className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Available Points</p>
                <p className="text-3xl font-extrabold text-orange-500">{availablePoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Rewards - Bento Grid */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Active Rewards</h2>
            <p className="text-xs text-gray-500 mt-1">Redeem your hard-earned points for exclusive perks.</p>
          </div>
        </div>

        {rewards.length === 0 ? (
          <p className="text-sm text-gray-500">No rewards available in this campaign yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {rewards.map((reward, idx) => {
              const cost = Number(reward.pointRequired ?? reward.maxPoints ?? reward.max_points ?? 0);
              const card = (
                <div key={reward.id} className={idx === 0 ? 'lg:col-span-2 bg-white rounded-[32px] p-6 border border-gray-150 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow group' : 'bg-white rounded-[24px] p-5 border border-gray-150 flex group hover:shadow-md transition-shadow justify-between gap-4'}>
                  {(reward.image || campaign.logoUrl) && (
                    <div
                      className={idx === 0 ? 'w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden bg-cover bg-center shrink-0' : 'w-24 h-24 aspect-square rounded-xl bg-cover bg-center shrink-0'}
                      style={{ backgroundImage: `url('${reward.image || campaign.logoUrl}')` }}
                    />
                  )}
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-gray-800 group-hover:text-orange-500 transition-colors">
                        {reward.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                        {reward.description}
                      </p>
                      <span className="text-orange-500 font-extrabold text-xs">
                        {cost > 0 ? `${cost.toLocaleString()} pts` : 'Free'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={redeemMutation.isPending || availablePoints < cost}
                      className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-xs transition active:scale-95 disabled:opacity-40"
                    >
                      {redeemMutation.isPending ? 'Redeeming…' : availablePoints < cost ? 'Not enough points' : 'Redeem Reward'}
                    </button>
                  </div>
                </div>
              );
              return card;
            })}
          </div>
        )}
      </section>

    </div>
  );
}
