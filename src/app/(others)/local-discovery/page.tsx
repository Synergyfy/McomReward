"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const localCategories = [
  { icon: "restaurant", name: "Restaurants" },
  { icon: "content_cut", name: "Barbers" },
  { icon: "spa", name: "Salons" },
  { icon: "self_improvement", name: "Spas" },
  { icon: "shopping_bag", name: "Retail" },
  { icon: "handyman", name: "Services" }
];

const featuredPartners = [
  {
    id: "aether-dining",
    name: "Aether Dining",
    desc: "Modern fusion & curated wine lists with 15% MCOM rewards.",
    tag: "Top Pick",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBudyC6OvcZ9ooMTK9GI3q-ZTJgG7uanamwLM9BNbGoSPQ1K_TCPUDl-O0yT-4rHyFAYa4W43tu__-7rl1qwbcgKZAB2CTYOpk30yFaeYqJwZ1Be6fYpoCTWp1S2uOJCu-uQxjsUdwXEyVy-TIcm1f3e8CUiDd3fUgfo-NWS8T1WF6tRqC6pRca-0O785cjp5KIOkYfbEu2mVyC8w96xKkX_51UnW8VayQa3-NSPvlUBfIHk4tqzcEK7QzeyLjPzG6dckwhtoa26GV"
  },
  {
    id: "grooming-club",
    name: "The Grooming Club",
    desc: "Earn 2x Points on all cuts this weekend.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUQmmOPxuiK0nYRrQu4MdhJMHsAqQDK_e9_IvA6doP-0X_7cdD-qGdWcf8HvBxHqJdUT9ufCajUO0XmndAl3f9-m_Y2mc5LBEZuz1JG64ULQCADZi7bsdBv6l7mkAEcyC-EQ_L3UwmFZq2AQY8Ie3P1REmLtP1VJlpw7kUgqzd7NRIQeecgGdaxGwXAWecBcHP8mAnsU3pgG5MPue70xhBB0wUji8cihT0UkasGFJBxqI-qxeFdiiCIJOf1mfD-ZAkON2W4Mv82rH_"
  },
  {
    id: "lumina-spa",
    name: "Lumina Spa",
    category: "Wellness Retreat",
    rating: "4.9 ★",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQo-J-il-ZLhFETcE7WF2AdjflLbyI2GkoijgTqM5qIBqCYoqF4MPrISgWAyrH9MR5JDQyh0CgC7XKcw98fK6e42hrMZPck8m7mT4gm3yvJXLxY1_YI-xZcteioqPimJ3XsnndEUQbXCNVWbK1ij_015bNfbQ4mbFj_A0r5pxNo1kF4UYDzIikh59mLWFpWGWPfVD77YqwVck8Clc_ZxN2JtBgI-uhVqfU_KytIjmv5LmPY2zS7TVj2ZPXroNWDcx0iofCM0lL4QMK"
  }
];

const aroundCornerList = [
  { id: 1, name: "Velvet Roast Coffee", desc: "0.3 miles • Artisan Café", icon: "restaurant", x: "33%", y: "25%" },
  { id: 2, name: "The Book Nook", desc: "0.8 miles • Boutique Retail", icon: "shopping_bag", x: "75%", y: "66%" },
  { id: 3, name: "FitLab Collective", desc: "1.2 miles • Fitness Studio", icon: "self_improvement", x: "50%", y: "50%" }
];

