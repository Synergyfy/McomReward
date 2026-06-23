"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const initialDeals = [
  {
    id: "acoustic-pro-gen-3",
    name: "Acoustic Pro Gen 3",
    price: 199.00,
    oldPrice: 360.00,
    discount: "-45% OFF",
    timeRemaining: 4 * 3600 + 22 * 60 + 11,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdOl3vyGmM1qsieiMMlrNg6CNvXEtn1UhofjzM9_yReAbg2laUwxuuT6fKw7UFRyr_NU5z2y4YrE2YyD8PwaUBYQXtxjw74u7198eD0_xnnzQwsW04L0fwd95aKz1LW1g6mRtJnGUHlRBgxYOR0spAE-VlBM5HxK2asZXn-TOxh1EuJxBriBs_eSy6fF72LmgDMAfMwr9FPRa22_JRFbvNT7KSMAEISpSZtf7on79USZKlioHXUJq-3wVUJFMC0DdGKPfix5Da0adM"
  },
  {
    id: "brewmaster-elite",
    name: "BrewMaster Elite",
    price: 549.00,
    oldPrice: 780.00,
    discount: "-30% OFF",
    timeRemaining: 2 * 3600 + 15 * 60 + 45,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAbOUjtdw1yEVs4oAVCHZqeT3j97Er3IqOOj-kKeQfIdMFaQlKFltjJ59iKEB-QyDhH3FCFOOUb3u46xN6u7B8z6rI9cF6UuRFU1-XzH_5RQmmycQcFyBjAKABu_aEduooA9ZGUUt_lPHk8iXyPyMAtr7wiepp1wMgvc5lBhIlRaUMlEYDU30OD6CgWe8ZxN77VrXvHar6tXqsMLdtEU8cAcdQR7U7qmFBGbPdXtBpTeGYCt1wkWBQGsLCm2VfewX-01xicVjB41Zp"
  },
  {
    id: "aura-leather-tote",
    name: "Aura Leather Tote",
    price: 1200.00,
    bonusPoints: "Earn 5k Points",
    discount: "EXCLUSIVE",
    timeRemaining: 8 * 3600 + 44 * 60 + 10,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB06dio_wI-pp0pCPQdCzXz1M4R6dqPBESlGdG0lhHr_7o0HxQyPJcGx1jfK5jZIKno-gKVeG-7y7a9PlxVOa9-b4Wx_bbxwJguNaWUnJZs1NnW_PjZvn8A00euevV53ODU-sAgQo3jhLhWuom40mKHBNh1sKIKn6nHTfzXKb_JjVRlVNLG1e5Uw9hqNrGTa48pKLNvqhcFKT3V_5X2tXBfVAWfJUsfTX87jaaZArYQ5geMXpjG8Eef0S9Lq_J3HhyNYxgSSOxMZ3Ai"
  },
  {
    id: "fitlab-membership",
    name: "FitLab Gold Access",
    price: 89.00,
    oldPrice: 150.00,
    discount: "-40% OFF",
    timeRemaining: 5 * 3600 + 10 * 60 + 30,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiC4QJn3wbgcOXtOGfBFa7zPnrLQZbFu178z8gXKF8k5QWhUr7CKay3o0U3LDYkqkOoR44PtQH_GyQuDnAZYB48WX-QGtS6i8mdo96gOPwE_NZPW5tzFlvAATa0UZslE749Bkd-IONjpkh2V0vuwTXT0loVX7zP0GTDA0uGfphZqB3vw3RJ7iCFatbwYclaHQNMm-G-125mx6otPhhE10tmVtpetn0r3icomAoo8vml0bjoQ7lKqtIadusre0c5b1IketNRp2CkIql"
  }
];

export default function ExclusiveOffersDeals() {
  const [deals, setDeals] = useState(initialDeals);
  const [seconds, setSeconds] = useState(48 * 3600 + 12 * 60 + 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
      setDeals(prevDeals =>
        prevDeals.map(deal => ({
          ...deal,
          timeRemaining: deal.timeRemaining > 0 ? deal.timeRemaining - 1 : 0
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (time: number) => {
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

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-16">
      
      {/* Hero / Featured Section (Asymmetric Bento) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Large Feature */}
          <div className="md:col-span-8 rounded-[32px] overflow-hidden relative group cursor-pointer aspect-[16/10] md:aspect-[16/9] shadow-md flex flex-col justify-end">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYcpETZW4ZUyq02AFLACtdhwDhmeMTSIxwW8WnBOJeigOKunwf570zqYAk_Wktht3hnXZcR-VOv56wZk8_LcjLdzJ0cexYOzVq3_J6TAgmVA8mHkmYmVPbAzpniLzecX9AjcTnpmVCJyF6fS9k8z3SAmos2ehHt-uBM2bQmUNWd_jSqSwRJi9FpV4yF0c9pFziP7yBcb6Tig_wOrHOqX6YzPTb7ROMCvO9Av7I4e1yl92qZT1tVGQ-71pPRk94ciY0NnxpeCaeK7PR')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
            <div className="p-8 z-20 text-white space-y-3">
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold w-fit animate-pulse">
                LIMITED TIME
              </span>
              <h1 className="text-2xl md:text-4xl font-bold font-headline-lg leading-tight">
                Elite Travel Escape:<br/>Double Points Week
              </h1>
              <p className="text-xs md:text-sm opacity-90 max-w-lg leading-relaxed">
                Book your next getaway through MCOM Rewards and earn 2X points on all premium stays and flights.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-md transition duration-200">
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
          <div className="md:col-span-4 rounded-[32px] overflow-hidden bg-amber-500/10 border border-amber-500/25 p-8 flex flex-col justify-between shadow-sm min-h-[300px]">
            <div className="space-y-2">
              <span className="bg-amber-500 text-neutral-900 px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm">
                WEEKEND OFFER
              </span>
              <h2 className="text-2xl font-bold font-headline-lg text-amber-900 leading-snug">
                30% Cashback at Tech Hub
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                Upgrade your workspace this weekend with exclusive merchant deals.
              </p>
              <Link href="/brands" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-full font-bold text-xs text-center block shadow-md transition duration-200">
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
            <h2 className="text-2xl font-bold font-headline-lg text-orange-500">Today's Deals</h2>
            <p className="text-xs text-gray-500 mt-1">Flash offers that won't last. Grab them before the clock hits zero.</p>
          </div>
          <button className="text-orange-500 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 group hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
                  <img className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                       src={deal.image} alt={deal.name} />
                  <div className="absolute top-3 right-3">
                    <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow">
                      {deal.discount}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base text-gray-800 line-clamp-1 truncate">{deal.name}</h3>
                    <button className="material-symbols-outlined text-gray-400 hover:text-orange-500 transition-colors text-lg">
                      favorite
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold text-base">£{deal.price}</span>
                    {deal.oldPrice && (
                      <span className="text-gray-400 line-through text-xs font-medium">£{deal.oldPrice}</span>
                    )}
                    {deal.bonusPoints && (
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[9px] font-bold">
                        {deal.bonusPoints}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-red-500 font-bold text-xs pt-1">
                    <span className="material-symbols-outlined text-sm">timer</span>
                    <span>{formatTimer(deal.timeRemaining)}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-orange-500/10 transition active:scale-95 mt-6">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
