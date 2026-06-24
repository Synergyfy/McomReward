'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetParticipantProgression } from '@/services/progression/hook';
import { useGetParticipantProfile } from '@/services/customer-campaigns/hook';
import Link from 'next/link';
import { 
  Loader2, 
  Rocket, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Check, 
  Star,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function CustomerProgressionPage() {
  const router = useRouter();
  const { data: progression, isLoading, isError } = useGetParticipantProgression();
  const { data: profile } = useGetParticipantProfile();

  const [strokeOffset, setStrokeOffset] = useState(276.46);

  const currentBadge = progression?.currentBadge || {
    id: 'gold',
    name: 'Gold',
    multiplier: 2.0,
    benefits: [
      "Free Priority Delivery (On all orders over $30)",
      "10% Extra Points (Earn faster on every purchase)"
    ],
    color: '#f54900',
    priority: 2
  };

  const nextBadge = progression?.nextBadge || {
    id: 'platinum',
    name: 'Platinum',
    minPoints: 1000,
    benefits: ["VIP Concierge (Available at Platinum Tier)"]
  };

  const totalPoints = progression?.currentPoints ?? 750;
  const nextPoints = nextBadge ? nextBadge.minPoints : 1000;
  const progressPercent = totalPoints >= nextPoints ? 100 : Math.round((totalPoints / nextPoints) * 100);

  useEffect(() => {
    // Circumference = 2 * PI * r = 2 * 3.14159 * 44 = 276.46
    const circumference = 276.46;
    const offset = circumference - (progressPercent / 100) * circumference;
    setStrokeOffset(offset);
  }, [progressPercent]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafb] text-gray-550">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 opacity-20" />
          <Rocket className="h-6 w-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
        </div>
        <p className="mt-6 font-bold text-gray-400 animate-pulse tracking-widest uppercase text-xs">Synchronizing Journey...</p>
      </div>
    );
  }

  if (isError || !progression) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafb] text-gray-800 text-center px-6">
        <div className="bg-red-500/10 p-6 rounded-3xl mb-6 border border-red-500/20">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Connection Interrupted</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          We couldn't retrieve your progression data.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-orange-650 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-2xl shadow-lg transition-all hover:scale-105"
        >
          Try Reconnecting
        </Button>
      </div>
    );
  }

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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTWMmHPKz66MhzyycvvK9PPWPi9S2TpAW5SCpA3lTkZZlJazloVYCPUhk4RL0VIABKe8LsY7Cxsx4JPF2ZOwVsqmsu6EPnL6MULPBiK1MoyGCAfMiZ4rPz0pWlbnn8OJkzkuLiks3Sd0TQUSzz5b3Fqf6bx7JVgH7Ty2g3RlPxfNnB8H9XyfTiJQzbl_HKnymSfbS5D7hR6O_fH7s-BhPfnRmveiPi5ROoW89hnqusV6F0z2J61poKb6Tew5XtvFyBaYwKDstxQPA" 
                alt="Profile Avatar"
              />
              <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">JS</AvatarFallback>
            </Avatar>
          </div>
          <span className="font-extrabold text-lg text-gray-900">{currentBadge.name} Member</span>
        </div>
        <button className="text-gray-500 hover:text-gray-805 active:scale-95 duration-200 transition-transform">
          <Search className="w-6 h-6" />
        </button>
      </header>

      <main className="pt-6 space-y-6">
        {/* Hero: Status Section */}
        <section className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 space-y-4 shadow-md">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Base circle */}
                <circle 
                  className="text-gray-100" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="44" 
                  stroke="currentColor" 
                  strokeWidth="6"
                />
                {/* Progress circle */}
                <circle 
                  className="text-orange-500 transition-all duration-500" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="44" 
                  stroke="currentColor" 
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Star className="w-12 h-12 text-orange-500 fill-current" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-extrabold text-orange-600 tracking-wider uppercase">{currentBadge.name} TIER</h2>
              <p className="text-sm text-gray-500 font-semibold mt-1">
                {totalPoints.toLocaleString()} / {nextPoints.toLocaleString()} pts to {nextBadge ? nextBadge.name : 'Max'}
              </p>
            </div>
            <div className="w-full mt-6 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span>{currentBadge.name}</span>
                <span className="text-orange-500">{nextBadge ? nextBadge.name : 'Max'}</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Your Benefits Section */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 px-1">Your Active Benefits</h3>
          <div className="grid grid-cols-1 gap-3">
            {currentBadge.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mr-4 shrink-0 text-orange-655">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{benefit.split(' (')[0]}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{benefit.includes('(') ? benefit.split(' (')[1].replace(')', '') : `Active benefit at ${currentBadge.name} tier`}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              </div>
            ))}
            
            {/* Locked Next Badge Preview */}
            {nextBadge && nextBadge.benefits && nextBadge.benefits.length > 0 && (
              <div className="flex items-center p-4 bg-white opacity-60 rounded-xl border border-gray-200">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mr-4 shrink-0 text-gray-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-400 truncate">{nextBadge.benefits[0].split(' (')[0]}</p>
                  <p className="text-xs text-gray-450 mt-0.5">Available at {nextBadge.name} Tier</p>
                </div>
                <Lock className="w-5 h-5 text-gray-400 shrink-0" />
              </div>
            )}
          </div>
        </section>

        {/* Milestone Progress Timeline */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 px-1">Milestone Progress</h3>
          <div className="relative pl-2 space-y-6">
            {/* Vertical Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-gray-200 rounded-full z-0" />
            
            {/* Completed Milestone */}
            <div className="relative flex items-start gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-white flex items-center justify-center shadow-md shrink-0">
                <Check className="w-4 h-4 text-white stroke-[3]" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-bold text-orange-600">500 Points Reached</p>
                <p className="text-xs text-gray-500">Unlocked: $10 Reward Voucher</p>
              </div>
            </div>

            {/* In Progress Milestone */}
            <div className="relative flex items-start gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-white border-4 border-orange-500 flex items-center justify-center shadow-md shrink-0">
                <Award className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-bold text-gray-800">{nextPoints} Points Milestone</p>
                <p className="text-xs text-gray-500">Upcoming: Mystery Gift Box</p>
                <div className="mt-2 h-1 w-32 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Locked Milestone */}
            <div className="relative flex items-start gap-4 z-10 opacity-50">
              <div className="w-10 h-10 rounded-full bg-gray-50 border-4 border-gray-200 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-bold text-gray-400">Platinum Upgrade</p>
                <p className="text-xs text-gray-500">{nextPoints} Points required</p>
              </div>
            </div>
          </div>
        </section>

        {/* Promo Banner */}
        <section className="rounded-2xl overflow-hidden relative h-40 flex items-end p-5 group cursor-pointer shadow-md border border-gray-200">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCvZxadqQ4aosf9pjptinrfNhNGK3vAyUtwHt9BHSGqkNDweBk8XsNsrtiEzGVcnSGryRNRHcdYysALY7ZH1IzRXxUjxfomjHN4jjK2Th38_KpnFgSjP9ztnFidREoa2BhKu3k8X3o_853fsUYVbvGTp3xz-nFg1gXiv6ukk9JcMr62VLO2vcRsK1-jNy9YLkQqrXCWKP3fRmUFv_BAKFKGs4nNA-z07mTkNWpsbTZjhKNzA-cUjqeM2tMTnALcNaHv7NJ-2fq53xk')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="relative z-10 space-y-1">
            <h4 className="text-base text-orange-400 font-extrabold uppercase italic tracking-tighter">Double Points Weekend</h4>
            <p className="text-xs text-gray-250">Earn 2x points on all categories until Sunday.</p>
          </div>
        </section>

        {/* Subscription / Navigation Controls */}
        <section className="space-y-3 pb-8">
          <button 
            onClick={() => router.push('/participant/settings')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-2xl shadow-md active:scale-[0.98] transition-all duration-200 text-sm uppercase tracking-wider"
          >
            View Profile & Preferences
          </button>
          <p className="text-center font-semibold text-xs text-gray-550 hover:underline cursor-pointer">
            View Terms & Conditions
          </p>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl">
        <button onClick={() => router.push('/participant')} className="flex flex-col items-center justify-center text-gray-550 hover:text-orange-600 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] mt-0.5">Home</span>
        </button>
        <button onClick={() => router.push('/participant/market')} className="flex flex-col items-center justify-center text-gray-550 hover:text-orange-600 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">storefront</span>
          <span className="text-[10px] mt-0.5">Market</span>
        </button>
        <button onClick={() => router.push('/participant/wallet')} className="flex flex-col items-center justify-center text-gray-550 hover:text-orange-600 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">account_balance_wallet</span>
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