const popularTrending = [
  {
    id: "velvet-roast",
    name: "Velvet Roast",
    price: "$$",
    desc: "Artisanal coffee and locally sourced pastries.",
    tag: "CAFE",
    reward: "EARN 10%",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmO_QiYov-L13UUhbuK6A9LV8DB9TpWc3-BmEjHyYxuCPrhT9KP0J1G3koE8DXH0r9rM_JmDJJoaclhGD7CKn57gxVbX1ndXi4TSM58-g0ZNexIm6nQi1xFPV3aTna78Y66pKn65K8Cj9DdfAWV79LC0A7gA5S-UZkHzh_wpJbH3dpcI9bCyGeRcJHAStJa8Y8sB9vUHp8W38XxhEnHKIIjeccEadtJI_PA9MiI2tlg4BmbSstlgdyl9umTmkTFZJYmAU95ECjkPLS"
  },
  {
    id: "fitlab-collective",
    name: "FitLab Collective",
    price: "$$$",
    desc: "Elite performance training & recovery sessions.",
    tag: "FITNESS",
    reward: "FREE PASS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiC4QJn3wbgcOXtOGfBFa7zPnrLQZbFu178z8gXKF8k5QWhUr7CKay3o0U3LDYkqkOoR44PtQH_GyQuDnAZYB48WX-QGtS6i8mdo96gOPwE_NZPW5tzFlvAATa0UZslE749Bkd-IONjpkh2V0vuwTXT0loVX7zP0GTDA0uGfphZqB3vw3RJ7iCFatbwYclaHQNMm-G-125mx6otPhhE10tmVtpetn0r3icomAoo8vml0bjoQ7lKqtIadusre0c5b1IketNRp2CkIql"
  },
  {
    id: "loft-store",
    name: "The Loft Store",
    price: "$$",
    desc: "Curated apparel and home goods from local makers.",
    tag: "RETAIL",
    reward: "GIFT BACK",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxqh1W3qIiPNDWahEveM-wG8HEWH-xYdo0wQRyO4E3OzMnixNlrq9hAYQ5XOYP-k68qP23CmGWT6vIqZ2IIJpvejKP9F6uNpBmO30F_yFaVuCpjhTCc9Rol9vCaOtxQzc64aNuyn_QMlvgcjDOu1Ok7GKwjjI-jTMfh23fOcR9TuueYEOB4wAopAwv9OeJmZhUEkWbLSxlJu2am_KZJr4zRrYP71bQUuAcDRkcNhW5swRcEreWZerpW6z_UgszLpuKwcIPQh_XJcc4"
  }
];

const newArrivals = [
  {
    id: "local-market",
    status: "OPENING SOON",
    name: "The Local Market",
    desc: "A community-driven grocery featuring over 50 local farmers and artisans.",
    meta: "Joined Oct 24th",
    icon: "calendar_today",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ItAd_oLGLhw1WFMWMWTe0Ipv6ZwsZfNOAIQDUci8HOfO2DeGSmF8QQgS7zt9G_L4tzmRkjlWA5fdwnCOvXDq1UItOVBctHgDVGNxTTawr-miEAJWqLcHIzAYq2rOeA7Vdkpja9bCGGVvMKLdpdCe1pMgjmNki2BlUeqQm7eTj_mtylqiujoWA66RLKVTSSM4xV19SbqQgRwZCLgVMbk14n6XXV5ufEMtOlq9-S-UsqTM5bKUXul9VlDPhmRCz1wR0lm0Gdxyr2M7"
  },
  {
    id: "ember-oak",
    status: "NEW PARTNER",
    name: "Ember & Oak",
    desc: "Craft cocktails and wood-fired small plates in a lush garden setting.",
    meta: "Certified Partner",
    icon: "verified",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjsW2hH0T4EiNu-cT-vN85JtoWKVww_1KFx-gFGWp1ehoymUbm3IeKkXvkkjwMjcRHQ5QsZQNW-wTC5vp8fpvR2cJLYSD2aGLnKDY3FM-Y91TBKMt3ScqvrZAWg3qQlkSl5OhEtHXVrq77fS9qC-Y4bIGCaJdJDrofHpLALnaPBNyIiuvB4PEG3JyjleZTyCRdOxp3r7nZr5fOnnyq_n-lyfv-IyL0xJHUrZ3oBhZhuwfLp8E1rmdSqZCEr3tX2OdU09eeFEob42H9"
  }
];

