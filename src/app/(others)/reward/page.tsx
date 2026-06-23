"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const spotlightRewards = [
  {
    title: "Global Travel Explorer Pass",
    desc: "Redeem points for premium lounge access and flights.",
    badge: "Up to 15% Cashback",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXwV9jAvA4Rz1_qX4fp62W-_fgLpUB219jzsUPdMkpVcS8Bs-42xI_Wkr6tQqA7hnpEcZEwpK06EZ0KuYE1ljkOB2xgcHZYDabsMSDS3VCc0cm-nfZnKHMgpNB7sFlPZqGt_cYJjxbTcvuEYxKJTBRnwDHj5b9WJAs3vgs7t0GzLJZpcWjTpObieOLFKsExWJ8m9zUYMWNG-_0rBWSWWPK7VMLUyZgu_W5uejnpfG1mVm-bkuH8M6_Ei0TnIIbnamqe9NBF3dLdl1M",
    id: "global-travel-pass"
  },
  {
    title: "Tech Essentials Bundle",
    points: "2,500 Points",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZgaKsJgR15iD3RfJ0E1Ag_9O6vctcMEknff3m8KCkw4Cpc3Fs9fCyJmg-UKF5c0JY2mzDfTia21Vp8gO1OFq1BRWI8yeEKQhOvO7w7l-DliJQbT-0l-LAoI52938wOwuhg4tcMs9vnibO2BOZyoL-mJb9Y3EKsXtk-YL-01vouUxqOk3oSp9HrReEFbOTfXdxu73jig-VkAAZ9RkUlbnrDI0lTstG4yynkhGy782fukHcKnRBDz_xdLe7Whqp8lgp9kMsMYsIoLcC",
    id: "tech-bundle"
  },
  {
    title: "Fine Dining Credit",
    points: "10% Off",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQRzm7od7iFbbBgsFJxe5c3SD-GZA-seGdwCiNfqqnvIq8FyuvyfcpUJCTHOXTB-2DApJBeIrXC8Tx0Xi_20W67tEUcJWGIwo26AHzS717KDabtnwTe60fMmBYEtUF89mKb01PJsEPrqz-_2rHgW_C2urrpF39zHnz3ZBi8Q3kL3DMkEGj-s5tZSNZV7JofaWaUoewH_iPrKXaqNIAc23lfuBCTw-eLNonxhjanbqkCafSaq4WfGx5viuyeEtwZQf4pNVCfY3anycC",
    id: "dining-credit"
  }
];

const newRewards = [
  {
    name: "Organic Glow Kit",
    category: "Eco-Friendly",
    cost: "1,200 pts",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSt6EDX3Lkg9KP_IFNcwJtgayfKNOicATOaNwk0EZOT6_0k2H-65BG83-Q12GfTpi3kNvtzAHbKLqr6VFkBuXty__8YZFW5NyBoVP1CpYwjZRQu5dRDPs9lDaQw2pz6pP-jZ9KFwfwjWk2sTz_6NBaQII-k8Cyuodq2MwaRsntuDVu4EwrwrVAVb0dykzaxau6FjJDrXQRF0tPg3YXT6-xYyeWdkZFDUthyUibs3CpWUYfiX-BC0-swLKPwsD3VrBDHYYMeEOIraDw",
    id: "organic-glow-kit"
  },
  {
    name: "Sonic Wave Headphones",
    category: "Tech",
    cost: "5,000 pts",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdR70KUmsHeZeotRNR2IU8ptDsoeShjD7NAZ8FHitmHN_KJ_uJBrUHhHLU7NBkJN3ZgfMmmGGBqsRq8uXd6F6Mci4VkwS2-KIq1K7Uo-udw0UMjDnBDqYREsFtksmb8V9Hqmv0bVx6ud6yWKTU3FPPBaZk4iYElojMp9xRZ6tJkEEUSeytfgI_BT-JrWP1rrpcMJUnF0KToVc7_H5tuUi-Of0L9BrgU8Q_IjKPcbD88izDVh3DcCWS-Y9VkIR1U6v601aZOqL975Y2",
    id: "sonic-headphones"
  },
  {
    name: "Café Membership",
    category: "Daily",
    cost: "8% Cash",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvZAy_C1LnJD-Mk9hMiSZq0v6_DK8KVlrEJhJri6I2irEnvcQiRK9VkUdYIhtpchAc49nCMJOQheo_KOCUR8cTxZGzIf5Fe36rtsG5p3iJOCHsDBZ6xmSalZ_koJOVhfx48RXkPTBj_J4d4qTP_L_Q5vqyQuzx9ZIdqIX1S3tJdvi9uN7HxtZbV0hcTnN9MSFS32JJn-9XNxH2U-SMWe35YU1NtsqtB-iKc_JHzqwg1x_j7Vt8Di7ohbjFNTsIedOx5yxiSvg5xfQ1",
    id: "cafe-membership"
  },
  {
    name: "Vanguard Sneakers",
    category: "Fashion",
    cost: "3,500 pts",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf2yyY8HqhX93UZYk6baTJjBjcXfj3ssN8DC40bAdM4zVbT6Ll-p124mn9g9oN85rIlR-FoDLw2jMI4se-0hDDy07bksgoPqqEkZp0WvRYjnf7mTclzwxRNKYYcacB82xwyRLDKVeDiAtEhBSCiYb65yt4gtdP0VZ8SVRaYreBS1Jg7H9QqMcmLo-lmU8W9YaN9TomobsPrq73Efo2WQt7a0SOy-eYnCr5weu5_86TOuRUakvjtxFnH4rW4o9KqE6Nr_3L4nEOOO6f",
    id: "vanguard-sneakers"
  }
];

