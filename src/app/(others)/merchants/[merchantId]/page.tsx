"use client";

import React, { useState, use } from 'react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ merchantId: string }>;
}

const merchantDetailsData: Record<string, {
  name: string;
  tag: string;
  desc: string;
  image: string;
  location: string;
  distance: string;
  tier: string;
  joined: string;
  progressPts: number;
  maxPts: number;
  totalVisits: number;
  availablePts: number;
  rewards: {
    large: {
      tag: string;
      title: string;
      desc: string;
      pts: string;
      image: string;
    };
    small: {
      title: string;
      desc: string;
      pts: string;
      image: string;
    }[];
  };
}> = {
  "artisan-coffee": {
    name: "The Artisan Coffee House",
    tag: "Elite Partner",
    desc: "Experience the finest brews and exclusive member perks. Earn beans with every sip and unlock artisanal rewards curated just for our local connoisseurs.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFeO63gVN9uEsKaCyVGiRclkNmJnWy3P50rtl0xqPXKv0hO0g1F40GemUoGko3FI4pRZgDOtlhhRkcYxImVMjHpIFKseZBJH3WuwSsre0Xxv9FL8noEvBPbTeie39MR9eJzR7Bqr6dA5ASncxJZ6DK6arKIigzw3ILYN0p0KlBCPT456ow0wcZDgALK2pVT5QNIc5t2il4DUMhvuSuS4zGUd81l1cl1qH0XT5uixZFsKTExCqp0Bi9201Fudky5-ZQ5Kzhca2Sn6QL",
    location: "Central District",
    distance: "0.4 miles away",
    tier: "Gold Tier",
    joined: "Member since 2023",
    progressPts: 850,
    maxPts: 1000,
    totalVisits: 24,
    availablePts: 12450,
    rewards: {
      large: {
        tag: "Premium Reward",
        title: "Home Barista Masterclass",
        desc: "A private 2-hour session with our head barista learning the secrets of the perfect extraction.",
        pts: "5,000 Points",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpN2nAYiIYXfgnYOwvw4WDZondTITWQgtSgb7l8vodmd8HCbDiek6h4Rsf3JcDI82vRsfynrX0Z2CE32kN2HaCbUXqaWuuHaxUW5gZj5bAsCSLrx5CE0IuZr_iGzGHqPHlulEMxYlnRNe8gg9rKbP3iKaqKPzGWUCL4YkAVHGZ-thg9M1_68WPBhvh_cr-afaqpoxI5uWLsS5aoKu0aj9FDSstIfUi67E4sa6uWPmuR77KgJePGHjthAwapjRBCKsQJAmXzy9zurY7"
      },
      small: [
        {
          title: "Signature Pastry Box",
          desc: "A box of 4 freshly baked treats.",
          pts: "1,200 pts",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPb0kc1eDuY-52_Zfi1jJDJG7ReWJCwz5zAUu4NRhcADKFeoIpo9D9Nc7QL3aTpL4APoUUoGcj5oBur7UOXNfY5_YxTob_AzN2nrtcYMv0CCOlPOmbzzd8rJ6J87bkCp_bXETJOsjWwPub0jbE5OP4o73bsdBUgiewELoECiNoLH09FQuYbsmzeRIFkBaNt8EotbA0dB-0Qr_KmdoMmZBzVmM48t9vAEI3yRybasz06o6M__Vyz3wNuTn-Y_5UhRCFqxKlU8IuIUFY"
        },
        {
          title: "Whole Bean Coffee (1kg)",
          desc: "Choose from our monthly single origins.",
          pts: "2,500 pts",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAswOKMxV5omk7whrRdOj2WulUiuHVyHdfQn66T2scFlzjwiF_w0ljqAIWetA3bQBgFEftwXdFe1bpDjahww09Wenr2RgzGWoxKYk2sEySz3unrGhcRkfKVqt26M4wYeH9saAnbxqZQ43KqFza3bexKbWiDVqkejF-Yx1FwiQpQ3hXzVjqWaEMVpQh8hcBGSh8GA8Dp5k4etCxZyj1a-3_8mZLxCHFV1S4iIjrkgAKy45rWpsohFmiU5lHoZ9RE-px1AdwfIerEqBjf"
        }
      ]
    }
  }
};

