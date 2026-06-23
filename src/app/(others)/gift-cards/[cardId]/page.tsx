"use client";

import React, { useState, use } from 'react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ cardId: string }>;
}

const giftCardDetailsData: Record<string, {
  name: string;
  category: string;
  tag: string;
  image: string;
  desc: string;
  bgColor: string;
  pointsReward: string;
  denominations: number[];
  features: { title: string; desc: string; icon: string; bg: string }[];
  bonusOffer?: { title: string; desc: string; icon: string };
}> = {
  "global-retailer": {
    name: "Global Retailer Card",
    category: "Shopping",
    tag: "POPULAR CHOICE",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsNgsje8gMWjiOMSdItVLc9AHavXQNmVYGmB7suPtOn6EQCiPpSp77Yfc4hRoLM6VuwHL-KYzPReseHlWXrckPxWqSJvC2UH4onnVnv6Fy7K0gnh5skaMi_wbRvDlf0UJleixVi6_WqRBbwvgH8t38dd_XVp-jJkGMKXb1DlFYIcIBQ0mR1to0mUCO-VaMHO1H9JwTrCQQVJ6ns2K9UslRzUN16Noi7JWk2CaRoftRFJJyMhLJeE7z_NXQk4G8a9fm8bInwzV71wID",
    desc: "The ultimate shopping freedom. Redeemable at over 10,000 retail stores and online platforms globally.",
    bgColor: "from-blue-600 to-indigo-800",
    pointsReward: "500 Points Reward",
    denominations: [10, 25, 50, 100],
    features: [
      { title: "Instant Delivery", desc: "Your digital card arrives in seconds via email or SMS, ready to be redeemed immediately.", icon: "bolt", bg: "bg-blue-100 text-blue-600" },
      { title: "Earn Potential", desc: "Earn up to 5% back in MCOM points with every gift card purchase for your own wallet.", icon: "trending_up", bg: "bg-indigo-100 text-indigo-600" }
    ],
    bonusOffer: { title: "Bonus Offer", desc: "Spend £100+ and get a bonus £5 voucher for your next order.", icon: "redeem" }
  },
  "brew-co": {
    name: "Brew & Co. Gift Card",
    category: "Restaurants",
    tag: "COFFEE LOVERS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrC6gNoz4Z0B-gQ2iHyPQjltS46yeC_vuuaFxADMT8Wpev09Gac0D3xrUkla4mRfG_XI1K_nCA5YFEGg1Q2d1gUM-5rbS132Rhw6FdMuPFpzB5wJ2zk8ZJHefCVKUI2kNGXlQv7kT97vAKX8n4Y_QzKo_ztugJNZ4B59VQwbtLcsgLo8lNnGiVqQx2DWqIeHn3VY_sMAPi5GItbJD9fFXEUsIPBesLJhFBnWwaKHG7rPyjW5shpJpPVmU5z-mNMQuG7Wr-RmukQTGU",
    desc: "Enjoy hand-crafted coffees, fresh pastries, and artisanal blends at any Brew & Co. location.",
    bgColor: "from-amber-600 to-amber-950",
    pointsReward: "250 Points Reward",
    denominations: [10, 25, 50],
    features: [
      { title: "Eco-Friendly", desc: "Digital cards eliminate plastic waste and support our tree-planting initiative.", icon: "eco", bg: "bg-green-100 text-green-600" },
      { title: "Morning Perk", desc: "Buy a Brew & Co card today and get a free espresso on your next visit.", icon: "coffee", bg: "bg-amber-100 text-amber-600" }
    ],
    bonusOffer: { title: "Happy Hour", desc: "Purchase £50+ and get an invitation to our exclusive coffee cupping events.", icon: "event" }
  },
  "travel-escape": {
    name: "Travel Escape Pass",
    category: "Travel",
    tag: "ELITE ADVENTURES",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYl5SedD4uSItVrNNXxIHvMIulMZhx6vIYYXTkWRav22aO_PEiYVK_ryI-IIuz5XHhu_tYnba_OPT5LzyBT9lK0TjvpwwFtPu6ViSIPhzxmerHj1qhITuttbtqhauL72G4m3d6aIcHun0oDqlcUikStuS36Ke5uWhg9Kf-l-BpLF83cYTHcjHRH8EeW_VgL557iTqAP_MouvWqCkZL3ivIpVLg1t1b8g47mltRWRryxl9sxJ-1Ny3GwvQBn382kH_Bro-wG2KjXwXZ",
    desc: "Unlock stays at boutique hotels, priority lounge access, and scenic cruises around the globe.",
    bgColor: "from-teal-600 to-teal-900",
    pointsReward: "1,500 Points Reward",
    denominations: [50, 100, 200, 500],
    features: [
      { title: "Elite Travel Support", desc: "Gain 24/7 dedicated concierge access to handle reservations and trip modifications.", icon: "support_agent", bg: "bg-teal-100 text-teal-600" },
      { title: "Earn Back", desc: "Earn up to 10% back in travel points on your loyalty status.", icon: "military_tech", bg: "bg-yellow-100 text-yellow-600" }
    ],
    bonusOffer: { title: "Lounge Access", desc: "Spend £200+ and receive a single-use VIP airport lounge pass.", icon: "flight" }
  },
  "cinema-plus": {
    name: "Cinema Plus Pass",
    category: "Entertainment",
    tag: "BLOCKBUSTER VALUE",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWGu5EXBb6MDC-eCMMSvagtYxwpiNpGVJ5D_MLQRyD1-mmfBPSw-li67jFWxT8BDf3qswGhodvKLmLqUEwOZlSDaLSCmoH6_bPp8Hw65Hp08M7xNoApdEUYaaz7F_z27IrJ5v2CJzGcKUhEcnnbzH-QsAsNFSUo12QMhLp6NC5BTBeDJYEywTwK-ZE3QsVtGwvCWrnZNuZO0k1bz-EMZCGvRWhT79ZoxrlgDELHTeFAR1Ixn2boJH38KS_kUCgDVUgJFwvyx_e662U",
    desc: "Redeemable for movie tickets, premium seating updates, and delicious snacks at participating locations.",
    bgColor: "from-red-600 to-rose-900",
    pointsReward: "200 Points Reward",
    denominations: [10, 20, 50],
    features: [
      { title: "Instant Access", desc: "Receive barcodes via SMS. Scan at any cinema self-service kiosk to book instantly.", icon: "qr_code", bg: "bg-red-100 text-red-600" },
      { title: "Popcorn Combo", desc: "Enjoy 20% off large popcorn & drink combos when you pay using this card.", icon: "local_dining", bg: "bg-rose-100 text-rose-600" }
    ],
    bonusOffer: { title: "Midweek Magic", desc: "Use on Tuesdays or Wednesdays to earn double MCOM points.", icon: "auto_awesome" }
  }
};