export default function LocalDiscovery() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-16">
      
      {/* Hero Search & Discovery */}
      <section className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 p-8 md:p-16 min-h-[380px] flex flex-col justify-center shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold font-headline-lg text-white leading-tight">
            Find your next favorite local spot.
          </h1>
          <p className="text-sm md:text-base text-white/90 leading-relaxed">
            Discover curated rewards and high-end services right in your neighborhood.
          </p>

          <div className="flex flex-col md:flex-row gap-2 bg-white p-2.5 rounded-3xl md:rounded-full shadow-lg border border-white/20">
            <div className="flex-1 flex items-center px-4 py-2 gap-2">
              <span className="material-symbols-outlined text-gray-400">search</span>
              <input 
                type="text" 
                placeholder="Barbers, Spas, or Spiced Lattes..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none focus:ring-0 w-full text-sm text-gray-700 outline-none"
              />
            </div>
            <div className="w-px h-6 bg-gray-200 hidden md:block self-center" />
            <div className="flex-1 flex items-center px-4 py-2 gap-2">
              <span className="material-symbols-outlined text-gray-400">location_on</span>
              <input 
                type="text" 
                placeholder="Current Location" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent border-none focus:ring-0 w-full text-sm text-gray-700 outline-none"
              />
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl md:rounded-full font-bold text-xs shadow-md transition duration-200 active:scale-95">
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* Category Selection */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-headline-lg text-gray-900">By Category</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {localCategories.map((cat) => (
            <button 
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex flex-col items-center gap-2 min-w-[110px] p-4 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition active:scale-95 group ${
                activeCategory === cat.name ? 'border-orange-500 bg-orange-50/20' : ''
              }`}
            >
              <span className={`material-symbols-outlined text-[32px] group-hover:text-orange-500 transition-colors ${
                activeCategory === cat.name ? 'text-orange-500' : 'text-gray-600'
              }`}>
                {cat.icon}
              </span>
              <span className={`text-xs font-bold transition-colors ${
                activeCategory === cat.name ? 'text-orange-500' : 'text-gray-500'
              }`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Partners Bento Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Featured Partners</h2>
            <p className="text-xs text-gray-500 mt-1">Exclusive rewards at these premium locations.</p>
          </div>
          <button className="text-orange-500 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Large Card */}
          <div className="md:col-span-2 md:row-span-2 relative rounded-[32px] overflow-hidden shadow-md group min-h-[360px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 style={{ backgroundImage: `url('${featuredPartners[0].image}')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />
            <div className="p-8 z-20 text-white space-y-3">
              <span className="bg-orange-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block shadow">
                {featuredPartners[0].tag}
              </span>
              <h3 className="text-2xl font-bold leading-tight">{featuredPartners[0].name}</h3>
              <p className="text-sm opacity-90">{featuredPartners[0].desc}</p>
              <div className="flex gap-2 pt-2">
                <Link href={`/merchants/${featuredPartners[0].id}`} className="bg-white text-orange-600 px-5 py-2 rounded-full font-bold text-xs hover:bg-orange-50 transition active:scale-95">
                  Book Table
                </Link>
                <Link href={`/merchants/${featuredPartners[0].id}`} className="bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-full font-bold text-xs border border-white/20">
                  View Menu
                </Link>
              </div>
            </div>
          </div>

          {/* Medium Card */}
          <div className="md:col-span-2 relative rounded-[32px] overflow-hidden shadow-md group min-h-[200px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                 style={{ backgroundImage: `url('${featuredPartners[1].image}')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            <div className="p-6 z-20 text-white space-y-1">
              <h3 className="text-xl font-bold">{featuredPartners[1].name}</h3>
              <p className="text-xs opacity-90">{featuredPartners[1].desc}</p>
            </div>
          </div>

          {/* Small Feature 1 */}
          <div className="relative rounded-[32px] overflow-hidden shadow-sm group bg-white border border-gray-100 flex flex-col min-h-[220px]">
            <div className="h-1/2 bg-cover bg-center" style={{ backgroundImage: `url('${featuredPartners[2].image}')` }} />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-800">{featuredPartners[2].name}</h3>
                <p className="text-[10px] text-gray-400 font-bold">{featuredPartners[2].category}</p>
              </div>
              <div className="flex items-center justify-between text-orange-500 font-bold text-xs mt-2">
                <span>{featuredPartners[2].rating}</span>
                <span className="material-symbols-outlined text-sm">star</span>
              </div>
            </div>
          </div>

          {/* Small Feature 2 (Refer Card) */}
          <div className="relative rounded-[32px] overflow-hidden bg-neutral-900 p-6 flex flex-col justify-between text-white min-h-[220px] shadow-sm">
            <div className="space-y-2">
              <span className="material-symbols-outlined text-orange-500 text-3xl">celebration</span>
              <h3 className="font-bold text-base leading-snug">Join the Club</h3>
              <p className="text-[11px] opacity-80 leading-relaxed">Refer a friend to a local spot and get £50 reward credit.</p>
            </div>
            <Link href="/refer" className="bg-white text-neutral-900 w-full py-2 rounded-full font-bold text-[10px] text-center shadow hover:bg-gray-100 transition active:scale-95 block">
              Refer Now
            </Link>
          </div>
        </div>
      </section>

      {/* Around the Corner Map Layer */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-gray-50 rounded-[40px] p-8 md:p-12 border border-gray-100">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold font-headline-lg text-gray-900">Around the Corner</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Showing top-rated spots within 2 miles of your current location in Downtown.
          </p>

          <div className="space-y-3 pt-2">
            {aroundCornerList.map((spot) => (
              <div key={spot.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                  {spot.id}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{spot.name}</h4>
                  <p className="text-[11px] text-gray-400 font-medium">{spot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Mock Visual */}
        <div className="lg:col-span-2 h-[400px] rounded-[32px] overflow-hidden shadow-inner relative border border-gray-200">
          <div className="absolute inset-0 bg-cover bg-center" 
               style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBjpsChJ55Xx-7FW0B1FDFT85QInngxygGNohugb3iK9SPux0ZS4Gbf30DCFfC96pM4IDG-sozq_YYH_0snS_OcagNo_GaS0aaRkj1zXNbbSI10cadC9tkTtf4OS2NgEtAU5w_YaMCZWVBt3UNHvoMVFydFOlS0JV0v7ygm0VPDrBPaF3wvxQ4Cwaj8X6CCEXt4zobBJl_jk-NDzboWlBD_zWdJW-0vc2M2-M0vjuUNopXfhQOrp-Gb5AOP_TbZovuLZzIq0yU4n7Fs')` }} />
          <div className="absolute inset-0 pointer-events-none bg-black/5" />
          
          {/* Custom Map Markers */}
          {aroundCornerList.map((spot) => (
            <div 
              key={spot.id} 
              style={{ top: spot.y, left: spot.x }}
              className="absolute group cursor-pointer -translate-x-1/2 -translate-y-1/2"
            >
              <div className="bg-orange-500 text-white p-2.5 rounded-full shadow-lg scale-100 hover:scale-115 transition-transform flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">{spot.icon}</span>
                <span className="text-[9px] font-bold pr-0.5">{spot.id}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular & Trending Horizontal Carousel */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Popular & Trending</h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-orange-500 hover:text-white transition-colors active:scale-95 shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-orange-500 hover:text-white transition-colors active:scale-95 shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
          {popularTrending.map((item) => (
            <div key={item.id} className="min-w-[280px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="h-40 bg-cover bg-center bg-gray-50" style={{ backgroundImage: `url('${item.image}')` }} />
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-gray-800">{item.name}</h3>
                  <span className="text-gray-400 font-bold text-xs">{item.price}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                    {item.tag}
                  </span>
                  <span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider">
                    {item.reward}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fresh on MCOM (New Arrivals) */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Fresh on MCOM</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newArrivals.map((item) => (
            <div key={item.id} className="flex gap-4 group cursor-pointer bg-white p-4 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-1/3 aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                     style={{ backgroundImage: `url('${item.image}')` }} />
              </div>
              <div className="w-2/3 flex flex-col justify-center space-y-2">
                <span className="text-orange-500 text-[9px] font-bold uppercase tracking-wider">
                  {item.status}
                </span>
                <h3 className="text-lg font-bold text-gray-850 leading-snug">{item.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{item.desc}</p>
                <div className="flex items-center gap-1 text-gray-400 text-[10px] pt-1">
                  <span className="material-symbols-outlined text-[12px]">{item.icon}</span>
                  <span className="font-bold">{item.meta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
