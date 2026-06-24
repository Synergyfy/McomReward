"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  Copy
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetParticipantProfile, useGetParticipantGlobalBalance } from '@/services/customer-campaigns/hook';
import { toast } from 'sonner';

export default function ReferFriendsFamily() {
  const router = useRouter();
  const { data: profile } = useGetParticipantProfile();
  const { data: balance } = useGetParticipantGlobalBalance();

  const [copied, setCopied] = useState(false);
  const referLink = "mcom.io/ref/user_99";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const userName = profile?.name || 'Julian Sterling';

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
              <AvatarImage 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuByn4bD2TxUuyfrLwPSNVyhQyOYnku1WrpjaNjL3WHu1Fcw5Tnplm6HI_ZEdKRuLeqP6ngMpFqaICV5yCA6oTb3vtlJVcRpFcFv4asTVyJeP2Ngi3kMBEvcZmLQE-g4W-anwkdQx6aPYhYyp51HJ4zPVeHjpOaHIfYE6AMZlF4tYpCdU0O5DGA97I-o5fg_0JtWxi7K0tf5orIYViyu5dnOfJB_BUHgVQ5mScxsCeXrDYauRhrA8K87jUFZLogHYC1scqcjynBBUBo" 
                alt="Profile Avatar"
              />
              <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">JS</AvatarFallback>
            </Avatar>
          </div>
          <span className="font-extrabold text-lg text-gray-900">Gold Member</span>
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
              LIMITED TIME MULTIPLIER
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
              Grow Your <br />
              <span className="text-orange-600">Inner Circle</span>
            </h2>
            <p className="text-sm text-gray-500 max-w-[280px]">
              Invite friends and family to the club. Earn 5,000 bonus points for every successful join.
            </p>
            <div className="flex gap-4 pt-2">
              <button 
                onClick={handleCopyLink}
                className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link Copied!" : "Invite Now"}
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Join MCOM',
                      text: 'Join MCOM Gold Member Club!',
                      url: referLink,
                    }).catch(console.error);
                  } else {
                    handleCopyLink();
                  }
                }}
                className="w-12 h-12 flex items-center justify-center border border-gray-200 bg-white rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Referral Stats Bento */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-1 shadow-sm">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Earned</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-extrabold text-orange-600">24.5k</span>
              <span className="text-xs text-gray-500 mb-1 font-semibold">pts</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-1 shadow-sm">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Active Invites</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-extrabold text-green-600">08</span>
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
            <button className="text-orange-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-2">
            {/* Activity Item 1 */}
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                <Avatar className="w-full h-full">
                  <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYkXJX8cjwiw8bCA1zVObRp2uYHlk8lwTf8532cTAgpPDGqeENkGyV59xYwdc8wfv3umonaOqnFvLNvjEqJD942NCf-2usYuft0swTjio-xNsDMSX3i9JCQEJTb7iInOXRWdCYX6iNm9LVmfEt241xNrgvLsK0VP-CzcEYSbJLg7uxy6TPnnwgnF52jTaxQ7oa_j9ZFy8uh5KnB4mcp2CcA12LaTuhrRjGcsypaUFrQlG_oRzHEfG8KaReWjPBt77iRtJESVW7BRI" />
                  <AvatarFallback>ER</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-800">Elena Rodriguez</p>
                <p className="text-[10px] text-green-600 font-semibold">Joined Successfully</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-orange-600">+5,000</p>
                <p className="text-[10px] text-gray-500">2 days ago</p>
              </div>
            </div>
            {/* Activity Item 2 */}
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                <Avatar className="w-full h-full">
                  <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOzDmmaV7zvdSQ0RiJi85p79D-QHf1shXdAE4iW1uArE-c_9Ii1Z2UIlwkZhS_yfVaqopPamLNwntobpA4QSBn89sfY1J3I-T-rhkkQ6oPISD0IVPEIR36JMfCCOKG64oavOTQKMCVkdXcDZnmAlT8bPXtJsRfgrYUewTMpPMXj4SZAsm1s2PcovcYuZRoWyaZreVUB4a-rp49UjtRmlYjZvPeUinrgzYC64FESAtqCnFA3a_4fVQ76AyT7aMsC0mBwzv35FduaHQ" />
                  <AvatarFallback>DM</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-800">David Miller</p>
                <p className="text-[10px] text-gray-500 font-semibold">Invite Pending</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 italic font-semibold">Pending</p>
                <p className="text-[10px] text-gray-500">1 week ago</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Banner */}
        <section className="py-4">
          <div className="bg-white rounded-2xl p-5 text-center space-y-4 border border-orange-200 shadow-sm">
            <div className="flex justify-center -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyJY2MHDRiACE51PIjTuu1PjgdxND5Qul1EYkqLmOPjAARuDMTAZnbtPGROWqBL4jWUCyivyiv9DF-4DtkCinAm1FcSO4QVXFoHFtxoHzrQMkYhePc-HdeeLYsRQqfLzpryfFP2vv5x4T8vKKi6bHYRGvyYJKl5D8OTWn8TyyumC3y70FBldsxzuSk8v_rRBwmG5WnVB5y5_IgJST7mMLAUcuLUCKLVW_f-waXJV2qskU2mBWwKMCZAWAzjwa7oawi43Ba3NW56Qk" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4UTrFEgcSOcEoxurvthQ9zDRQkBehPcldRha0VRXvl6Q9aX9nEjRjl-GRg5Zlt-afja73ekif12J9jgl_GkN9_77IU12qe08A-J10zr0qZ-y2do4Mc4ZROKtaERKDDTMgHumveSOza3qM_tIyp_7AbZvuIynageDAofQCb29Z66budLlKzTCWDosTXVQAy6OMe9hKfNtYrVoqw-QuA5fVnQwvbJgC7_AlqNeSpZ1olu3BeRf8vfkFvByUxCMSA17PrYthn3idX6s" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgxz7aFfyfwrNIPsFPBvbV2h4pSeT2X4B2FYF3Z8v4ICpDxCraoNbxtudjxEKN8fBVpdQoTs47nBY_85_hhHXe_S8bOmSTb8iYILUNdZTmPY6Ic5JV7hcMFWr4v1yzxpVPQ4P1RG33ysWvo-eGMCUv18eQflcA_8GKed-pFGOyYT84ReEvqF2YNoYPD-HPt22Z1KV_7s7Us0n0Y7hn9Rbl40n5p0oTv1dkiycVaSniMvqyCelRjeXY5aH8OgfIlI-x_lC1Ca-TMFc" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-orange-600 font-bold text-xs">
                +12
              </div>
            </div>
            <h4 className="font-bold text-sm text-gray-900">Your family is already here.</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              12 members of your contacts list have joined the Gold Tier this month.
            </p>
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
