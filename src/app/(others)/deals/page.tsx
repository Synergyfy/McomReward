"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetPublicDeals } from '@/services/deals/hook';
import { Deal } from '@/services/deals/types';
import { ChevronLeft } from 'lucide-react';

export default function ExclusiveOffersDeals() {
  const { data: paginatedDeals, isLoading } = useGetPublicDeals({ limit: 12 });
  const [seconds, setSeconds] = useState(48 * 3600 + 12 * 60 + 5);
  const [dealTimers, setDealTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
      setDealTimers(prevTimers => {
        const updated = { ...prevTimers };
        Object.keys(updated).forEach(id => {
          if (updated[id] > 0) updated[id] -= 1;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize individual deal timers when data loads
  useEffect(() => {
    if (paginatedDeals?.data) {
      const timers: Record<string, number> = {};
      paginatedDeals.data.forEach((deal: Deal) => {
        const end = new Date(deal.endDate).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        timers[deal.id] = diff || 4 * 3600; // default to 4 hours if already ended or invalid
      });
      setDealTimers(timers);
    }
  }, [paginatedDeals]);

  const formatTimer = (time: number) => {
    if (!time) time = 0;
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const formatHeroTimer = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const dealsList = paginatedDeals?.data || [];

  return (
    <div className="bg-[#101415] text-[#e0e3e5] min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-8">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 border-b border-gray-800">
        <Link href="/participant/market" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-gray-400 hover:bg-slate-700 hover:text-orange-500 active:scale-95 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider hidden sm:block">MCOM Mall</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Exclusive Offers & Deals</h1>
        </div>
      </header>

      {/* Hero / Featured Section (Asymmetric Bento) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Large Feature */}
          <div className="md:col-span-8 rounded-[32px] overflow-hidden relative group cursor-pointer aspect-[16/10] md:aspect-[16/9] shadow-md flex flex-col justify-end">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYcpETZW4ZUyq02AFLACtdhwDhmeMTSIxwW8WnBOJeigOKunwf570zqYAk_Wktht3hnXZcR-VOv56wZk8_LcjLdzJ0cexYOzVq3_J6TAgmVA8mHkmYmVPbAzpniLzecX9AjcTnpmVCJyF6fS9k8z3SAmos2ehHt-uBM2bQmUNWd_jSqSwRJi9FpV4yF0c9pFziP7yBcb6Tig_wOrHOqX6YzPTb7ROMCvO9Av7I4e1yl92qZT1tVGQ-71pPRk94ciY0NnxpeCaeK7PR')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
            <div className="p-8 z-20 text-white space-y-3">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold w-fit animate-pulse">
                LIMITED TIME
              </span>
              <h1 className="text-2xl md:text-4xl font-bold font-headline-lg leading-tight">
                Elite Travel Escape:<br/>Double Points Week
              </h1>
              <p className="text-xs md:text-sm opacity-90 max-w-lg leading-relaxed">
                Book your next getaway through MCOM Rewards and earn 2X points on all premium stays and flights.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-md transition duration-200">
                  Claim Now
                </button>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>{formatHeroTimer(seconds)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Bento Feature */}
          <div className="md:col-span-4 rounded-[32px] overflow-hidden bg-primary/10 border border-primary/20 p-8 flex flex-col justify-between shadow-sm min-h-[300px]">
            <div className="space-y-2">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm">
                WEEKEND OFFER
              </span>
              <h2 className="text-2xl font-bold font-headline-lg text-primary leading-snug">
                30% Cashback at Tech Hub
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                Upgrade your workspace this weekend with exclusive merchant deals.
              </p>
              <Link href="/brands" className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-full font-bold text-xs text-center block shadow-md transition duration-200">
                Explore Merchant
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Today's Deals (Limited Time) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold font-headline-lg text-primary">Today's Deals</h2>
            <p className="text-xs text-gray-400 mt-1">Flash offers that won't last. Grab them before the clock hits zero.</p>
          </div>
          <button className="text-primary font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : dealsList.length === 0 ? (
          <div className="text-center py-20 bg-[#1d2022]/40 rounded-3xl border border-white/5">
            <span className="material-symbols-outlined text-gray-500 text-5xl mb-4">percent</span>
            <p className="text-gray-400 font-bold">No offers available today.</p>
            <p className="text-gray-500 text-xs mt-1">Check back later for flash rewards!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealsList.map((deal) => (
              <div key={deal.id} className="bg-[#1d2022]/80 rounded-3xl p-4 shadow-sm border border-white/5 group hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-[#101415] border border-white/5">
                    {deal.imageUrl ? (
                      <img className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                           src={deal.imageUrl} alt={deal.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="material-symbols-outlined text-primary text-4xl">local_offer</span>
                      </div>
                    )}
                    {deal.value > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-primary text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow">
                          {deal.type === 'DISCOUNT' ? `-${deal.value}% OFF` : 'PROMO'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base text-white line-clamp-2">{deal.title}</h3>
                      <button className="material-symbols-outlined text-gray-400 hover:text-primary transition-colors text-lg shrink-0">
                        favorite
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-primary font-bold text-base">£{deal.dealPrice}</span>
                      {deal.originalPrice && (
                        <span className="text-gray-500 line-through text-xs font-medium">£{deal.originalPrice}</span>
                      )}
                      {deal.pointsEarned > 0 && (
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          Earn {deal.pointsEarned} Pts
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-primary font-bold text-xs pt-1">
                      <span className="material-symbols-outlined text-sm">timer</span>
                      <span>{formatTimer(dealTimers[deal.id] || 0)}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-primary hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-primary/10 transition active:scale-95 mt-6">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