export default function PartnerMerchantDetails({ params }: PageProps) {
  const { merchantId } = use(params);

  // Fallback to artisan-coffee if merchantId is not matched
  const merchant = merchantDetailsData[merchantId] || merchantDetailsData["artisan-coffee"];

  const [availablePoints, setAvailablePoints] = useState(merchant.availablePts);
  const [redeemed, setRedeemed] = useState<Record<string, boolean>>({});

  const handleRedeem = (rewardTitle: string, pointsCost: number) => {
    if (redeemed[rewardTitle]) return;
    if (availablePoints < pointsCost) {
      alert("Insufficient points for this reward.");
      return;
    }
    setAvailablePoints(prev => prev - pointsCost);
    setRedeemed(prev => ({ ...prev, [rewardTitle]: true }));
  };

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-16">
      
      {/* Breadcrumbs */}
      <nav className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Link href="/brands" className="hover:text-orange-500 transition-colors">Brands</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-gray-650">{merchant.name}</span>
      </nav>

      {/* Hero / Partner Identity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-50 text-orange-650 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px] fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            {merchant.tag}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-headline-lg text-gray-900 leading-tight">
            {merchant.name}
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl">
            {merchant.desc}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-xs shadow-md shadow-orange-500/10 active:scale-95 transition-all">
              Book Now
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold text-xs hover:bg-gray-50 active:scale-95 transition-all">
              Visit Store
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div 
            className="aspect-square rounded-[32px] overflow-hidden shadow-md bg-cover bg-center transform hover:scale-[1.01] transition-transform duration-500" 
            style={{ backgroundImage: `url('${merchant.image}')` }}
          />
          <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">location_on</span>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-800">{merchant.location}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{merchant.distance}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Loyalty Tier Status */}
      <section>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-150 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-orange-550 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[140px]">workspace_premium</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Current Status</h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-extrabold text-orange-500">{merchant.tier}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{merchant.joined}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Progress to Platinum</span>
                  <span className="text-orange-550">{merchant.progressPts} / {merchant.maxPts} pts</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(merchant.progressPts / merchant.maxPts) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 text-center space-y-1">
                <p className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Total Visits</p>
                <p className="text-3xl font-extrabold text-gray-800">{merchant.totalVisits}</p>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 text-center space-y-1">
                <p className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Available Points</p>
                <p className="text-3xl font-extrabold text-orange-500">{availablePoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Rewards - Bento Grid */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Active Rewards</h2>
            <p className="text-xs text-gray-500 mt-1">Redeem your hard-earned points for exclusive perks.</p>
          </div>
          <button className="text-orange-550 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
            View All <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Large Reward Card */}
          <div className="lg:col-span-2 bg-white rounded-[32px] p-6 border border-gray-150 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow group">
            <div 
              className="w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden bg-cover bg-center shrink-0" 
              style={{ backgroundImage: `url('${merchant.rewards.large.image}')` }}
            />
            <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
              <div className="space-y-4">
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                  {merchant.rewards.large.tag}
                </span>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors">
                  {merchant.rewards.large.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {merchant.rewards.large.desc}
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-1 text-orange-500 font-extrabold text-sm">
                  <span className="material-symbols-outlined text-lg fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <span>{merchant.rewards.large.pts}</span>
                </div>
                <button 
                  onClick={() => handleRedeem(merchant.rewards.large.title, 5000)}
                  disabled={redeemed[merchant.rewards.large.title]}
                  className={`w-full py-3.5 rounded-full font-bold text-xs transition active:scale-95 shadow-sm ${
                    redeemed[merchant.rewards.large.title]
                      ? 'bg-green-100 text-green-700 shadow-none cursor-default'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {redeemed[merchant.rewards.large.title] ? 'Redeemed' : 'Redeem Reward'}
                </button>
              </div>
            </div>
          </div>

          {/* Small Reward Cards */}
          <div className="space-y-8 flex flex-col justify-between">
            {merchant.rewards.small.map((reward, idx) => {
              const ptsVal = idx === 0 ? 1200 : 2500;
              return (
                <div key={idx} className="bg-white rounded-[24px] p-5 border border-gray-150 flex group hover:shadow-md transition-shadow justify-between gap-4">
                  <div 
                    className="w-24 h-24 aspect-square rounded-xl bg-cover bg-center shrink-0" 
                    style={{ backgroundImage: `url('${reward.image}')` }}
                  />
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div>
                      <h4 className="font-bold text-xs text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">
                        {reward.title}
                      </h4>
                      <p className="text-[10px] text-gray-450 leading-relaxed mt-1 line-clamp-2">
                        {reward.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-orange-500 font-extrabold text-xs">{reward.pts}</span>
                      <button 
                        onClick={() => handleRedeem(reward.title, ptsVal)}
                        disabled={redeemed[reward.title]}
                        className={`p-1.5 rounded-full transition active:scale-90 flex items-center justify-center ${
                          redeemed[reward.title]
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-orange-500 hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {redeemed[reward.title] ? 'done' : 'add'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
