"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const bentoItems = [
  {
    title: "The Unified Wallet",
    desc: "One balance for your entire life. Earn at local merchants, spend at international brands, and unlock tiered privileges that grow with you.",
    bullets: ["Real-time point accrual", "Instant redemption at checkout"],
    size: "col-span-12 lg:col-span-8",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKJKQBZRKdKpUGChuFny8gSopJC5DVykpQ7KWUlfy7pH8BaGk4s02joWkEtMOrrz0dqRDsmb3MAo_k_Am2TYRFN27CNrFb48QKSewfUoZsUZhei5cOSwdtde6T6o3LW1S433UabwzogZvbsQg7THjqLpc-abyY-qFKLftEub31SKgiakafs0NADwOsU1FCLWn4kMn4_oiBlzxxEcugKSjVhaMq0Xb0Y5T_5MfgYdBcMx3vhdQvF8EUiO-RTK8NTJcetDVTGVZzwhtP"
  },
  {
    title: "Lifestyle Perks",
    desc: "Exclusive access to airport lounges, concierge services, and VIP event invitations.",
    size: "col-span-12 md:col-span-6 lg:col-span-4 bg-orange-500/10 border border-orange-500/20 text-orange-800",
    icon: "redeem"
  },
  {
    title: "Smart Analytics",
    desc: "AI-driven insights that suggest the best ways to maximize your rewards based on spending habits.",
    size: "col-span-12 md:col-span-6 lg:col-span-4 bg-amber-500/10 border border-amber-500/20 text-amber-900",
    icon: "auto_graph"
  },
  {
    title: "Premium Retail Network",
    desc: "Access over 500+ luxury brands and curated boutiques across the MCOM network.",
    size: "col-span-12 lg:col-span-8",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD_SWFKEOUYjZf_yy0cM9LVyFbZW6EXjGnBu9DSYkVJ1DecZ1QjiOvhUkSqdXx3tscm1IRE5cxelUx8GM1nHPxtcg4bELoRExlneHyPWHX6pDFz2IlfiVt1ABVILq380_LPjLMN7L_t-qRVSyWRkRy61hBtOzT0SK4g4afz9M-GvyBatQDkwrMHF7yKjtwAptnTi7OfbId63foSbWZihqG_1HPMUN4hjme5WeoWMh2LIC1zW-cAM_iyxmikMQWR-FiajQemPjlM81M"
  }
];

export default function AboutMCOM() {
  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-12 max-w-7xl mx-auto px-6 space-y-24">
      
      {/* Hero Section */}
      <section className="relative rounded-[40px] overflow-hidden bg-neutral-900 text-white min-h-[500px] flex items-center p-8 md:p-16 shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider shadow">
            THE LOYALTY EVOLUTION
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-headline-lg leading-tight tracking-tight">
            Elevating Every Transaction into a Journey.
          </h1>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed">
            MCOM Rewards isn't just a program—it's a premium lifestyle ecosystem designed to bridge the gap between digital discovery and tangible value.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/reward" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-xs shadow shadow-orange-500/10 active:scale-95 transition-all">
              Explore Rewards
            </Link>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3.5 rounded-full font-bold text-xs border border-white/25 active:scale-95 transition-all">
              Watch Story
            </button>
          </div>
        </div>
      </section>

      {/* Beyond Simple Points Bento Section */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-headline-lg text-gray-900">Beyond Simple Points</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            We've reimagined loyalty as a fluid experience. Whether you're shopping at the Mall, testing your luck at MCOMSpin, or visiting the Expo, your rewards follow you seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {bentoItems.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-3xl p-8 border border-gray-100 flex flex-col md:flex-row gap-6 justify-between overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${item.size}`}
            >
              <div className="flex-1 flex flex-col justify-center space-y-4">
                {item.icon && (
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  </div>
                )}
                <h3 className="text-xl font-bold font-headline-lg text-gray-800">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                {item.bullets && (
                  <ul className="space-y-2 pt-2">
                    {item.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-semibold">
                        <span className="material-symbols-outlined text-orange-500 text-sm">check_circle</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {item.image && (
                <div className="flex-1 rounded-2xl overflow-hidden min-h-[220px] relative border border-gray-50 shrink-0">
                  <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* How it Works flow */}
      <section className="bg-gray-50 border border-gray-100 rounded-[40px] py-16 px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-headline-lg text-gray-900">How it Works</h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">Three steps to a more rewarding life. Simple to start, powerful to grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { step: "01", name: "Connect", desc: "Link your accounts across the MCOM ecosystem effortlessly." },
            { step: "02", name: "Engage", desc: "Shop at the Mall, spin at MCOMSpin, or visit the Expo to earn points." },
            { step: "03", name: "Redeem", desc: "Swap accumulated points for premium vouchers or luxury travel credits." }
          ].map((flow, index) => (
            <div key={index} className="space-y-4 group">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-orange-500 mx-auto flex items-center justify-center group-hover:bg-orange-500 group-hover:border-solid transition-all duration-300">
                <span className="text-xl font-bold text-orange-500 group-hover:text-white">{flow.step}</span>
              </div>
              <h4 className="font-bold text-base text-gray-800">{flow.name}</h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mx-auto">{flow.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
