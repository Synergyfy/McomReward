"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetPublicCampaigns } from '@/services/customer-campaigns/hook';

const tiers = [
  { name: 'Bronze', color: 'text-[#CD7F32]', bg: 'bg-[#CD7F32]/10', benefits: 'Standard rewards access. Scan to earn.' },
  { name: 'Silver', color: 'text-slate-500', bg: 'bg-slate-300/30', benefits: '5% Bonus Points. Member support queue.' },
  { name: 'Gold', color: 'text-amber-500', bg: 'bg-amber-400/20', benefits: '10% Bonus. Exclusive local partner access.' },
  { name: 'Platinum', color: 'text-orange-500', bg: 'bg-orange-500/10', benefits: 'VIP early event access. Custom brand details.' },
];

export default function Homepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: campaignsData } = useGetPublicCampaigns(1, 12);

  const campaigns = useMemo(() => campaignsData?.data ?? [], [campaignsData]);



  const heroSlides = useMemo(() => {
    const withBanner = campaigns.filter((c) => c.bannerUrl).slice(0, 5);
    if (withBanner.length === 0) return [];
    return withBanner.map((c) => ({
      title: c.name,
      description: c.campaignMessage || c.business?.name || '',
      image: c.bannerUrl,
      campaignId: c.id,
    }));
  }, [campaigns]);

  const spotlight = useMemo(() => campaigns.slice(0, 2), [campaigns]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (heroSlides.length === 0 ? 0 : (prev + 1) % heroSlides.length));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (heroSlides.length === 0 ? 0 : (prev - 1 + heroSlides.length) % heroSlides.length));
  };

  return (
    <div className="bg-surface-bright text-on-surface font-body-md overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="pt-3 pb-12 md:py-20 max-w-7xl mx-auto px-6">
        
        {/* Desktop Split Layout (lg and up) */}
        <div className="hidden lg:grid grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-600 rounded-full text-sm font-semibold tracking-tight">
              New Discovery Engine
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold font-headline-lg leading-tight tracking-tight text-gray-900">
              Earn More From The <span className="text-orange-500">Brands & Businesses</span> You Already Use
            </h1>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Get rewards, gift cards, loyalty points, cashback, and exclusive local offers seamlessly delivered to your MCOM wallet.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/customer"
                className="px-8 py-3.5 bg-orange-500 text-white font-bold rounded-full shadow-lg shadow-orange-500/20 hover:shadow-xl hover:bg-orange-600 transition duration-200 active:scale-95 text-center"
              >
                Join Free
              </Link>
              <Link
                href="/reward"
                className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition duration-200 active:scale-95 text-center"
              >
                Explore Rewards
              </Link>
              <Link
                href="/business"
                className="flex items-center justify-center text-orange-600 hover:text-orange-700 font-bold px-4 hover:underline py-3.5 text-center"
              >
                For Businesses →
              </Link>
            </div>
          </div>

          {/* Desktop Right Panel (Bento) */}
          <div className="relative h-[480px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-6 w-full max-w-md transform -rotate-3">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_10px_35px_rgba(0,0,0,0.05)] flex flex-col justify-between h-40 group"
                >
                  <span className="material-symbols-outlined text-4xl text-orange-500">wallet</span>
                  <div>
                    <h4 className="font-bold text-gray-800">Digital Wallet</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Points and rewards in one place</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-orange-500 text-white p-6 rounded-2xl shadow-lg shadow-orange-500/10 flex flex-col justify-between h-40 translate-y-6"
                >
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <div>
                    <h4 className="font-bold">Premium Club</h4>
                    <p className="text-xs opacity-80 mt-0.5">Unlock higher tiers as you earn</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="col-span-2 bg-gray-50 border border-gray-100 p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex items-center gap-4 h-28"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100">
                    <span className="material-symbols-outlined text-orange-500">card_giftcard</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Active Rewards</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Redeem points for partner rewards</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Full-Card Image Slider (lg:hidden) */}
        {heroSlides.length > 0 && (
        <div className="lg:hidden w-full relative min-h-[580px] rounded-[32px] overflow-hidden shadow-lg border border-gray-100 flex flex-col justify-between p-6 md:p-10 group">
          
          {/* Background Sliding Images */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <img 
                  src={heroSlides[currentSlide].image} 
                  alt={heroSlides[currentSlide].title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {/* Dark contrast gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
          </div>

          {/* Top content overlay */}
          <div className="relative z-10 space-y-4">
            <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold tracking-wider uppercase">
              New Discovery Engine
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-headline-lg leading-tight text-white">
              Earn More From The <span className="text-orange-400">Brands & Businesses</span> You Already Use
            </h1>
          </div>

          {/* Bottom actions & slide progress */}
          <div className="relative z-10 space-y-6 pt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/customer"
                className="px-6 py-3 bg-orange-500 text-white font-bold rounded-full text-xs text-center shadow shadow-orange-500/20 active:scale-95 transition-transform"
              >
                Join Free
              </Link>
              <Link
                href="/reward"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-full text-xs text-center backdrop-blur-md active:scale-95 transition-transform"
              >
                Explore Rewards
              </Link>
              <Link
                href="/business"
                className="text-orange-400 hover:text-orange-300 font-bold py-2 text-xs text-center active:scale-95"
              >
                For Businesses →
              </Link>
            </div>

            {/* Pagination dots & index */}
            <div className="flex justify-between items-center border-t border-white/10 pt-4 text-white/60">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                {heroSlides[currentSlide].title}
              </span>
              <div className="flex gap-1.5 items-center">
                {heroSlides.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentSlide ? 'bg-orange-500 w-3' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-[45%] -translate-y-1/2 w-9 h-9 bg-black/35 hover:bg-black/50 active:scale-90 border border-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center transition z-20 cursor-pointer"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-[45%] -translate-y-1/2 w-9 h-9 bg-black/35 hover:bg-black/50 active:scale-90 border border-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center transition z-20 cursor-pointer"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>

        </div>
        )}
      </section>




      {/* Discovery Hub (Featured Spotlights & Category Bento) */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-headline-lg text-gray-900">Discovery Hub</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Exclusive local perks and trending global rewards.</p>
          </div>
          <Link href="/reward" className="text-orange-500 font-bold hover:underline flex items-center gap-1 text-xs md:text-sm w-fit pt-1 md:pt-0">
            View All Marketplace <span className="material-symbols-outlined text-xs md:text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Featured Local Spotlight Carousel */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {spotlight.length === 0 ? (
              <p className="text-sm text-gray-500">No live campaigns yet — check back soon.</p>
            ) : spotlight.map((biz) => (
              <motion.div
                key={biz.id}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-3xl h-[380px] shadow-sm border border-gray-100/60"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                {biz.bannerUrl && (
                  <img
                    className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-all duration-500"
                    src={biz.bannerUrl}
                    alt={biz.name}
                  />
                )}
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full text-white space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-orange-400">location_on</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">{biz.business?.name ?? 'Local business'}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{biz.name}</h3>
                  <p className="text-sm opacity-90 line-clamp-2">{biz.campaignMessage}</p>
                  <div className="pt-3 flex gap-2">
                    <Link
                      href={`/merchants/${biz.id}`}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-1.5 rounded-full text-xs font-bold transition duration-200"
                    >
                      View Offer
                    </Link>
                    <Link
                      href={`/merchants/${biz.id}`}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-1.5 rounded-full text-xs font-semibold"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reward Types Cards Bento */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-orange-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">15% MAX</span>
              </div>
              <div>
                <h4 className="font-bold text-orange-800 text-lg">Cashback</h4>
                <p className="text-xs text-orange-600 mt-1">Earn digital credit back on everyday retail purchases.</p>
              </div>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-orange-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">LOYALTY</span>
              </div>
              <div>
                <h4 className="font-bold text-orange-800 text-lg">Loyalty Rewards</h4>
                <p className="text-xs text-orange-600 mt-1">Unlock stamps, custom merchant tiers, and lifestyle awards.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Journey */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-orange-500 font-bold text-xs tracking-widest uppercase bg-orange-50 px-3 py-1 rounded-full inline-block mb-3">
            5 Simple Steps
          </span>
          <h2 className="text-3xl font-bold font-headline-lg text-gray-900">The MCOM Journey</h2>
          <p className="text-xs text-gray-400 mt-2 md:hidden">Swipe across to explore the steps</p>
        </div>

        <div className="relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-8 left-10 right-10 h-[2px] bg-gradient-to-r from-orange-400 via-orange-200 to-gray-200 -z-10" />

          {/* Steps container: Horizontal snap-scroll on mobile, 5-column grid on desktop */}
          <div className="flex md:grid md:grid-cols-5 gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 pt-1 -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible">
            {[
              { step: 'Join', num: '01', icon: 'person_add', desc: 'Create your free digital profile.' },
              { step: 'Earn', num: '02', icon: 'shopping_cart', desc: 'Shop at partner brands.' },
              { step: 'Collect', num: '03', icon: 'account_balance_wallet', desc: 'Amass points in your wallet.' },
              { step: 'Redeem', num: '04', icon: 'redeem', desc: 'Swap points for vouchers.' },
              { step: 'Enjoy', num: '05', icon: 'celebration', desc: 'Experience the real value.' },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="snap-start shrink-0 w-[200px] sm:w-[220px] md:w-auto p-4 md:p-0 rounded-2xl md:rounded-none bg-white md:bg-transparent border border-gray-100 md:border-none shadow-sm md:shadow-none flex flex-col items-center text-center group transition-all duration-300"
              >
                <div className="relative mb-3 md:mb-4">
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-full flex items-center justify-center shadow-sm border-2 transition-transform duration-300 group-hover:scale-105 ${
                      idx === 0
                        ? 'bg-orange-500 text-white border-orange-500 shadow-orange-500/20'
                        : 'bg-orange-50/50 md:bg-white text-orange-500 border-orange-200 md:border-orange-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px] md:text-[26px]">{item.icon}</span>
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 md:hidden bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                    {item.num}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="hidden md:inline-block text-[11px] font-black text-orange-500/70 tracking-wider">
                    {item.num}.
                  </span>
                  <h5 className="font-bold text-gray-800 text-base">{item.step}</h5>
                </div>
                <p className="text-xs text-gray-400 mt-1 max-w-[150px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business Benefits Integration */}
        <div className="mt-16 p-8 bg-orange-500/5 rounded-3xl border border-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md shadow-orange-500/10">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-lg">Are you a Business? Get Discovered.</h4>
              <p className="text-sm text-gray-500 mt-0.5">Reach local customers, run stamp campaigns, and boost sales loyalty.</p>
            </div>
          </div>
          <Link
            href="/business"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md shadow-orange-500/10 active:scale-95 transition-all text-center whitespace-nowrap"
          >
            Join As A Business
          </Link>
        </div>
      </section>

      {/* Membership Tiers Comparison */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline-lg text-gray-900">Unlock Tier Status</h2>
            <p className="text-gray-500 mt-1">Unlock larger benefits as you engage with the loyalty community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-6 rounded-2xl border border-gray-200/60 bg-white flex flex-col items-center text-center shadow-sm ${
                  tier.name === 'Gold' ? 'border-2 border-orange-500 scale-105 shadow-md relative' : ''
                }`}
              >
                {tier.name === 'Gold' && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
                    POPULAR
                  </span>
                )}
                <div className={`w-12 h-12 rounded-full ${tier.bg} flex items-center justify-center mb-4`}>
                  <span className={`material-symbols-outlined ${tier.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    workspace_premium
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-1">{tier.name}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{tier.benefits}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Play & Win & Events Bento Grid */}
      <section className="py-16 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Play & Win games summary */}
        <div className="rounded-3xl bg-neutral-900 text-white p-8 flex flex-col justify-between h-[320px] group relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-3 relative z-10">
            <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full">
              MCOM PLAY
            </span>
            <h3 className="text-3xl font-bold font-headline-lg">Play & Win Rewards</h3>
            <p className="text-sm opacity-70 max-w-sm">
              Spin the Wheel, Peg-Drop (Ball Drop Pegs), or try custom Scratch Cards to unlock daily points.
            </p>
          </div>
          <Link
            href="/play-win"
            className="w-fit bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-md transition duration-200"
          >
            Play Games Now
          </Link>
        </div>

        {/* Expo events teaser */}
        <div className="rounded-3xl border border-gray-200/80 p-8 flex flex-col justify-between h-[320px] group hover:bg-gray-50 transition-colors shadow-sm bg-white">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
              UPCOMING EXPONENTIAL
            </span>
            <h3 className="text-3xl font-bold font-headline-lg text-gray-900">MCOM Rewards Expo</h3>
            <p className="text-sm text-gray-500">
              Gather with local businesses. Complete offline quests, claim ticket rewards, and network.
            </p>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex -space-x-2 text-xs font-bold text-white">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-500 flex items-center justify-center text-[10px]">
                +
              </div>
            </div>
            <Link
              href="/events"
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200 active:scale-95"
            >
              →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
