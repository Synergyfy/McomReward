'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCreditsBalance, useGetCreditsHistory } from '@/services/cashback/hook';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  History,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Gift,
  Award,
  Search,
  Lock,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Activity,
  SlidersHorizontal,
  Store,
  Gamepad2,
  Ticket,
  QrCode,
  ShoppingCart,
  Send,
  Bolt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const giftCardsData = [
  {
    id: "amazon",
    name: "Amazon",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkoHb8eaUbHwA7u5xjuYZVut4isT5oADueDohEFS9a_7SVamdHk-auIn1q26QJq_zk30tDe_Q85f6rll4m0ssNicpxT2d1v9s6pPmtdKZ5_fBV3ZZ-ovnocGSnUxt-1a1edYKhciynFqvNR0plQ9Q99FzS-bevDKbvwhuPOeb1SC8t4YEX3TWJyC63_XWuxY15zEou5NsL7raAzADHol7BduN5itSHNS6XaWd6vRh67vo4k8sd9ruS38-WV8fcUqN6rY9vXQ5w_8A",
    value: 250.00
  },
  {
    id: "starbucks",
    name: "Starbucks",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaAqqajmX0l_gLPVy8SdfAp0x7RhzBINLbzr_eH6lkgTtewIVH_vibvMHHGUvS6CaRFX25OsDu6jneriGqfYp79YZWTYcrLsqQSfTNSwhqfp1JhRmZGU4Y4ki_y7kVch6CNtmubWsr0PBwFA4LjxGbh_REtgf45Kv1_DgZ6jhHSyEBr6AoMB8M3lBlLFVX7HN30lt8Twy8LKMiWU6xR-5jOWy6zdMGP3zbXSkWhG1YiQxJ5kU5tsHAiBsEB9ksrMTuu61188ThYSE",
    value: 45.20
  },
  {
    id: "nike",
    name: "Nike",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbsXKtzxksBxkYlYWF7R_nnDpdYQXcBAwlGSSkw4qSIuzJZKEU8IeR-ERfaVywm3Pk7j8nFRQoP2yoRijUptm1oT1LCBBtUngFD7ZhBjnOBLbRC8oiOeTyr7sgtgmw6-8E1YtYOFawkqy_d7VxXDby9dCNggMm_m5gTP-dPuErBreWxLyjaTliyScC3ojL3lC1KgXxa9lNe4jj9GGJxhxZpgax7eeAcTMG4KshaHVu2RwztD3qojq7aYPKKooTmUiNOgJPjfcrH98",
    value: 120.00
  },
  {
    id: "apple",
    name: "Apple",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEY6rtn3Qlp4vM4zPPPsfVErV4oE4NdaOVlMkRwXBxwyv61a9eKik2qzUiNr89hyhFdi0rBYLm4H6_cNQzboyt65JXHbuQSSVZsqxsCKwV6vp5nmYrhvjGUZYoY0tgVZTN0IoyuhlZt9V4d92Ie-BDuJAmWMsSi5Uc2gm1nDfeqjdGUqzCkYf-9exFrQ8IuSJf-EkZebZVXKmpldOFkf5X18YCN0dnwM6nhNMC5xN-ZiL18skyoEce-ZFoPm94Q4ZVxkuMrZGqlm4",
    value: 500.00
  }
];

