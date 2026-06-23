"use client";

import React, { use } from 'react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ rewardId: string }>;
}

const rewardDetailsData: Record<string, {
  name: string;
  category: string;
  cashback: string;
  desc: string;
  image: string;
  tag: string;
}> = {
  "global-travel-pass": {
    name: "Global Travel Explorer Pass",
    category: "GLOBAL TRAVEL",
    cashback: "15%",
    desc: "Earn massive cashback and priority status on flights, lounges, and luxury bookings worldwide.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXwV9jAvA4Rz1_qX4fp62W-_fgLpUB219jzsUPdMkpVcS8Bs-42xI_Wkr6tQqA7hnpEcZEwpK06EZ0KuYE1ljkOB2xgcHZYDabsMSDS3VCc0cm-nfZnKHMgpNB7sFlPZqGt_cYJjxbTcvuEYxKJTBRnwDHj5b9WJAs3vgs7t0GzLJZpcWjTpObieOLFKsExWJ8m9zUYMWNG-_0rBWSWWPK7VMLUyZgu_W5uejnpfG1mVm-bkuH8M6_Ei0TnIIbnamqe9NBF3dLdl1M",
    tag: "POPULAR"
  },
  "tech-bundle": {
    name: "Tech Essentials Bundle",
    category: "ELECTRONICS",
    cashback: "12%",
    desc: "Get state-of-the-art smart accessories, audio gear, and productivity monitors bundled with massive cashback.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZgaKsJgR15iD3RfJ0E1Ag_9O6vctcMEknff3m8KCkw4Cpc3Fs9fCyJmg-UKF5c0JY2mzDfTia21Vp8gO1OFq1BRWI8yeEKQhOvO7w7l-DliJQbT-0l-LAoI52938wOwuhg4tcMs9vnibO2BOZyoL-mJb9Y3EKsXtk-YL-01vouUxqOk3oSp9HrReEFbOTfXdxu73jig-VkAAZ9RkUlbnrDI0lTstG4yynkhGy782fukHcKnRBDz_xdLe7Whqp8lgp9kMsMYsIoLcC",
    tag: "HOT"
  },
  "dining-credit": {
    name: "Fine Dining Credit",
    category: "LUXURY GASTRONOMY",
    cashback: "10%",
    desc: "Indulge in Michelin-starred partnerships, boutique local bistros, and exclusive food tasting packages.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQRzm7od7iFbbBgsFJxe5c3SD-GZA-seGdwCiNfqqnvIq8FyuvyfcpUJCTHOXTB-2DApJBeIrXC8Tx0Xi_20W67tEUcJWGIwo26AHzS717KDabtnwTe60fMmBYEtUF89mKb01PJsEPrqz-_2rHgW_C2urrpF39zHnz3ZBi8Q3kL3DMkEGj-s5tZSNZV7JofaWaUoewH_iPrKXaqNIAc23lfuBCTw-eLNonxhjanbqkCafSaq4WfGx5viuyeEtwZQf4pNVCfY3anycC",
    tag: "EXCLUSIVE"
  }
};

const relatedRewards = [
  {
    name: "Home Decor Plus",
    tag: "15% BACK",
    category: "Premium Living",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB94DIa8eDW6s86T143BRGIaQR7jV1Rze2fJQ5W25rfZVzz1fXb7Nb-4W50PZuFRcAnwE9KktkbIvDnhrabHTf2ZKedg7nYHB3i-mJSGn5gnUBYkCh-SZdV0wRRV4OpJi4hTccaWNFLBzgsBTUM7cxx9b3KsrPqXSRZuuECCe9RcwLbP6EgGwFoDdOTBcB0Al4x7_wcpVniWGNVzhuEj1r6NYzxCEFaqFaG8T1ihNxkBxqYpaplj7EqVunfk9pBuOsAAw401mbZAuj0"
  },
  {
    name: "Aura Leather Tote",
    tag: "5k Points",
    category: "Fashion Label",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB06dio_wI-pp0pCPQdCzXz1M4R6dqPBESlGdG0lhHr_7o0HxQyPJcGx1jfK5jZIKno-gKVeG-7y7a9PlxVOa9-b4Wx_bbxwJguNaWUnJZs1NnW_PjZvn8A00euevV53ODU-sAgQo3jhLhWuom40mKHBNh1sKIKn6nHTfzXKb_JjVRlVNLG1e5Uw9hqNrGTa48pKLNvqhcFKT3V_5X2tXBfVAWfJUsfTX87jaaZArYQ5geMXpjG8Eef0S9Lq_J3HhyNYxgSSOxMZ3Ai"
  }
];