const trendingList = [
  { id: 1, name: "Amazon £50 Gift Card", count: "4,500 redeemed today" },
  { id: 2, name: "Uber Eats Promo Code", count: "2.1k redeemed today" }
];

const localRewards = [
  {
    name: "The Sourdough Loft",
    distance: "0.4 miles away",
    offer: "12% Cashback",
    status: "ACTIVE NOW",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDu0YWkV04LOVu7WHfWtJ_w114Gn7OvAhjf4U1mJjN4L2aZLBpSJCSQqY9lfVC4zTLBoLe_1sXt7xy_vKrnL6kGgcLf-3jiTt4EaXfMgQ3LX8FuFUvZ6Qi0GPJTeaNUuE3a1yw0_OzHKP82JfvXoKszM6i9c3wJJr41Is8jXrD7pHk98b9sG1Yr93tbdDm_RuePYVwNbx90ogeK8y-fMBr4ou8_AX3Hh7SD5vdQhBjeyaaKMht_XCETe-IBVzAOiqoI_g6A9XFTK2Hh",
    id: "sourdough-loft"
  },
  {
    name: "Peak Performance Gym",
    distance: "1.2 miles away",
    offer: "500 Bonus Pts",
    status: "CHECK-IN",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiOkuF-JI6IEXpgUI0hb6K4mb6AdRExi17cZKPnNrt6KQKnV6ruf_G_8MqDXmw7Qn73jJXD80xMYKtzgk2Waj7SZEooS8spYUUc47teLa2VH8jdPiw-9E2Rhp2lh0vkK6pzjo2wYZt4yPkXQWt3hjwdX4nWfjxdYw6qrRnmgE2GI-Gp1OT9oxiavKOgt_Xey_X1sRxgDhwLs-V8ZM0QTVswaglEL3PTFpl_Le3-RsrstL5gpJUWP5vhkE08pYE6FZ6vocfjnaO7nk4",
    id: "peak-gym"
  }
];

const topBrands = [
  { icon: 'brand_family', label: 'Lifestyle' },
  { icon: 'shopping_bag', label: 'Bags & Accessories' },
  { icon: 'directions_run', label: 'Sports & Active' },
  { icon: 'laptop_mac', label: 'Electronics' },
  { icon: 'local_cafe', label: 'Café & Bakery' },
  { icon: 'fastfood', label: 'Fast Food' }
];

