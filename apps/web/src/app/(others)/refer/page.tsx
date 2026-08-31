"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Share2, 
  Gift, 
  TrendingUp, 
  Smartphone, 
  ChevronRight,
  Sparkles,
  Users2,
  Inbox,
  ArrowLeft,
  Check,
  Copy,
  UserPlus
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetParticipantProfile } from '@/services/customer-campaigns/hook';
import { useGetMyReferrals } from '@/services/referral/hook';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function ReferFriendsFamily() {
  const router = useRouter();
  const { data: profile } = useGetParticipantProfile();
  const { data: referrals } = useGetMyReferrals();

  const [copied, setCopied] = useState(false);

  const uniqueCode = profile?.uniqueCode;
  const referLink = uniqueCode ? `https://mcom.io/ref/${uniqueCode}` : null;

  const handleCopyLink = () => {
    if (!referLink) {
      toast.error('Referral link unavailable');
      return;
    }
    navigator.clipboard.writeText(referLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const userName = profile?.name || 'Member';
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "";
  const badgeLabel = profile?.customerBadge || profile?.customer_badge || "Member";

  const totalInvites = referrals?.length ?? 0;
  const successfulInvites = referrals?.filter((r) => r.status === 'SUCCESSFUL').length ?? 0;

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 pb-32 pt-4 px-4 max-w-md mx-auto font-sans relative">
      {/* Top App Bar */}
      <header className="flex items-center justify-between w-full py-4 border-b border-gray-200 bg-[#f9fafb] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => router.push('/participant/settings')}
            className="w-10 h-10 rounded-full border-2 border-orange-500 overflow-hidden cursor-pointer active:scale-95 duration-200 transition-transform"
          >
            <Avatar className="h-full w-full">
              <AvatarImage src={undefined} alt="Profile Avatar" />
              <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">{initials || "ME"}</AvatarFallback>
            </Avatar>
          </div>
          <span className="font-extrabold text-lg text-gray-900">{badgeLabel}</span>
        </div>
        <div className="flex items-center">
          <button className="text-gray-505 hover:text-gray-800 active:scale-95 duration-200 transition-transform">
            <Search className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="pt-6 space-y-6">
        {/* Hero Section: Referral Pulse */}
        <section className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 p-6 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users2 className="w-24 h-24 text-orange-550" />
          </div>
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider border border-orange-100">
              <Sparkles className="w-3 h-3 fill-current" />
              SHARE & EARN
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
              Grow Your <br />
              <span className="text-orange-600">Inner Circle</span>
            </h2>
            <p className="text-sm text-gray-500 max-w-[280px]">
              Invite friends and family to the club and earn bonus points for every successful join.
            </p>
            <div className="flex gap-4 pt-2">
              <button 
                onClick={handleCopyLink}
                disabled={!referLink}
                className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link Copied!" : "Invite Now"}
              </button>
              <button 
                onClick={() => {
                  if (!referLink) return;
                  if (navigator.share) {
                    navigator.share({
                      title: 'Join MCOM',
                      text: `Join me on MCOM!`,
                      url: referLink,
                    }).catch(console.error);
                  } else {
                    handleCopyLink();
                  }
                }}
                disabled={!referLink}
                className="w-12 h-12 flex items-center justify-center border border-gray-200 bg-white rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            {referLink ? (
              <p className="text-[10px] text-gray-400 font-semibold break-all">{referLink}</p>
            ) : (
              <p className="text-[10px] text-gray-400 font-semibold">Your referral link will appear here once available.</p>
            )}
          </div>
        </section>

        {/* Referral Stats Bento */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-1 shadow-sm">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Invites</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-extrabold text-orange-600">{totalInvites}</span>
              <Users2 className="w-5 h-5 text-orange-600 mb-1" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-1 shadow-sm">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Successful</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-extrabold text-green-600">{successfulInvites}</span>
              <TrendingUp className="w-5 h-5 text-green-600 mb-1" />
            </div>
          </div>
        </section>

        {/* Share Actions */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-gray-900">Share the Wealth</h3>
          {/* Share Rewards Card */}
          <div 
            onClick={() => router.push('/reward')}
            className="group relative overflow-hidden rounded-xl bg-white p-4 flex items-center gap-4 border border-gray-200 active:scale-95 transition-transform cursor-pointer hover:bg-gray-50 shadow-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-orange-100/30 flex items-center justify-center text-orange-600">
              <Gift className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-800">Share Rewards</h4>
              <p className="text-xs text-gray-500">Send your active vouchers to family</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          {/* Share Gift Cards Card */}
          <div 
            onClick={() => router.push('/gift-cards')}
            className="group relative overflow-hidden rounded-xl bg-white p-4 flex items-center gap-4 border border-gray-200 active:scale-95 transition-transform cursor-pointer hover:bg-gray-50 shadow-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-orange-105 flex items-center justify-center text-orange-600 bg-orange-50">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-800">Share Gift Cards</h4>
              <p className="text-xs text-gray-500">Transfer credit to anyone in your list</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </section>

        {/* Recent Referrals */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {referrals && referrals.length > 0 ? (
              referrals.slice(0, 5).map((ref) => {
                const isSuccessful = ref.status === 'SUCCESSFUL';
                return (
                  <div key={ref.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">{ref.referee?.name || ref.refereeEmail}</p>
                      <p className={`text-[10px] font-semibold ${isSuccessful ? 'text-green-600' : 'text-gray-500'}`}>
                        {isSuccessful ? 'Joined Successfully' : 'Invite Pending'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {isSuccessful ? (
                        <p className="font-bold text-sm text-orange-600">+{ref.pointsEarned || 0}</p>
                      ) : (
                        <p className="text-xs text-gray-500 italic font-semibold">Pending</p>
                      )}
                      <p className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(ref.created_at || ref.createdAt || Date.now()), { addSuffix: true })}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="p-4 bg-gray-50 rounded-full inline-block mb-4 border border-gray-100">
                  <Inbox className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold">No referrals yet. Invite someone to get started!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl">
        <button onClick={() => router.push('/participant')} className="flex flex-col items-center justify-center text-gray-550 hover:text-orange-600 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] mt-0.5">Home</span>
        </button>
        <button onClick={() => router.push('/participant/market')} className="flex flex-col items-center justify-center text-[#c6c6cd] hover:text-[#ffe083] active:scale-90 transition-transform">
          <span className="text-gray-550 hover:text-orange-600 material-symbols-outlined">storefront</span>
          <span className="text-[10px] mt-0.5">Market</span>
        </button>
        <button onClick={() => router.push('/participant/wallet')} className="flex flex-col items-center justify-center text-[#c6c6cd] hover:text-[#ffe083] active:scale-90 transition-transform">
          <span className="text-gray-550 hover:text-orange-600 material-symbols-outlined">account_balance_wallet</span>
          <span className="text-[10px] mt-0.5">Wallet</span>
        </button>
        <button onClick={() => router.push('/play-win')} className="flex flex-col items-center justify-center text-gray-550 hover:text-orange-600 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">casino</span>
          <span className="text-[10px] mt-0.5">Games</span>
        </button>
        <button onClick={() => router.push('/participant/settings')} className="flex flex-col items-center justify-center bg-orange-50 text-orange-600 rounded-full px-4 py-1.5 active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
}