export default function ParticipantWalletPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("gift-cards");
  const [subTab, setSubTab] = useState("active");

  const { data: balanceData } = useGetCreditsBalance();
  const { data: historyData, isLoading: isHistoryLoading } = useGetCreditsHistory(1, 10);

  const historyItems = historyData?.data || [];

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
                £{(balanceData?.availableCashback ?? 12450.00).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-primary/5 px-4 py-1 rounded-full border border-primary/10">
              <span className="text-[10px] font-black tracking-widest text-primary">PRO PLAN</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6 border-t border-gray-100 pt-6">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Points Balance</p>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary fill-primary animate-pulse" />
                <span className="text-xl font-bold text-gray-900">48,290</span>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Cashback</p>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-xl font-bold text-green-600">£142.50</span>
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

            {subTab === "active" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Detailed Amazon Card */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm flex flex-col gap-6 relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 p-2 flex items-center justify-center border border-gray-100 shrink-0">
                        <img className="w-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkoHb8eaUbHwA7u5xjuYZVut4isT5oADueDohEFS9a_7SVamdHk-auIn1q26QJq_zk30tDe_Q85f6rll4m0ssNicpxT2d1v9s6pPmtdKZ5_fBV3ZZ-ovnocGSnUxt-1a1edYKhciynFqvNR0plQ9Q99FzS-bevDKbvwhuPOeb1SC8t4YEX3TWJyC63_XWuxY15zEou5NsL7raAzADHol7BduN5itSHNS6XaWd6vRh67vo4k8sd9ruS38-WV8fcUqN6rY9vXQ5w_8A" alt="Amazon" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-gray-900 leading-tight">Amazon</h3>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">Holiday Shopping Card</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-3xl font-black text-orange-600">£500.00</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-500">Card Balance</span>
                      <span className="text-green-600">100% Remaining</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-[#ff843a] rounded-full w-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow active:scale-95 transition-all">
                      <Bolt size={14} />
                      Use Now
                    </button>
                    <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs border border-gray-250 active:scale-95 transition-all">
                      <Send size={14} />
                      Send Gift
                    </button>
                  </div>
                </div>

                {/* Nike Card */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between transition-all duration-300 hover:border-orange-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 p-2 flex items-center justify-center border border-gray-100 shrink-0">
                      <img className="w-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbsXKtzxksBxkYlYWF7R_nnDpdYQXcBAwlGSSkw4qSIuzJZKEU8IeR-ERfaVywm3Pk7j8nFRQoP2yoRijUptm1oT1LCBBtUngFD7ZhBjnOBLbRC8oiOeTyr7sgtgmw6-8E1YtYOFawkqy_d7VxXDby9dCNggMm_m5gTP-dPuErBreWxLyjaTliyScC3ojL3lC1KgXxa9lNe4jj9GGJxhxZpgax7eeAcTMG4KshaHVu2RwztD3qojq7aYPKKooTmUiNOgJPjfcrH98" alt="Nike" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400">Nike Apparel</h3>
                      <p className="text-xl font-extrabold text-orange-600 mt-0.5">£120.00</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all active:scale-90 border border-gray-100">
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Starbucks Card */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between transition-all duration-300 hover:border-orange-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 p-2 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                      <img className="w-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaAqqajmX0l_gLPVy8SdfAp0x7RhzBINLbzr_eH6lkgTtewIVH_vibvMHHGUvS6CaRFX25OsDu6jneriGqfYp79YZWTYcrLsqQSfTNSwhqfp1JhRmZGU4Y4ki_y7kVch6CNtmubWsr0PBwFA4LjxGbh_REtgf45Kv1_DgZ6jhHSyEBr6AoMB8M3lBlLFVX7HN30lt8Twy8LKMiWU6xR-5jOWy6zdMGP3zbXSkWhG1YiQxJ5kU5tsHAiBsEB9ksrMTuu61188ThYSE" alt="Starbucks" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400">Starbucks Rewards</h3>
                      <p className="text-xl font-extrabold text-orange-600 mt-0.5">£28.50</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Exp 12/24</span>
                    <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all active:scale-90 border border-gray-100">
                      <QrCode size={16} />
                    </button>
                  </div>
                </div>

                {/* Apple Card */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between transition-all duration-300 hover:border-orange-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 p-2 flex items-center justify-center border border-gray-100 shrink-0">
                      <img className="w-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEY6rtn3Qlp4vM4zPPPsfVErV4oE4NdaOVlMkRwXBxwyv61a9eKik2qzUiNr89hyhFdi0rBYLm4H6_cNQzboyt65JXHbuQSSVZsqxsCKwV6vp5nmYrhvjGUZYoY0tgVZTN0IoyuhlZt9V4d92Ie-BDuJAmWMsSi5Uc2gm1nDfeqjdGUqzCkYf-9exFrQ8IuSJf-EkZebZVXKmpldOFkf5X18YCN0dnwM6nhNMC5xN-ZiL18skyoEce-ZFoPm94Q4ZVxkuMrZGqlm4" alt="Apple" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400">Apple Store</h3>
                      <p className="text-xl font-extrabold text-orange-600 mt-0.5">£600.00</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all active:scale-90 border border-gray-100">
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <section className="py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Gift className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold">No {subTab} gift cards found.</p>
              </section>
            )}

            {/* Suggestions Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Suggested for you</h2>
                <Link href="/gift-cards" className="text-xs font-bold text-orange-600 hover:underline">
                  View Marketplace
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {/* PlayStation Suggestion */}
                <div className="min-w-[160px] bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3">
                  <div className="w-full h-24 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM69btTEm0TvgL-vJGSXWm5mVxIgotRCp2E4ujdFzlZKupUu1aB7_Pm4o5lKM3XerSIX3hnfWUwbLgKSn9zP4TKHyzxdc-tvSpLRb_qagWrarOqLpDBAv71cT30ODl4Zat9cwqSv9JZ8g0x78ibCXMGKEY2OQjLxN5Vgf-OeoQPq1wzcbubTGI81B8KjaQxZ1S3ssHlRNt5kpORj3e9B-MgdwK8XrtUrwqrudNaqvJA6jpqkQZqsDhXhWDh7YZiIHw8kYzw4LpgK4" alt="PlayStation" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">PlayStation</p>
                    <p className="text-base font-extrabold text-orange-600 mt-0.5">£50.00</p>
                  </div>
                </div>
                {/* Netflix Suggestion */}
                <div className="min-w-[160px] bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3">
                  <div className="w-full h-24 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu247DkbiKQHqc8AM07Vw90lhEYhrRVuAMPFUSR4QX2CZ8yRPtrQtqlUWKMWkQI-Y-VYt4af1jstc52M-94RaqMOQW3RKPog5nzdlrImIK8IMdvhTatjeOUqhNpvuACwek0-phKENryQt_Y8VDeoesJ10f2r-n-szIewXXF4wvGU4Fo0MmbcvfLLS9L7e431G74CSKTfwTFUYFTianb-xIcEgER9fQOIn-F4P5i-rZ3noN8SjDMGXgCnssjfWTq_aE8uVBQTmcaMY" alt="Netflix" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">Netflix</p>
                    <p className="text-base font-extrabold text-orange-600 mt-0.5">£25.00</p>
                  </div>
                </div>
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
                <p className="text-xl font-extrabold text-gray-900 mt-1">1,710 pts to Platinum</p>
              </div>
              <p className="text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-full">92% Complete</p>
            </div>

            {/* Progress bar with premium orange gradient glow */}
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                style={{ width: "92%" }} 
                className="h-full bg-gradient-to-r from-primary to-[#ff843a] rounded-full shadow-[0_0_8px_rgba(245,73,0,0.2)]"
              />
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary border border-primary/10">
                  <span className="material-symbols-outlined text-lg">confirmation_number</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Free Flight Voucher</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Unlocked at 50k Pts</p>
                </div>
              </div>
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </section>

        {/* Recent Activity Section - Unconditional */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Activity</h3>
            <SlidersHorizontal size={18} className="text-gray-400 cursor-pointer hover:text-primary transition-colors" />
          </div>

          <div className="flex flex-col gap-4">
            {/* Activity Item 1 */}
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Market Purchase</p>
                  <p className="text-xs text-gray-400 mt-0.5">Today, 2:45 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-green-600">+450 Pts</p>
                <p className="text-xs text-gray-400 mt-0.5">-£24.99</p>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary animate-pulse">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Spin Win</p>
                  <p className="text-xs text-gray-400 mt-0.5">Yesterday</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-green-600">+1,200 Pts</p>
                <p className="text-xs text-gray-400 mt-0.5">MCOMSpin</p>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Gift Card Claimed</p>
                  <p className="text-xs text-gray-400 mt-0.5">Oct 24, 2023</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-primary">-10,000 Pts</p>
                <p className="text-xs text-gray-400 mt-0.5">£100 Apple</p>
              </div>
            </div>
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
