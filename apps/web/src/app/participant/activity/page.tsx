"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  ShoppingBag, 
  UserPlus, 
  CreditCard,
  Stamp,
  Gift,
  type LucideIcon
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useGetParticipantProfile, useGetParticipantGlobalBalance, useGetParticipantGlobalHistory } from '@/services/customer-campaigns/hook';
import { type ParticipantHistoryItem, type PointHistoryType } from '@/services/customer-campaigns/types';

const historyTypeConfig: Record<PointHistoryType, { label: string; icon: LucideIcon; gradient: string; direction: 'earn' | 'spend' }> = {
  EARN: { label: 'Points Earned', icon: Sparkles, gradient: 'linear-gradient(135deg, #4ae176 0%, #009542 100%)', direction: 'earn' },
  REDEEM: { label: 'Points Redeemed', icon: ShoppingBag, gradient: 'linear-gradient(135deg, #f87171 0%, #b91c1c 100%)', direction: 'spend' },
  MATCHING: { label: 'Matching Points', icon: UserPlus, gradient: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)', direction: 'earn' },
  PURCHASED_EXTRA: { label: 'Extra Points', icon: CreditCard, gradient: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)', direction: 'earn' },
  STAMP_EARN: { label: 'Stamps Earned', icon: Stamp, gradient: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)', direction: 'earn' },
  STAMP_REDEEM: { label: 'Stamps Redeemed', icon: Gift, gradient: 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)', direction: 'spend' },
};

interface ActivityDisplayItem {
  id: string;
  type: string;
  title: string;
  amount: string;
  amountType: 'earn' | 'spend';
  description: string;
  time: string;
  date: string;
  icon: LucideIcon;
  gradient: string;
  code?: string;
}

const toDisplayItem = (item: ParticipantHistoryItem): ActivityDisplayItem => {
  const config = historyTypeConfig[item.type] ?? historyTypeConfig.EARN;
  const createdAt = new Date(item.createdAt);
  const title =
    item.reward?.title ||
    item.description ||
    item.campaign?.name ||
    item.business?.name ||
    config.label;
  const amount = `${config.direction === 'earn' ? '+' : '-'}${item.points} Pts`;
  return {
    id: item.id,
    type: config.label,
    title,
    amount,
    amountType: config.direction,
    description: item.description,
    time: format(createdAt, 'hh:mm a'),
    date: format(createdAt, 'EEE, MMM d'),
    icon: config.icon,
    gradient: config.gradient,
    code: item.redemptionCode ?? undefined,
  };
};

const PAGE_SIZE = 20;

export default function ParticipantActivityHistory() {
  const router = useRouter();
  const { data: profile } = useGetParticipantProfile();
  const { data: balance } = useGetParticipantGlobalBalance();

  const [activeFilter, setActiveFilter] = useState("All Activity");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const historyType =
    activeFilter === "Points" ? "points" : activeFilter === "Stamps" ? "stamps" : undefined;

  const { data: historyData, isLoading } = useGetParticipantGlobalHistory(page, PAGE_SIZE, historyType);

  const userName = profile?.name;
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "";
  const badgeLabel = profile?.customerBadge || profile?.customer_badge || "Member";
  const globalPoints =
    balance?.globalTotalPoints !== undefined ? balance.globalTotalPoints.toLocaleString() : undefined;
  const redeemedPoints =
    profile?.totalPointsRedeemed !== undefined
      ? profile.totalPointsRedeemed.toLocaleString()
      : profile?.total_points_redeemed !== undefined
        ? profile.total_points_redeemed.toLocaleString()
        : undefined;
  const campaignCount = balance?.campaignBalances?.length;

  const filterChips = ["All Activity", "Points", "Stamps"];

  const allActivities = (historyData?.data ?? []).map(toDisplayItem);

  const filteredActivities = allActivities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 pb-32 pt-4 px-4 max-w-md md:max-w-6xl mx-auto font-sans relative">
      {/* Top App Bar */}
      <header className="flex items-center justify-between w-full py-4 border-b border-gray-200 bg-transparent">
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
          <span className="font-extrabold text-lg text-gray-900">{userName || "Member"}</span>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{badgeLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {searchOpen && (
            <motion.input 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-800 outline-none focus:border-orange-500"
            />
          )}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-gray-505 hover:text-gray-800 active:scale-95 duration-200 transition-transform"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Column on Desktop (Stats & Filters) */}
        <div className="md:col-span-1 space-y-6">
          {/* Summary Stats Bento */}
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 p-4 rounded-2xl col-span-2 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Lifetime Rewards</p>
                <p className="text-3xl font-extrabold text-orange-600">{globalPoints ?? "—"} <span className="text-sm font-semibold text-gray-550">Pts</span></p>
              </div>
              <div className="w-12 h-12 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center text-orange-600">
                <Sparkles className="w-6 h-6 fill-current" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Redeemed</p>
              <p className="text-xl font-extrabold text-green-600 mt-2">{redeemedPoints ?? "—"}</p>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Campaigns</p>
              <p className="text-xl font-extrabold text-orange-600 mt-2">{campaignCount ?? "—"}</p>
            </div>
          </section>

          {/* Filter Chips */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 px-1 hidden md:block">Filter History</h3>
            <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
              {filterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setActiveFilter(chip); setPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeFilter === chip
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column on Desktop (Activity Timeline Feed) */}
        <div className="md:col-span-2 space-y-6">
          <section className="relative space-y-6 bg-white md:border md:border-gray-200 md:rounded-2xl md:p-6 md:shadow-sm">
            {/* Vertical Timeline Line */}
            <div className="absolute left-7 md:left-13 top-4 bottom-4 w-[2px] bg-gray-200 z-0"></div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                <p>Loading activity...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredActivities.length > 0 ? (
                  // Group activities by date
                  Object.entries(
                    filteredActivities.reduce((acc, act) => {
                      if (!acc[act.date]) acc[act.date] = [];
                      acc[act.date].push(act);
                      return acc;
                    }, {} as Record<string, ActivityDisplayItem[]>)
                  ).map(([date, items]) => (
                    <div key={date} className="space-y-4">
                      {/* Date Header */}
                      <div className="sticky top-16 md:top-0 z-10 py-1 bg-white/95 backdrop-blur-sm">
                        <h3 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{date}</h3>
                      </div>

                      {items.map((act) => {
                        const IconComponent = act.icon;
                        return (
                          <motion.div
                            key={act.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="relative flex gap-4 items-start group"
                          >
                            <div 
                              className={`z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 shrink-0 ${
                                !act.gradient.startsWith('linear') ? act.gradient : ''
                              }`}
                              style={{ background: act.gradient.startsWith('linear') ? act.gradient : undefined }}
                            >
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 flex-1 p-4 rounded-2xl transition-transform active:scale-[0.98] shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm text-gray-800">{act.title}</h4>
                                <span className={`text-xs font-bold ${
                                  act.amountType === 'earn' ? 'text-green-600' : 'text-red-500'
                                }`}>
                                  {act.amount}
                                </span>
                              </div>
                              <p className="text-xs text-gray-505 leading-relaxed">{act.description}</p>
                              {act.code && (
                                <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                                  <span>{act.code}</span>
                                </div>
                              )}
                              <p className="text-[9px] text-gray-400 mt-3">{act.time} • {act.type}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No activity found matching filters.</p>
                  </div>
                )}
              </AnimatePresence>
            )}

            {/* Load More */}
            {(historyData?.data?.length ?? 0) >= PAGE_SIZE && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="w-full mt-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:text-gray-800 font-bold text-xs bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                View Older Activity
              </button>
            )}
          </section>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl md:hidden">
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