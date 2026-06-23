"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ["Shopping", "Travel", "Restaurants", "Entertainment"];

const initialGiftCards = [
  {
    id: "global-retailer",
    name: "Global Retailer",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsNgsje8gMWjiOMSdItVLc9AHavXQNmVYGmB7suPtOn6EQCiPpSp77Yfc4hRoLM6VuwHL-KYzPReseHlWXrckPxWqSJvC2UH4onnVnv6Fy7K0gnh5skaMi_wbRvDlf0UJleixVi6_WqRBbwvgH8t38dd_XVp-jJkGMKXb1DlFYIcIBQ0mR1to0mUCO-VaMHO1H9JwTrCQQVJ6ns2K9UslRzUN16Noi7JWk2CaRoftRFJJyMhLJeE7z_NXQk4G8a9fm8bInwzV71wID",
    denominations: [10, 25, 50, 100],
    defaultDenom: 50,
    tag: "Popular",
    category: "Shopping"
  },
  {
    id: "brew-co",
    name: "Brew & Co.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrC6gNoz4Z0B-gQ2iHyPQjltS46yeC_vuuaFxADMT8Wpev09Gac0D3xrUkla4mRfG_XI1K_nCA5YFEGg1Q2d1gUM-5rbS132Rhw6FdMuPFpzB5wJ2zk8ZJHefCVKUI2kNGXlQv7kT97vAKX8n4Y_QzKo_ztugJNZ4B59VQwbtLcsgLo8lNnGiVqQx2DWqIeHn3VY_sMAPi5GItbJD9fFXEUsIPBesLJhFBnWwaKHG7rPyjW5shpJpPVmU5z-mNMQuG7Wr-RmukQTGU",
    denominations: [10, 25, 50],
    defaultDenom: 25,
    tag: "Top Cafe",
    category: "Restaurants"
  },
  {
    id: "travel-escape",
    name: "Travel Escape",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYl5SedD4uSItVrNNXxIHvMIulMZhx6vIYYXTkWRav22aO_PEiYVK_ryI-IIuz5XHhu_tYnba_OPT5LzyBT9lK0TjvpwwFtPu6ViSIPhzxmerHj1qhITuttbtqhauL72G4m3d6aIcHun0oDqlcUikStuS36Ke5uWhg9Kf-l-BpLF83cYTHcjHRH8EeW_VgL557iTqAP_MouvWqCkZL3ivIpVLg1t1b8g47mltRWRryxl9sxJ-1Ny3GwvQBn382kH_Bro-wG2KjXwXZ",
    denominations: [50, 100, 200, 500],
    defaultDenom: 100,
    tag: "Elite",
    category: "Travel"
  },
  {
    id: "cinema-plus",
    name: "Cinema Plus",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWGu5EXBb6MDC-eCMMSvagtYxwpiNpGVJ5D_MLQRyD1-mmfBPSw-li67jFWxT8BDf3qswGhodvKLmLqUEwOZlSDaLSCmoH6_bPp8Hw65Hp08M7xNoApdEUYaaz7F_z27IrJ5v2CJzGcKUhEcnnbzH-QsAsNFSUo12QMhLp6NC5BTBeDJYEywTwK-ZE3QsVtGwvCWrnZNuZO0k1bz-EMZCGvRWhT79ZoxrlgDELHTeFAR1Ixn2boJH38KS_kUCgDVUgJFwvyx_e662U",
    denominations: [10, 20, 50],
    defaultDenom: 20,
    tag: "Hot",
    category: "Entertainment"
  }
];