export default function RewardsMarketplace() {
  const [seconds, setSeconds] = useState(3 * 3600 + 45 * 60 + 12);
  const [category, setCategory] = useState("Category");
  const [brand, setBrand] = useState("Brand");
  const [business, setBusiness] = useState("Business Type");
  const [location, setLocation] = useState("");

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6">
      
      {/* Interactive Filter Bar */}
      <section className="mb-12">
        <div className="bg-white rounded-3xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-md border border-gray-100">
          
          {/* Category Dropdown */}
          <div className="flex items-center flex-1 w-full px-4 py-2 gap-2 md:border-r border-gray-100">
            <span className="material-symbols-outlined text-orange-500">category</span>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option>Category</option>
              <option>Travel</option>
              <option>Dining</option>
              <option>Fashion</option>
              <option>Tech</option>
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="flex items-center flex-1 w-full px-4 py-2 gap-2 md:border-r border-gray-100">
            <span className="material-symbols-outlined text-orange-500">sell</span>
            <select 
              value={brand} 
              onChange={(e) => setBrand(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option>Brand</option>
              <option>Apple</option>
              <option>Nike</option>
              <option>Starbucks</option>
            </select>
          </div>

          {/* Business Type Dropdown (Gap Analysis Fix) */}
          <div className="flex items-center flex-1 w-full px-4 py-2 gap-2 md:border-r border-gray-100">
            <span className="material-symbols-outlined text-orange-500">storefront</span>
            <select 
              value={business} 
              onChange={(e) => setBusiness(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option>Business Type</option>
              <option>Local Retailer</option>
              <option>Restaurant / Cafe</option>
              <option>Wellness & Gym</option>
              <option>Entertainment</option>
            </select>
          </div>

          {/* Location Input */}
          <div className="flex items-center flex-1 w-full px-4 py-2 gap-2">
            <span className="material-symbols-outlined text-orange-500">location_on</span>
            <input 
              type="text" 
              placeholder="Location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-semibold text-gray-700 outline-none"
            />
          </div>

          {/* Search Action Button */}
          <button className="bg-orange-500 hover:bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md shadow-orange-500/10 active:scale-95 transition-all duration-200">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </section>

      {/* Featured Rewards (Hero Bento) */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <span className="text-orange-500 font-bold text-xs tracking-widest uppercase">Spotlight</span>
            <h2 className="text-2xl md:text-3xl font-bold font-headline-lg text-gray-900">Featured Rewards</h2>
          </div>
          <Link href="/deals" className="text-orange-500 font-bold text-xs md:text-sm hover:underline flex items-center gap-1 w-fit pt-1 md:pt-0">
            View All Offers <span className="material-symbols-outlined text-xs md:text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Large Card */}
          <div className="md:col-span-2 md:row-span-2 relative rounded-[32px] overflow-hidden group min-h-[380px] shadow-sm border border-gray-100 flex flex-col justify-end">
            <div className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 style={{ backgroundImage: `url('${spotlightRewards[0].image}')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
            <div className="p-8 z-20 text-white space-y-3">
              <div className="bg-orange-500 text-white px-4 py-1.5 rounded-full inline-block text-xs font-bold shadow-lg shadow-orange-500/20">
                {spotlightRewards[0].badge}
              </div>
              <h3 className="text-2xl font-bold leading-tight">{spotlightRewards[0].title}</h3>
              <p className="text-sm opacity-90">{spotlightRewards[0].desc}</p>
              <div className="pt-2">
                <Link href={`/reward/${spotlightRewards[0].id}`} className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold text-xs hover:bg-orange-50 transition active:scale-95 inline-block">
                  View Detail
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Card 1 */}
          <div className="md:col-span-2 relative rounded-[32px] overflow-hidden group min-h-[220px] shadow-sm border border-gray-100 flex flex-col justify-end">
            <div className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 style={{ backgroundImage: `url('${spotlightRewards[1].image}')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />
            <div className="p-6 z-20 text-white space-y-1">
              <span className="text-orange-400 font-bold text-xs">{spotlightRewards[1].points}</span>
              <h4 className="text-xl font-bold">{spotlightRewards[1].title}</h4>
              <div className="pt-2">
                <Link href={`/reward/${spotlightRewards[1].id}`} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 inline-block">
                  Redeem Reward
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Card 2 */}
          <div className="relative rounded-[32px] overflow-hidden group min-h-[200px] shadow-sm border border-gray-100 flex flex-col justify-end">
            <div className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 style={{ backgroundImage: `url('${spotlightRewards[2].image}')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />
            <div className="p-6 z-20 text-white space-y-1">
              <span className="text-orange-400 font-bold text-xs">{spotlightRewards[2].points}</span>
              <h4 className="text-lg font-bold">{spotlightRewards[2].title}</h4>
              <div className="pt-2">
                <Link href={`/reward/${spotlightRewards[2].id}`} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold transition inline-block">
                  Details
                </Link>
              </div>
            </div>
          </div>

          {/* Partner CTA Card */}
          <div className="relative rounded-[32px] overflow-hidden bg-orange-500 p-6 flex flex-col justify-between min-h-[200px] shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <span className="material-symbols-outlined text-white text-4xl">stars</span>
            <div className="space-y-2">
              <h4 className="text-white font-bold text-lg leading-snug">Exclusive Partner Access</h4>
              <Link href="/business" className="bg-white text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-bold shadow-md hover:bg-orange-50 transition active:scale-95 inline-block">
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Rewards Grid */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold font-headline-lg mb-6 flex items-center gap-2 text-gray-900">
          <span className="material-symbols-outlined text-orange-500">new_releases</span>
          New Rewards
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {newRewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:border-orange-500/20 transition-all group flex flex-col justify-between">
              <div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 relative">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                       src={reward.image} alt={reward.name} />
                </div>
                <span className="bg-orange-500/10 text-orange-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                  {reward.category}
                </span>
                <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{reward.name}</h4>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-orange-500 font-bold text-sm">{reward.cost}</span>
                <button className="material-symbols-outlined text-gray-400 hover:text-orange-500 transition-colors">
                  favorite
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Rewards (Asymmetric Page Feature) */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <span className="text-orange-500 font-bold text-xs tracking-widest uppercase">Hot Right Now</span>
            <h2 className="text-3xl font-bold font-headline-lg text-gray-900">Trending Rewards</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            These offers are being redeemed every minute. Don't miss out on the most popular rewards this month.
          </p>

          <div className="space-y-3 pt-2">
            {trendingList.map((trend) => (
              <div key={trend.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {trend.id.toString().padStart(2, '0')}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">{trend.name}</p>
                  <p className="text-xs text-orange-500 font-semibold">{trend.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Glassmorphic Countdown Flash Sale */}
        <div className="md:col-span-2 relative h-[360px] rounded-[36px] overflow-hidden flex items-center justify-center shadow-lg border border-gray-100/50">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700" 
               style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD90MrLn5YMx93TvGU7yk-N2Qutcyqnm-6oOuZwIClaGQasTr7EhmluL5eX8CXd3stwg4pFHIo9I7gs7TmBCY0toJnFN47VR9vHt6Bnf3_y-3osPyJp1y3SgKjtY9bpOzgBCMOMhfFO56tTnHtvora4wB5B9FN1YZRJ8u1qgxKwVZ9MbXklOEjPx4AkOs7qVIPLqdycmy8RTWQ89x-UxCToAu0RKtfKCTJQpFsKtyO8oenn4i-ldLOV7RcC5uXdJyIgGBLDsdkwaXqQ')` }} />
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
          
          <div className="relative bg-white/85 backdrop-blur-md p-8 rounded-3xl max-w-sm text-center shadow-xl border border-white/20 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Exclusive Flash Sale</h3>
            <p className="text-xs text-gray-600">Get 2x points on all electronics for the next 4 hours!</p>
            <div className="text-3xl font-bold text-orange-600 tracking-wider font-mono bg-orange-50 py-2.5 rounded-xl border border-orange-100">
              {formatTime(seconds)}
            </div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-bold text-xs shadow-md transition duration-200">
              Shop Tech Now
            </button>
          </div>
        </div>
      </section>

      {/* Local & Brand Rewards Combined Row */}
      <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Local Rewards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Local Rewards Near You</h2>
          <div className="space-y-4">
            {localRewards.map((biz) => (
              <div key={biz.id} className="flex gap-4 bg-white p-4 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-cover bg-center bg-gray-50 border border-gray-100" 
                     style={{ backgroundImage: `url('${biz.image}')` }} />
                <div className="flex flex-col justify-center flex-1">
                  <h4 className="font-bold text-base text-gray-800">{biz.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">{biz.distance}</p>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-orange-500 font-bold text-xs">{biz.offer}</span>
                    <span className="text-orange-600 text-[10px] font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                      {biz.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Categories / Top Brands */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Top Brands</h2>
          <div className="grid grid-cols-3 gap-4">
            {topBrands.map((brand, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center hover:bg-orange-500 hover:border-orange-500 group transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[36px] text-gray-600 group-hover:text-white transition-colors">
                  {brand.icon}
                </span>
                <span className="text-[10px] text-gray-400 font-bold text-center mt-2 group-hover:text-white transition-colors">
                  {brand.label}
                </span>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between mt-4">
            <div>
              <p className="font-bold text-amber-700 text-sm">Brand Partnerships</p>
              <p className="text-xs text-gray-500 mt-0.5">Get early access to exclusive brand drops.</p>
            </div>
            <span className="material-symbols-outlined text-amber-700">arrow_forward</span>
          </div>
        </div>
      </section>

      {/* Exclusive Platinum Tiers Card */}
      <section className="relative p-8 md:p-12 rounded-[40px] overflow-hidden shadow-lg border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 bg-neutral-900 text-white">
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl space-y-4">
          <h2 className="text-3xl font-bold leading-tight">Exclusive Platinum Rewards</h2>
          <p className="text-sm opacity-80 leading-relaxed">
            Unlock premium concierge services, luxury travel credits, and invitation-only events with your Platinum membership.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-orange-500">20%</p>
              <p className="text-[10px] opacity-75">Higher Earn Rate</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-orange-500">∞</p>
              <p className="text-[10px] opacity-75">No Expiry</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[320px] bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <h3 className="font-bold text-lg">Unlock Platinum</h3>
          <ul className="space-y-3">
            {[
              "Dedicated Support Line",
              "VIP Event Access",
              "Birthday Milestone Gifts"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs opacity-90">
                <span className="material-symbols-outlined text-orange-500 text-sm">check_circle</span>
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-full font-bold text-xs transition duration-200">
            Upgrade My Account
          </button>
        </div>
      </section>

    </div>
  );
}