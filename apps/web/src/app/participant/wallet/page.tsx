'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCreditsBalance, useGetCreditsHistory } from '@/services/cashback/hook';
import { useGetParticipantGlobalBalance } from '@/services/customer-campaigns/hook';
import { useGetParticipantProgression } from '@/services/progression/hook';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  TrendingUp,
  Sparkles,
  Gift,
  Lock,
  ChevronDown,
  Activity,
  SlidersHorizontal,
  Ticket
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type CreditsHistoryItem } from '@/services/cashback/types';

export default function ParticipantWalletPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("gift-cards");
  const [subTab, setSubTab] = useState("active");

  const { data: balanceData } = useGetCreditsBalance();
  const { data: historyData, isLoading: isHistoryLoading } = useGetCreditsHistory(1, 10);
  const { data: globalBalance } = useGetParticipantGlobalBalance();
  const { data: progression } = useGetParticipantProgression();

  const availableCashback = balanceData?.availableCashback ?? 0;
  const pointsBalance = globalBalance?.globalTotalPoints ?? 0;

  const currentBadge = progression?.currentBadge;
  const nextBadge = progression?.nextBadge;
  const progressPercent = progression?.progressPercentage ?? 0;
  const nextPoints = nextBadge ? nextBadge.minPoints : progression?.pointsNeeded ?? 0;

  const historyItems: CreditsHistoryItem[] = historyData?.data ?? [];

  const getCategoryTitle = () => {
    switch (activeTab) {
      case "gift-cards":
        return `${subTab.charAt(0).toUpperCase() + subTab.slice(1)} Gift Cards`;
      case "vouchers":
        return "My Vouchers";
      case "loyalty":
        return "Loyalty Progression";
      case "history":
        return "Wallet Activity History";
      default:
        return "Wallet Items";
    }
  };

  const getDropdownLabel = () => {
    if (activeTab === "gift-cards") {
      return `${subTab.charAt(0).toUpperCase() + subTab.slice(1)} Cards`;
    }
    if (activeTab === "vouchers") {
      return "Vouchers";
    }
    return "Menu";
  };

  return (
    <div className="text-gray-800 pb-32 max-w-6xl mx-auto space-y-10">
      
      {/* Wallet Balance Hero Section - Styled for Light Theme */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 border border-gray-200/80 shadow-md group">
        {/* Glow Decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary opacity-5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Value</p>
              <h2 className="text-5xl font-extrabold tracking-tight mt-1 text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff843a] leading-none">
                £{availableCashback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            {currentBadge && (
              <div className="bg-primary/5 px-4 py-1 rounded-full border border-primary/10">
                <span className="text-[10px] font-black tracking-widest text-primary">{currentBadge.name.toUpperCase()} TIER</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6 border-t border-gray-100 pt-6">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Points Balance</p>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary fill-primary animate-pulse" />
                <span className="text-xl font-bold text-gray-900">{pointsBalance.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Cashback</p>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-xl font-bold text-green-600">£{availableCashback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Sections Grid/Flow with filter Dropdown replacing top scrollbar */}
      <div className="space-y-12">
        
        {/* Header with Filter Dropdown */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{getCategoryTitle()}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-orange-500/20 text-primary hover:bg-orange-500/10 font-bold text-xs gap-1.5 rounded-full px-4">
                Category: {getDropdownLabel()} <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 text-gray-800 shadow-lg rounded-xl w-60" align="end">
              <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2.5 py-1">Gift Cards by Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setActiveTab("gift-cards"); setSubTab("active"); }} className="cursor-pointer hover:bg-gray-50 focus:bg-orange-500/5 focus:text-primary font-bold text-xs">
                Active Gift Cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setActiveTab("gift-cards"); setSubTab("used"); }} className="cursor-pointer hover:bg-gray-50 focus:bg-orange-500/5 focus:text-primary font-bold text-xs">
                Used Gift Cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setActiveTab("gift-cards"); setSubTab("expired"); }} className="cursor-pointer hover:bg-gray-50 focus:bg-orange-500/5 focus:text-primary font-bold text-xs">
                Expired Gift Cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setActiveTab("gift-cards"); setSubTab("sent"); }} className="cursor-pointer hover:bg-gray-50 focus:bg-orange-500/5 focus:text-primary font-bold text-xs">
                Sent Gift Cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setActiveTab("gift-cards"); setSubTab("received"); }} className="cursor-pointer hover:bg-gray-50 focus:bg-orange-500/5 focus:text-primary font-bold text-xs">
                Received Gift Cards
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-100 my-1" />
              <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2.5 py-1">Other Sections</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setActiveTab("vouchers")} className="cursor-pointer hover:bg-gray-50 focus:bg-orange-500/5 focus:text-primary font-bold text-xs">
                My Vouchers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/brands')} className="cursor-pointer hover:bg-gray-50 focus:bg-orange-500/5 focus:text-primary font-bold text-xs">
                Brands Marketplace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/participant')} className="cursor-pointer hover:bg-gray-50 focus:bg-orange-500/5 focus:text-primary font-bold text-xs">
                Hub Homepage
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-100 my-1" />
              <DropdownMenuItem onClick={() => router.push('/participant/gift-cards')} className="cursor-pointer hover:bg-gray-50 focus:bg-orange-500/5 focus:text-primary font-bold text-xs text-orange-600 font-extrabold">
                Redeem & Manage Codes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Gift Cards Section */}
        {activeTab === "gift-cards" && (
          <section className="space-y-8">
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Gift className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-semibold">No {subTab} gift cards found.</p>
              <p className="text-xs text-gray-400 mt-1">Gift cards will appear here once available.</p>
            </div>

            {/* Suggestions Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Suggested for you</h2>
                <Link href="/gift-cards" className="text-xs font-bold text-orange-600 hover:underline">
                  View Marketplace
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Vouchers Section */}
        {activeTab === "vouchers" && (
          <section className="py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Ticket className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold">No active vouchers found.</p>
          </section>
        )}

        {/* Loyalty Status Section - Unconditional */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Loyalty Status</h3>
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">NEXT REWARD</p>
                <p className="text-xl font-extrabold text-gray-900 mt-1">
                  {nextBadge ? `${nextPoints.toLocaleString()} pts to ${nextBadge.name}` : `${(progression?.currentPoints ?? 0).toLocaleString()} pts`}
                </p>
              </div>
              <p className="text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-full">{progressPercent}% Complete</p>
            </div>

            {/* Progress bar with premium orange gradient glow */}
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, progressPercent)}%` }} 
                className="h-full bg-gradient-to-r from-primary to-[#ff843a] rounded-full shadow-[0_0_8px_rgba(245,73,0,0.2)]"
              />
            </div>

            {nextBadge && nextBadge.benefits && nextBadge.benefits.length > 0 && (
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary border border-primary/10">
                    <span className="material-symbols-outlined text-lg">confirmation_number</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{nextBadge.benefits[0]}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Unlocked at {nextPoints.toLocaleString()} pts</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity Section - Unconditional */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Activity</h3>
            <SlidersHorizontal size={18} className="text-gray-400 cursor-pointer hover:text-primary transition-colors" />
          </div>

          <div className="flex flex-col gap-4">
            {isHistoryLoading ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-500 font-semibold">Loading activity...</p>
              </div>
            ) : historyItems.length > 0 ? (
              historyItems.map((item) => {
                const isCredit = item.type?.toUpperCase() === 'CREDIT';
                const amount = Number(item.amount ?? 0);
                const unit = item.unit === 'GBP' ? '£' : '';
                const amountLabel = `${isCredit ? '+' : '-'}${unit}${amount.toLocaleString('en-US', { minimumFractionDigits: unit ? 2 : 0, maximumFractionDigits: unit ? 2 : 0 })}${item.unit === 'CREDITS' ? ' pts' : ''}`;
                return (
                  <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-2xl hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                        {isCredit ? <TrendingUp className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.description || item.eventType || (isCredit ? 'Credit' : 'Debit')}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-extrabold ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>{amountLabel}</p>
                      {item.status && <p className="text-xs text-gray-400 mt-0.5">{item.status}</p>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Activity className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold">No recent activity yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* BottomNavBar Section */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl md:hidden">
        <Link href="/participant" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link href="/participant/market" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">storefront</span>
          <span className="text-[10px] font-bold mt-0.5">Market</span>
        </Link>
        <Link href="/participant/wallet" className="flex flex-col items-center justify-center bg-orange-100 text-orange-600 rounded-full px-4 py-1 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          <span className="text-[10px] font-bold mt-0.5">Wallet</span>
        </Link>
        <Link href="/play-win" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">casino</span>
          <span className="text-[10px] font-bold mt-0.5">Games</span>
        </Link>
        <Link href="/participant/settings" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </Link>
      </nav>
    </div>
  );
}