export default function GiftCardMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("Shopping");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDenoms, setSelectedDenoms] = useState<Record<string, number>>({
    "global-retailer": 50,
    "brew-co": 25,
    "travel-escape": 100,
    "cinema-plus": 20,
  });

  const handleDenomSelect = (cardId: string, denom: number) => {
    setSelectedDenoms(prev => ({
      ...prev,
      [cardId]: denom
    }));
  };

  const filteredCards = initialGiftCards.filter(card => card.category === selectedCategory);

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-12">
      
      {/* Hero Header & Horizontal Category Tabs */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold font-headline-lg text-gray-900 leading-tight">
              Elevate Your Gifting Experience.
            </h1>
            <p className="text-sm md:text-base text-gray-500 max-w-lg leading-relaxed">
              Access the world's most premium brands in one marketplace. Instant delivery, exclusive rewards, and curated selections.
            </p>
          </div>
          
          {/* Desktop Category Tabs */}
          <div className="hidden md:flex gap-2 pb-2 w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                    : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Category Dropdown Selector */}
          <div className="md:hidden relative w-full z-30">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white border border-gray-150 rounded-2xl px-5 py-3.5 flex justify-between items-center text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-55 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-orange-500 font-extrabold">Category:</span>
                <span>{selectedCategory}</span>
              </div>
              <motion.span 
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="material-symbols-outlined text-gray-400 text-lg"
              >
                expand_more
              </motion.span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  {/* Backdrop trap for click-away */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-gray-50"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3.5 text-xs font-bold transition-colors flex items-center justify-between ${
                          selectedCategory === cat
                            ? 'bg-orange-50/50 text-orange-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span>{cat}</span>
                        {selectedCategory === cat && (
                          <span className="material-symbols-outlined text-orange-500 text-base font-bold">check</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Bento Grid - Featured Store Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Large Featured Card */}
        <div className="md:col-span-8 group relative overflow-hidden rounded-[32px] aspect-[16/10] md:aspect-[16/9] shadow-md flex flex-col justify-end">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
               style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBY8H_cklZ5u0EC2ynCBhVbl7sQExi1otWnxIU6vTNlo5MDII0sUSI1SElopqRQSfSBN8bZFgul7IT3frW7XgayO3uhoB6k9gAsR3ACssT98aLoplcC-27Rm5UxMlErsxZiCCiySMoTKz2wmySp0zXB4e0CCk52eM_jl2TgqAEFdRShAuHbw95XjDM6TfHhmWCLTcmc1Sg0eyqTPExmVl7rGPQww0KFqisQW9Ny3S9g2KYbACwdDZBbxUdnvAPBRpykqrdfR1z7-Ckl')` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent z-10" />
          <div className="p-8 z-20 text-white space-y-3">
            <span className="bg-amber-500 text-neutral-900 px-3 py-1 rounded-lg text-xs font-bold inline-block shadow">
              Featured Store
            </span>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">Luxury Wardrobe Refresh</h2>
            <p className="text-xs md:text-sm opacity-95 max-w-md leading-relaxed">
              Get up to 10% back in MCOM points when you purchase gift cards from our premium fashion partners this month.
            </p>
            <div className="pt-2">
              <Link href="/brands" className="bg-white text-orange-600 px-6 py-2.5 rounded-full font-bold text-xs hover:bg-orange-50 transition active:scale-95 flex items-center gap-1.5 w-fit">
                Buy Now <span className="material-symbols-outlined text-sm">shopping_bag</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary Progress Card */}
        <div className="md:col-span-4 bg-orange-500 text-white rounded-[32px] p-8 flex flex-col justify-between overflow-hidden relative shadow-md min-h-[280px]">
          <div className="space-y-2 relative z-10">
            <h3 className="text-2xl font-bold leading-snug">Exclusive Rewards</h3>
            <p className="text-xs opacity-90 leading-relaxed">
              Every gift card purchase brings you closer to your next elite travel destination.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold tracking-wider">
              <span>NEXT TIER</span>
              <span>80%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-4/5 rounded-full" />
            </div>
          </div>

          {/* Abstract background glow */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* Grid of Gift Cards */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Most Popular</h2>
          <button className="text-orange-500 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => {
              const currentDenom = selectedDenoms[card.id] || card.defaultDenom;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={card.id}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    <Link href={`/gift-cards/${card.id}`} className="block">
                      <div className="relative aspect-[1.58/1] mb-4 overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <img className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                             src={card.image} alt={card.name} />
                        <div className="absolute top-3 right-3">
                          <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold text-orange-600 shadow-sm uppercase tracking-wider">
                            {card.tag}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="space-y-3">
                      <Link href={`/gift-cards/${card.id}`}>
                        <h3 className="font-bold text-base text-gray-850 hover:text-orange-500 transition-colors">{card.name}</h3>
                      </Link>
                      <div className="flex flex-wrap gap-1.5">
                        {card.denominations.map((denom) => (
                          <button
                            key={denom}
                            onClick={() => handleDenomSelect(card.id, denom)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                              currentDenom === denom
                                ? 'bg-orange-50 text-orange-600 border-orange-500'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            £{denom}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-6">
                    <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full font-bold text-xs transition active:scale-95 shadow-md shadow-orange-500/10">
                      Buy £{currentDenom}
                    </button>
                    <button className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-full material-symbols-outlined transition text-lg active:scale-90">
                      redeem
                    </button>
                    <button className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-full material-symbols-outlined transition text-lg active:scale-90">
                      send
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
}