export default function RewardDetails({ params }: PageProps) {
  const { rewardId } = use(params);

  // Fallback to Artisan Espresso Collection if rewardId not explicitly matched
  const reward = rewardDetailsData[rewardId] || {
    name: "Artisan Espresso Collection",
    category: "LUXURY KITCHENWARE",
    cashback: "20%",
    desc: "Earn up to £150 in rewards points on your next purchase of Artisan series equipment.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCI-AMmI1oV1oUhJpbWTcoPG8ZSQqCR1PaYPTZ4KN5rntvrE9b_daDkg_KWEyZNxUtlHKKJQD9HNHDHgwZe3TFl74xP1r5PfRHdn--4NtBbIbzkVJVf6dmjlAQ5_TqKuy7BXnw8W_En774iUxTooDk-wkIooZtNjy6B7wU8ZxNA1Ew4G7UvU5nN3QyOrziuT_MJJnXvDc81pA3frkC7Usa-B_stKQYb74LcLw2RBwWMRPIsGyy7VR3do0bu4yOuM0AV6vebUmvwwmsf",
    tag: "EXCLUSIVE"
  };

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-16">
      
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* Product Image */}
        <div className="w-full md:w-3/5 rounded-[24px] overflow-hidden aspect-[4/3] relative border border-gray-100 shadow-sm">
          <img className="w-full h-full object-cover" src={reward.image} alt={reward.name} />
          <div className="absolute top-4 right-4">
            <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-orange-500/20">
              {reward.tag}
            </span>
          </div>
        </div>

        {/* Reward Summary */}
        <div className="w-full md:w-2/5 space-y-6">
          <div className="space-y-1">
            <span className="text-orange-600 font-bold text-xs tracking-widest uppercase">{reward.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold font-headline-lg leading-tight text-gray-900">{reward.name}</h1>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-3xl">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl text-white text-center min-w-[100px] shrink-0 shadow-md">
              <span className="text-2xl font-extrabold block">{reward.cashback}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">BACK</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {reward.desc}
            </p>
          </div>

          <div className="space-y-2">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 active:scale-95 transition-all">
              Claim Reward
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <p className="text-center text-[10px] text-gray-400 font-semibold">Valid until Oct 31, 2026</p>
          </div>
        </div>
      </section>

      {/* Info Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* How to Claim */}
        <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-[28px] border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold font-headline-lg text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">verified_user</span>
            How to Claim
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Activate Offer</h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">Click the "Claim Reward" button above to activate the cashback offer on your account.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Shop Partner Brand</h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">Visit the official partner store using our unique link and complete your purchase.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">3</div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Receive Rewards</h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">Your cashback will be credited to your MCOM wallet within 48 hours of shipping confirmation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-gray-50 p-6 md:p-8 rounded-[28px] border border-gray-100 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-headline-lg text-gray-900">Fine Print</h2>
            <ul className="space-y-2.5">
              {[
                "One reward per customer account.",
                "Not valid with other discount codes.",
                "Minimum purchase of £299 required.",
                "Return of item voids the reward."
              ].map((term, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed">
                  <span className="material-symbols-outlined text-orange-500 text-sm mt-0.5">check_circle</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>

          <button className="mt-6 text-orange-500 font-bold text-xs flex items-center justify-center gap-1 hover:underline">
            View Full Terms
            <span className="material-symbols-outlined text-sm">launch</span>
          </button>
        </div>
      </section>

      {/* You might also like section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold font-headline-lg text-gray-900">You might also like</h2>
            <p className="text-xs text-gray-500 mt-1">More curated offers based on your interests.</p>
          </div>
          <Link href="/reward" className="text-orange-500 font-bold text-xs hover:underline hidden md:block">
            Explore All Rewards
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {relatedRewards.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-gray-150 flex group hover:shadow-md transition-shadow">
              <div className="w-1/3 aspect-square bg-gray-50 relative shrink-0">
                <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                <div className="absolute top-2 left-2">
                  <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[8px] font-bold">
                    {item.tag}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">{item.category}</p>
                </div>
                <button className="w-fit border border-gray-200 text-gray-500 hover:bg-gray-50 px-4 py-1 rounded-full text-[10px] font-bold transition">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
