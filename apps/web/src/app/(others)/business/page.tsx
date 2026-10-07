"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGetTiers } from '@/services/tiers/hook';

const benefits = [
  {
    icon: "redeem",
    title: "Reward Customers",
    desc: "Deploy sophisticated point systems and instant rewards that keep your brand top-of-mind at every touchpoint.",
    size: "col-span-1 md:col-span-8",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNkU3g6i1fdH23HWMnVsjvr1U-JPF14UbNB1J5el3ssH9KLKnUuIwG53IJiERIRIeh8cYac3PQCB8OPGD2399AiMDHOfkrQsuNEZrKj8e-NCIIvEpqmlZOAr_kvsR0z7akn0iXf9p1aP1TDP9zrZCB46coIEzz1MpRt2Q-xcAfFScwsPlB1cyrAJO2eI6CLNfnmFE53m7Fo6EXk2gQuLUEcpfF1lgIeKSsjX-Yo4kuUzO4ZAicRODSSYn96o_hC6ZDoKOyk_2KpH_9"
  },
  {
    icon: "loyalty",
    title: "Build Loyalty",
    desc: "Create emotional connections through personalized experiences and exclusive membership access.",
    size: "col-span-1 md:col-span-4 bg-amber-500/10 border border-amber-500/20 text-neutral-900",
    iconColor: "text-orange-500"
  },
  {
    icon: "campaign",
    title: "Run Campaigns",
    desc: "Automated marketing tools to trigger the right offer at the perfect moment for maximum ROI.",
    size: "col-span-1 md:col-span-4"
  },
  {
    icon: "trending_up",
    title: "Increase Sales",
    desc: "Data-backed strategies proven to increase average order value and purchase frequency by up to 40%.",
    size: "col-span-1 md:col-span-4"
  },
  {
    icon: "groups",
    title: "Join Events",
    desc: "Exclusive networking with other top-tier merchant partners in the MCOM ecosystem.",
    size: "col-span-1 md:col-span-4 bg-neutral-900 text-white",
    btn: true
  }
];

const TIER_STYLES = [
  { color: "text-amber-700", cta: "Get Started" },
  { color: "text-slate-500", cta: "Select Tier" },
  { color: "text-amber-500", cta: "Go Gold" },
  { color: "text-orange-600", cta: "Go Platinum" },
  { color: "text-indigo-600", cta: "Contact Sales" },
  { color: "text-violet-600", cta: "Contact Sales" },
];

export default function ForBusinesses() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const { data: tiersData, isLoading: tiersLoading, isError: tiersError } = useGetTiers();
  const tiers = tiersData ?? [];

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-12 space-y-24">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 text-center space-y-6">
        <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 font-bold text-xs tracking-wider uppercase">
          LOYALTY REIMAGINED
        </span>
        <h1 className="text-4xl md:text-6xl font-bold font-headline-lg leading-tight tracking-tight text-gray-900 max-w-4xl mx-auto">
          Turn Customers Into <br/>
          <span className="text-orange-500 italic font-medium">Loyal Fans</span>
        </h1>
        <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          The premium rewards ecosystem designed for sophisticated businesses. Build deep relationships through data-driven discovery and elite loyalty tiers.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link href="/business/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
            Start Growing
          </Link>
          <button className="border-2 border-gray-300 text-gray-700 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all">
            View Demo
          </button>
        </div>
      </section>

      {/* Enterprise Benefits Bento Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-headline-lg text-gray-900">Unmatched Enterprise Benefits</h2>
          <p className="text-sm text-gray-500">The tools you need to dominate your market category.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between ${benefit.size} bg-white hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center ${benefit.iconColor || 'text-orange-500'}`}>
                  <span className="material-symbols-outlined text-2xl">{benefit.icon}</span>
                </div>
                <h3 className="text-xl font-bold">{benefit.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-md">{benefit.desc}</p>
              </div>

              {benefit.image && (
                <div className="mt-6 rounded-2xl overflow-hidden aspect-[21/10] md:aspect-[21/9] border border-gray-100">
                  <img className="w-full h-full object-cover" src={benefit.image} alt={benefit.title} />
                </div>
              )}

              {benefit.btn && (
                <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-full font-bold text-xs active:scale-95 transition-all">
                  Learn More
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / Memberships */}
      <section className="max-w-7xl mx-auto px-6 space-y-8" id="memberships">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold font-headline-lg text-gray-900">Enterprise Tiers</h2>
          <p className="text-sm text-gray-500">Scalable solutions from boutique shops to global chains.</p>
          
          {/* Monthly / Annual Billing Toggle */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-gray-800' : 'text-gray-400'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
              className="w-12 h-6 bg-orange-500 rounded-full p-0.5 transition-all flex items-center justify-start relative focus:outline-none"
            >
              <motion.div 
                layout 
                className="w-5 h-5 bg-white rounded-full shadow-md" 
                animate={{ x: billingCycle === 'annually' ? 24 : 0 }}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'annually' ? 'text-gray-800' : 'text-gray-400'}`}>
              Annually <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[9px] font-bold">Save ~20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 pt-6 items-stretch">
          {tiersLoading ? (
            <p className="text-sm text-gray-500">Loading plans…</p>
          ) : tiersError || tiers.length === 0 ? (
            <p className="text-sm text-gray-500">Plans are currently unavailable. Please contact sales.</p>
          ) : tiers.map((tier, i) => {
            const monthly = Number(tier.monthlyPrice ?? 0);
            const annual = Number(tier.annualPrice ?? 0);
            const price = billingCycle === 'monthly' ? monthly : annual;
            const style = TIER_STYLES[i % TIER_STYLES.length];
            const popular = tier.name.toLowerCase().includes('gold');

            return (
              <div
                key={tier.id}
                className={`p-6 rounded-[28px] border flex flex-col justify-between shadow-sm transition-all duration-300 relative bg-white ${
                  popular ? 'border-orange-500 ring-2 ring-orange-500/20 scale-102' : 'border-gray-200'
                }`}
              >
                {popular && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="space-y-1 mb-6">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${style.color}`}>
                      {tier.name}
                    </span>
                    <h3 className="text-2xl font-bold font-headline-lg">
                      {price > 0 ? `£${Number(price).toLocaleString()}` : 'Free'}
                      {price > 0 && <span className="text-[10px] text-gray-400 font-medium">/mo</span>}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 mb-8">
                    {(tier.features ?? []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs">
                        <span className="material-symbols-outlined text-orange-500 text-sm shrink-0">check_circle</span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/business/signup"
                  className={`w-full py-2.5 rounded-full font-bold text-xs text-center border transition-all active:scale-95 block ${
                    popular
                      ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/10'
                      : 'border-orange-500 text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  {style.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-6">
        <div className="p-8 md:p-12 bg-neutral-900 rounded-[40px] text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-bold font-headline-lg">Ready to build your kingdom?</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Setup your program and reward your first customer today.
          </p>
          <Link href="/business/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-xs shadow-md shadow-orange-500/10 inline-block transition active:scale-95">
            Start Your Free Trial
          </Link>
        </div>
      </section>

    </div>
  );
}
