"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  Dices, 
  ShoppingBag, 
  UserPlus, 
  CalendarDays, 
  CreditCard,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetParticipantProfile, useGetParticipantGlobalBalance } from '@/services/customer-campaigns/hook';

const activitiesData = [
  {
    id: "act-1",
    type: "Games",
    title: "MCOMSpin Winner",
    amount: "+500 Pts",
    amountType: "earn",
    description: "Daily spin challenge completed. Level 4 Multiplier applied.",
    time: "02:45 PM",
    date: "TODAY, NOV 24",
    icon: Dices,
    gradient: "linear-gradient(135deg, #4ae176 0%, #009542 100%)",
  },
  {
    id: "act-2",
    type: "Purchases",
    title: "Amazon Gift Card",
    amount: "-2,500 Pts",
    amountType: "spend",
    description: "Redeemed $25 Digital Voucher. Code sent to registered email.",
    time: "11:20 AM",
    date: "TODAY, NOV 24",
    code: "AMZN-X24-GOLD",
    icon: ShoppingBag,
    gradient: "linear-gradient(135deg, #bec6e0 0%, #565e74 100%)",
  },
  {
    id: "act-3",
    type: "Rewards",
    title: "Referral Successful",
    amount: "+1,000 Pts",
    amountType: "earn",
    description: "User 'sarah_j' joined using your invite link. 2x multiplier active.",
    time: "08:15 PM",
    date: "YESTERDAY, NOV 23",
    icon: UserPlus,
    gradient: "linear-gradient(135deg, #ffe083 0%, #eec200 100%)",
  },
  {
    id: "act-4",
    type: "Events",
    title: "Tech Summit Access",
    amount: "Confirmed",
    amountType: "status",
    description: "VIP RSVP for the upcoming \"Innovation 2024\" digital event.",
    time: "03:30 PM",
    date: "YESTERDAY, NOV 23",
    icon: CalendarDays,
    gradient: "bg-slate-700",
  },
  {
    id: "act-5",
    type: "Purchases",
    title: "Online Store Purchase",
    amount: "+125 Pts",
    amountType: "earn",
    description: "Points earned on Order #88219 (Electronics Category).",
    time: "09:12 AM",
    date: "YESTERDAY, NOV 23",
    icon: CreditCard,
    gradient: "linear-gradient(135deg, #bec6e0 0%, #565e74 100%)",
  }
];

export default function ParticipantActivityHistory() {
  const router = useRouter();
  const { data: profile } = useGetParticipantProfile();
  const { data: balance } = useGetParticipantGlobalBalance();

  const [activeFilter, setActiveFilter] = useState("All Activity");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userName = profile?.name || 'Julian Sterling';
  const globalPoints = balance?.globalTotalPoints !== undefined ? balance.globalTotalPoints.toLocaleString() : '124,500';

  const filterChips = ["All Activity", "Rewards", "Games", "Purchases", "Events"];

  const filteredActivities = activitiesData.filter(act => {
    const matchesFilter = activeFilter === "All Activity" || act.type === activeFilter;
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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
              <AvatarImage 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYmbBm1iD4miSQ7O41tDBzPon44_CbNJD4GAQGesU4wxShbP4GulqU49g8o36p1qiKBxi0lmeyTzlxtmlPYcOyh9-i0SfkXBEmb3UdYaxLmTiw5GlZXLzfX8gAPsYiP_oU5JTYksiUGdIOvdxj_apmMkUvWpmcarJZsDwmEo3D7C39m1RaCi4ZJFOrBuvzJsgqWX2TuM_yyxT3NlpBsQcDDblYz1tcO13aVXXWMFrwKqxHekDB_s57mt3x66iuwV6V1WlOzr8YCmQ" 
                alt="Profile Avatar"
              />
              <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">JS</AvatarFallback>
            </Avatar>
          </div>
          <span className="font-extrabold text-lg text-gray-900">Gold Member</span>
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
                <p className="text-3xl font-extrabold text-orange-600">{globalPoints} <span className="text-sm font-semibold text-gray-550">Pts</span></p>
              </div>
              <div className="w-12 h-12 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center text-orange-600">
                <Sparkles className="w-6 h-6 fill-current" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Redeemed</p>
              <p className="text-xl font-extrabold text-green-600 mt-2">12.4k</p>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Games Won</p>
              <p className="text-xl font-extrabold text-orange-600 mt-2">84</p>
            </div>
          </section>

          {/* Filter Chips */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 px-1 hidden md:block">Filter History</h3>
            <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
              {filterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveFilter(chip)}
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

            <AnimatePresence mode="popLayout">
              {filteredActivities.length > 0 ? (
                // Group activities by date
                Object.entries(
                  filteredActivities.reduce((acc, act) => {
                    if (!acc[act.date]) acc[act.date] = [];
                    acc[act.date].push(act);
                    return acc;
                  }, {} as Record<string, typeof activitiesData>)
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
                                act.amountType === 'earn' ? 'text-green-600' : 
                                act.amountType === 'spend' ? 'text-red-500' : 'text-orange-600'
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

            {/* Load More */}
            <button className="w-full mt-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:text-gray-800 font-bold text-xs bg-white hover:bg-gray-50 transition-colors shadow-sm">
              View Older Activity
            </button>
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
