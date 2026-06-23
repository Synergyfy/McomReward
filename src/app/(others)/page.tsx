"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const brands = [
  { name: 'Amazon', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAivVTAvQ1_GqV_dr7iW0m79Y-BR1t2kkFUSb0eXobTt9hRXBs2F0hu_cR1cevnqxLNEkD1xldkNUYXyOxt69siXh3KL_mg0f040kONjnLPSJYTYU3oJF-H_Gf2pyO4olyJM7sYUn0qYBQcHgRRiBtGcOBKgUCX77T2P0_0HfnJZSWEJxE5U44nXBnXRsYHiT-dRmON8u4GNXaUsc_QRq7ZLoESmZiR0hJabV_d-iGF_2nyinNDQZj4yrblpEQZzmVTTb31wlWPYu1b', category: 'Retail & Tech' },
  { name: 'Uber', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJZWmbKDgtapuXSFwPnJic0N42gteMRNnsyxKs8gvtgE2pk6XbeHhOBymnw4YG9loBurwA7qu81PtvkFhvsDEd0pzhLIzbmKuLDHOsWUc33h_r9qs75SFb588DURbd5eeW67_2GawGjhR4Iar7ujXQYLI1qY1XUQRMC7DBf1rXsMR8jszfxrWhbETFPX5DO9HVDm-tWw14V48R0J6YoEysJRNqKo-0kBY4Ax8nB2Jlz-fARySvr8phhFI7toYfjYd9iBfrmaqSdu0l', category: 'Travel & Mobility' },
  { name: 'Netflix', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoGqlIRuED0GO8fjmsjsbbcxBRIw57gBdUCqsoTV7YMizjczo-bpemEaPCcEqCdZ-WWBaj4rqOwiYfsVDTkkGizzh9_6qiTRxeKpOZb_qbDeqg5x92Ne6BVyZ6G7gri_u2DBt-b7-pjKQYUDviMGvLO3-NHhKZMDzkDNNWLxFwJxNM0WRG_h5pXgWgT7GdFZQ5BXYJT56ChhOflZd6C4GUjffodGZ5lVDla-Xa1vZ1jpGlDmsAUD9666IZefXkUAebhNsxibabZyiG', category: 'Entertainment' },
  { name: 'Nike', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp48G7lQWvtSKokkqAHV9R8g_aF-TpcLs-7aeg19j2d98-vN5oevc-DSJcPzQ-dhvcooatfVWwiNfJ6dJrUmFFX27T0XApn_1wadHTta5se4Tf4dSzQbsw-lTexbvOdzwgws111mGjrEvKwGHRuZR5h_qXB6BECqRUISS_reOSUic6c903RroU19xddOoz5uArE_9tFhFw5S7rnQsGsOt_BDk_zwTEO3mS-YH7TSbs2KeCeofnayROJijGQFnNzXViFPunR2g74EmD', category: 'Apparel' },
  { name: 'Starbucks', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdkmAd7VVkI6d-BJeXPo_t8uBGn7gBj294OFMvuRMFSg5p2R7Dg2yg1Xv5I7MwHfQNZz24rbU-VA-tEztYWdYvw-ydWeHm84gEy4Aj_oW1ZisZn_wD2-zbmsZXYjwT7tuF9bYqnvGy6xZ-GDev8_h81I22CYq5TMvKoJ6My797vdXP-3-m48RhhnAUKIrdXY_rIAt8QpphqWupMutcIfFilORPTyNeVrN-q0Ne246KfoaeuZl7FLxLHwBLhwAGouxc8W62xamOUPvy', category: 'Dining & Cafe' }
];

const localBusinesses = [
  {
    name: "Toby Barbers",
    offer: "20% Off Haircut + 50 Loyalty Points",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfH0L5CMIhdwctxa8KLvdIXkl_iq37VwWoRXA-D46LZBtiql6fFU5vMkNhEua7E6IhssskTmXI9ZRs-iD6cGIVv-JEyXWTAl6BZVtk_b0T0408dD9GdjXW94GS0GprthtojA1aBQUn0TQEYz6FIICqnjihlF1KxBITYHxwenEsRwRKt9lYwApGDWFcR32BjSol9-zRbykz7Ou7XlKFsca0wt1s6A2AGS6iU7sf4JErTJ1tSnnZ1AyTaQSi_6uHw7OdNU1MuYgl64lD",
    location: "London SE16",
    id: "toby-barbers"
  },
  {
    name: "Artisan Coffee House",
    offer: "Free Pastry on 5th Coffee stamp",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYl5SedD4uSItVrNNXxIHvMIulMZhx6vIYYXTkWRav22aO_PEiYVK_ryI-IIuz5XHhu_tYnba_OPT5LzyBT9lK0TjvpwwFtPu6ViSIPhzxmerHj1qhITuttbtqhauL72G4m3d6aIcHun0oDqlcUikStuS36Ke5uWhg9Kf-l-BpLF83cYTHcjHRH8EeW_VgL557iTqAP_MouvWqCkZL3ivIpVLg1t1b8g47mltRWRryxl9sxJ-1Ny3GwvQBn382kH_Bro-wG2KjXwXZ",
    location: "Borough Market",
    id: "artisan-coffee-house"
  }
];

const giftCards = [
  { category: 'Retail', range: '£10 - £100', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPq7W6DDKBMh_GdxHsdhMuC84VQWTc2Cw0uIML6E0vhUH7VlYDs0dO9IRpQap41fJR4ga0R2MXJOf0lbB8PxEhhbwodFcFguvFgDCVGAcL1Jj70nJTNxAG8khr28U3Bvx1QZVj_7buaSqowoX6mbGq4lwyDtqor1LuVtC8HdtwTpJoPMJU7dS2OkwIOe0FFwpexmgnkru1v9CRp4CVR8vScX49uT3CD-iN4t4a9E7y1I6FYF7yoaWs6qdkHm79ub_wryoSwe0h5Rpe' },
  { category: 'Travel', range: '£50 - £250', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMXDXm2IoPig_5DMPB_l5KVjwcWRM3vBJ2KY9dXVo86L8x2TXufLdf6O349IXw50lkfr0a5vdURr9SkNJmdJRsm7H4LFVDViSCLQn6U6O6XEmayIw1HCo3feRujmrXf9Z48WgxKsLUqX08enii1xhGMpbzlfVFArkBqPE5VFWteEbkxUNyAaSKP92xIsjIq1kP2icakT6WDk3-HzovVPGqJblidpsqYiijNPaedLecosnPnFk6rSKlZ309EbjeYNDUwtu6UuZmrBRf' },
  { category: 'Food & Drink', range: '£25 - £150', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYl5SedD4uSItVrNNXxIHvMIulMZhx6vIYYXTkWRav22aO_PEiYVK_ryI-IIuz5XHhu_tYnba_OPT5LzyBT9lK0TjvpwwFtPu6ViSIPhzxmerHj1qhITuttbtqhauL72G4m3d6aIcHun0oDqlcUikStuS36Ke5uWhg9Kf-l-BpLF83cYTHcjHRH8EeW_VgL557iTqAP_MouvWqCkZL3ivIpVLg1t1b8g47mltRWRryxl9sxJ-1Ny3GwvQBn382kH_Bro-wG2KjXwXZ' },
  { category: 'Entertainment', range: '£10 - £50', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWGu5EXBb6MDC-eCMMSvagtYxwpiNpGVJ5D_MLQRyD1-mmfBPSw-li67jFWxT8BDf3qswGhodvKLmLqUEwOZlSDaLSCmoH6_bPp8Hw65Hp08M7xNoApdEUYaaz7F_z27IrJ5v2CJzGcKUhEcnnbzH-QsAsNFSUo12QMhLp6NC5BTBeDJYEywTwK-ZE3QsVtGwvCWrnZNuZO0k1bz-EMZCGvRWhT79ZoxrlgDELHTeFAR1Ixn2boJH38KS_kUCgDVUgJFwvyx_e662U' },
];

const tiers = [
  { name: 'Bronze', color: 'text-[#CD7F32]', bg: 'bg-[#CD7F32]/10', benefits: 'Standard rewards access. Scan to earn.' },
  { name: 'Silver', color: 'text-slate-500', bg: 'bg-slate-300/30', benefits: '5% Bonus Points. Member support queue.' },
  { name: 'Gold', color: 'text-amber-500', bg: 'bg-amber-400/20', benefits: '10% Bonus. Exclusive local partner access.' },
  { name: 'Platinum', color: 'text-orange-500', bg: 'bg-orange-500/10', benefits: 'VIP early event access. Custom brand details.' },
];

const heroSlides = [
  {
    title: "Premium Gift Cards",
    description: "Unlock high-value gift cards from Amazon, Netflix, Nike, and global brands.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPq7W6DDKBMh_GdxHsdhMuC84VQWTc2Cw0uIML6E0vhUH7VlYDs0dO9IRpQap41fJR4ga0R2MXJOf0lbB8PxEhhbwodFcFguvFgDCVGAcL1Jj70nJTNxAG8khr28U3Bvx1QZVj_7buaSqowoX6mbGq4lwyDtqor1LuVtC8HdtwTpJoPMJU7dS2OkwIOe0FFwpexmgnkru1v9CRp4CVR8vScX49uT3CD-iN4t4a9E7y1I6FYF7yoaWs6qdkHm79ub_wryoSwe0h5Rpe",
  },
  {
    title: "Local Stamp Cards",
    description: "Support local favorites like Toby Barbers and collect digital stamps automatically.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfH0L5CMIhdwctxa8KLvdIXkl_iq37VwWoRXA-D46LZBtiql6fFU5vMkNhEua7E6IhssskTmXI9ZRs-iD6cGIVv-JEyXWTAl6BZVtk_b0T0408dD9GdjXW94GS0GprthtojA1aBQUn0TQEYz6FIICqnjihlF1KxBITYHxwenEsRwRKt9lYwApGDWFcR32BjSol9-zRbykz7Ou7XlKFsca0wt1s6A2AGS6iU7sf4JErTJ1tSnnZ1AyTaQSi_6uHw7OdNU1MuYgl64lD",
  },
  {
    title: "Eco Coffee Stamps",
    description: "Earn rewards and redeem exclusive deals at Artisan Coffee Houses.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYl5SedD4uSItVrNNXxIHvMIulMZhx6vIYYXTkWRav22aO_PEiYVK_ryI-IIuz5XHhu_tYnba_OPT5LzyBT9lK0TjvpwwFtPu6ViSIPhzxmerHj1qhITuttbtqhauL72G4m3d6aIcHun0oDqlcUikStuS36Ke5uWhg9Kf-l-BpLF83cYTHcjHRH8EeW_VgL557iTqAP_MouvWqCkZL3ivIpVLg1t1b8g47mltRWRryxl9sxJ-1Ny3GwvQBn382kH_Bro-wG2KjXwXZ",
  },
];

export default function Homepage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
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
                href="/signup"
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
                    <p className="text-xs text-gray-400 mt-0.5">Manage 12+ accounts</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-orange-500 text-white p-6 rounded-2xl shadow-lg shadow-orange-500/10 flex flex-col justify-between h-40 translate-y-6"
                >
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <div>
                    <h4 className="font-bold">Premium Club</h4>
                    <p className="text-xs opacity-80 mt-0.5">Level: Gold Tier</p>
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
                    <p className="text-xs text-gray-500 mt-0.5">4 Gift Cards ready to redeem</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Full-Card Image Slider (lg:hidden) */}
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
                href="/signup"
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
      </section>


      {/* Trusted Brands (AWIN integration & category badging) */}
      <section className="py-12 border-y border-gray-200/60 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Powered by AWIN</span>
            <p className="font-bold text-2xl text-gray-800">Shop Top Trusted Brands</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {brands.map((b) => (
              <div key={b.name} className="flex flex-col items-center gap-2 group cursor-pointer">
                <img
                  className="h-8 md:h-9 object-contain opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                  src={b.logo}
                  alt={b.name}
                />
                <span className="text-[10px] font-bold text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {b.category}
                </span>
              </div>
            ))}
          </div>
        </div>
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
            {localBusinesses.map((biz) => (
              <motion.div
                key={biz.name}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-3xl h-[380px] shadow-sm border border-gray-100/60"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                <img
                  className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-all duration-500"
                  src={biz.image}
                  alt={biz.name}
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full text-white space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-orange-400">location_on</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">{biz.location}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{biz.name}</h3>
                  <p className="text-sm opacity-90">{biz.offer}</p>
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

      {/* Gift Card Exchange Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold font-headline-lg text-gray-900 mb-8">Gift Card Exchange</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {giftCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:translate-y-[-6px] transition-transform duration-300 flex flex-col"
              >
                <div className="h-32 rounded-xl overflow-hidden bg-gray-100 mb-4">
                  <img className="w-full h-full object-cover" src={card.image} alt={card.category} />
                </div>
                <span className="text-xs font-semibold text-gray-400">{card.category}</span>
                <p className="font-bold text-lg text-gray-800 mt-1 mb-3">{card.range}</p>
                <Link
                  href="/gift-cards"
                  className="mt-auto w-full py-2 bg-gray-50 hover:bg-orange-500 hover:text-white rounded-xl text-center text-xs font-bold text-gray-600 transition-colors"
                >
                  Buy / Send
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Journey */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold font-headline-lg text-center text-gray-900 mb-12">The MCOM Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
          
          <div className="hidden md:block absolute top-8 left-0 w-full h-[2px] bg-gray-100 -z-10" />

          {[
            { step: 'Join', icon: 'person_add', desc: 'Create your free digital profile.' },
            { step: 'Earn', icon: 'shopping_cart', desc: 'Shop at partner brands.' },
            { step: 'Collect', icon: 'account_balance_wallet', desc: 'Amass points in your wallet.' },
            { step: 'Redeem', icon: 'redeem', desc: 'Swap points for vouchers.' },
            { step: 'Enjoy', icon: 'celebration', desc: 'Experience the real value.' },
          ].map((item, idx) => (
            <div key={item.step} className="flex flex-col items-center text-center group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm border-2 transition-transform duration-300 group-hover:scale-105 ${
                idx === 0 
                  ? 'bg-orange-500 text-white border-orange-500' 
                  : 'bg-white text-orange-500 border-orange-100'
              }`}>
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              </div>
              <h5 className="font-bold text-gray-800 text-base">{item.step}</h5>
              <p className="text-xs text-gray-400 mt-1 max-w-[150px]">{item.desc}</p>
            </div>
          ))}
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
              Spin the Wheel, Peg-Drop (Ball Drop Pegs), or try custom Scratch Cards to unlock thousands of daily points.
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
              Gather with 500+ local businesses. Complete offline quests, claim ticket rewards, and network.
            </p>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex -space-x-2 text-xs font-bold text-white">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-500 flex items-center justify-center text-[10px]">
                +2k
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