export default function GiftCardDetails({ params }: PageProps) {
  const { cardId } = use(params);

  // Fallback to global-retailer if cardId is not in dataset
  const card = giftCardDetailsData[cardId] || giftCardDetailsData["global-retailer"];
  
  const [denom, setDenom] = useState(card.denominations[Math.min(2, card.denominations.length - 1)]);
  const [scaleCard, setScaleCard] = useState(false);

  const handleDenomChange = (val: number) => {
    setDenom(val);
    setScaleCard(true);
    setTimeout(() => setScaleCard(false), 150);
  };

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-12">
      {/* Breadcrumbs */}
      <nav className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Link href="/gift-cards" className="hover:text-orange-500 transition-colors">Gift Cards</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-gray-600">{card.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Hero & Visuals */}
        <div className="lg:col-span-7 space-y-12">
          {/* Asymmetric Hero Section */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-orange-500/10 rounded-[32px] blur-2xl group-hover:bg-orange-500/15 transition-all duration-500"></div>
            <div 
              className={`relative aspect-[16/10] w-full rounded-[24px] overflow-hidden bg-gradient-to-br ${card.bgColor} shadow-lg transition-all duration-500 transform ${scaleCard ? 'scale-[1.03]' : 'hover:scale-[1.01]'}`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-50 mix-blend-overlay"></div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="font-display-sm text-lg md:text-xl font-bold tracking-tighter uppercase">MCOM PREMIUM</span>
                  <span className="material-symbols-outlined text-[36px] opacity-90">contactless</span>
                </div>
                
                <div className="space-y-4">
                  <div className="h-10 w-16 bg-white/20 rounded-lg backdrop-blur-md border border-white/10"></div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] tracking-widest opacity-70 uppercase">{card.category} GIFT CARD</p>
                      <p className="text-sm md:text-base tracking-widest font-mono font-medium">**** **** **** 2026</p>
                    </div>
                    <div className="text-3xl md:text-4xl font-extrabold" id="active-amount-display">£{denom}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {card.features.map((feature, idx) => (
              <div key={idx} className="p-6 rounded-[24px] bg-white border border-gray-150 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-full ${feature.bg} flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <h3 className="font-headline-sm text-base font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Configuration & CTAs */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-white/80 backdrop-blur-md border border-gray-150 p-8 rounded-[32px] shadow-sm space-y-8">
            <header className="space-y-3">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                  {card.tag}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline-lg text-gray-900">{card.name}</h1>
              <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
            </header>

            {/* Amount Selector */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <h4 className="text-gray-400">Select Amount</h4>
                <span className="text-orange-500">{card.pointsReward}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {card.denominations.map((val) => (
                  <button
                    key={val}
                    onClick={() => handleDenomChange(val)}
                    className={`border-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center ${
                      denom === val
                        ? 'border-orange-500 bg-orange-50/50 text-orange-600'
                        : 'border-gray-250 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    £{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-gray-100">
              <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-full shadow-lg shadow-orange-500/10 active:scale-95 transition-all">
                Buy for Self
              </button>
              <button className="w-full py-4 bg-white border-2 border-gray-800 text-gray-800 font-bold text-xs rounded-full hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">card_giftcard</span>
                Send as Gift
              </button>
            </div>

            {/* Trust & Security */}
            <div className="flex items-center justify-center gap-6 py-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider opacity-85">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-blue-500">auto_awesome</span>
                <span>No Expiry</span>
              </div>
            </div>
          </div>

          {/* Secondary Info Card (Bonus Offer) */}
          {card.bonusOffer && (
            <div className="mt-6 p-5 rounded-[24px] bg-orange-50/30 border border-orange-100/50 flex gap-4 items-start">
              <span className="material-symbols-outlined text-orange-500 p-2.5 bg-orange-50 rounded-2xl shrink-0">
                {card.bonusOffer.icon}
              </span>
              <div>
                <h4 className="font-bold text-orange-600 text-[10px] uppercase tracking-wider">{card.bonusOffer.title}</h4>
                <p className="text-gray-600 text-xs leading-relaxed mt-1">{card.bonusOffer.desc}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
