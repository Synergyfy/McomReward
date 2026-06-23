"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

const tiers = [
  {
    name: "Bronze",
    priceMonthly: 0,
    priceAnnually: 0,
    color: "text-amber-700",
    borderColor: "border-gray-200",
    features: ["Basic Dashboard", "1 Active Campaign", "Merchant Directory Listing", "QR-Code Scanner App Access"],
    cta: "Get Started Free"
  },
  {
    name: "Silver",
    priceMonthly: 99,
    priceAnnually: 79,
    color: "text-slate-500",
    borderColor: "border-gray-200",
    features: ["Advanced Analytics", "5 Active Campaigns", "Email Marketing Automation", "Standard Customer Support"],
    cta: "Select Silver"
  },
  {
    name: "Gold",
    priceMonthly: 299,
    priceAnnually: 239,
    color: "text-amber-500",
    borderColor: "border-orange-500",
    features: ["AI Recommendations", "Unlimited Campaigns", "SMS Notifications integration", "Priority Phone Support", "Multi-location Management"],
    cta: "Go Gold",
    popular: true
  },
  {
    name: "Platinum",
    priceMonthly: 599,
    priceAnnually: 479,
    color: "text-orange-600",
    borderColor: "border-gray-200",
    features: ["Custom Loyalty Branding", "API Webhook Access", "Dedicated Success Manager", "24/7 Premium Support", "Stamp Card Customizer"],
    cta: "Go Platinum"
  },
  {
    name: "Pro",
    priceMonthly: 999,
    priceAnnually: 799,
    color: "text-indigo-600",
    borderColor: "border-gray-200",
    features: ["SSO & IAM Integration", "Custom Smart Contracts", "Unlimited Multi-Brands", "White-labeled Mobile App options"],
    cta: "Go Pro"
  },
  {
    name: "Pro Plus",
    priceMonthly: "Custom",
    priceAnnually: "Custom",
    color: "text-violet-600",
    borderColor: "border-neutral-900 bg-neutral-900 text-white",
    features: ["Full Enterprise SLA", "Bespoke System Integrations", "On-Premise Deployment Support", "Tailored Custom Billing Tiers"],
    cta: "Contact Sales",
    custom: true
  }
];

const testimonials = [
  {
    quote: "MCOM transformed our local boutique into a regional destination. Our customer return rate increased by 65% in just three months.",
    name: "Sarah Jenkins",
    role: "Founder, Velour Studio",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-IfebWh8NMbV6Iv3ad_MNZiwDC15LPzpOydA9IwYfDHWUbUMvPW7H91Vebki_PLFcO8RY-esEFCZrf8ZoukWmBrGjZ-KMz5aPFRy1G50buflkAVHsKcUYRYODCsogutz0sC_r1Y_own64CdLor07QIq0m0kFLqP2JNhWwlxHW0BFptLG1fpy193e2iPoQcqst39TQB68KT22_KQkxVnZpx-Du7tOAP2wEmLAfKY6bDAglJvLam8_N8ydKLyV_KL-FW0pbDnkKmimY"
  },
  {
    quote: "The ROI on the Silver tier was instant. The automated campaigns took hours of work off my plate every week.",
    name: "David Chen",
    role: "Owner, Hearth & Grain",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLeT0EFxNXfrUMdpSjleMQGpbp_Sw2eS4qPCDd4H_vdt5BE-wnnGz3IGJvjDJTjdwqdrsEis8_d8IIDDP4vrd2pITbxvjUFd30qkWtOilIFKJy6GPDfEDTthd_FkW1pPrRgjJiPC98Q9eZk_4T3FKz7MCfYNAE_V6hwdP1vxjy1uhtXH8dJ-U-GLBYQWrZNGT3ppDUit5ykh2_0xOpEGfpeq9npY1rp2Ep5HrMB_Oex8J5oOle5FeK_uyzwKon_XrmVsf41khMc91p"
  },
  {
    quote: "Scaling our enterprise rewards program was seamless with MCOM Pro Plus. Their API integration is best-in-class.",
    name: "Marcus Thorne",
    role: "CTO, Global Retail Corp",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1BNyJ8J-UlQT16bTLdSzYi2SGxy5fdB0hXHPriwttJxGwGWZT9u0LUVktm869v9d5LYgaQAIz4Q_S8prDCYTOL9H2mv3sXaFJE_DHZqY3D01belu9gyKqGkNqjVp64CDsyXSMWnBgrIkkC9h9I3_H937aKwXxOHKU17tg7QrqCeqtCSbHK-gahHZG4Xo4TNej5Xk37PhiM5ZhMUSs6aaXxM_WpNvl0Zg7wRtJNPpAx-2sU_Lg5wX2Fm-gRbnZtP3UXTQAMMewaiff"
  }
];

export default function ForBusinesses() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

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
          {tiers.map((tier) => {
            const isCustom = typeof tier.priceMonthly === 'string';
            const price = billingCycle === 'monthly' ? tier.priceMonthly : tier.priceAnnually;

            return (
              <div 
                key={tier.name}
                className={`p-6 rounded-[28px] border flex flex-col justify-between shadow-sm transition-all duration-300 relative ${
                  tier.popular ? 'border-orange-500 ring-2 ring-orange-500/20 scale-102 bg-white' : 'border-gray-200 bg-white'
                } ${tier.custom ? 'bg-neutral-950 border-neutral-900 text-white' : ''}`}
              >
                {tier.popular && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}
                
                <div>
                  <div className="space-y-1 mb-6">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${tier.custom ? 'text-orange-400' : tier.color}`}>
                      {tier.name}
                    </span>
                    <h3 className="text-2xl font-bold font-headline-lg">
                      {isCustom ? price : `£${price}`}
                      {!isCustom && <span className="text-[10px] text-gray-400 font-medium">/mo</span>}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs">
                        <span className="material-symbols-outlined text-orange-500 text-sm shrink-0">check_circle</span>
                        <span className={tier.custom ? 'opacity-90' : 'text-gray-600'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href={tier.custom ? "/contact" : "/business/signup"}
                  className={`w-full py-2.5 rounded-full font-bold text-xs text-center border transition-all active:scale-95 block ${
                    tier.popular 
                      ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/10' 
                      : tier.custom
                        ? 'bg-white text-neutral-900 border-white hover:bg-gray-100'
                        : 'border-orange-500 text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <h2 className="text-3xl font-bold font-headline-lg text-center text-gray-900">Trusted by the Best</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed">"{t.quote}"</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0">
                    <img className="w-full h-full object-cover" src={t.image} alt={t.name} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-800">{t.name}</h5>
                    <p className="text-[10px] text-gray-400 font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-6">
        <div className="p-8 md:p-12 bg-neutral-900 rounded-[40px] text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-bold font-headline-lg">Ready to build your kingdom?</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Join thousands of businesses already winning the loyalty game. Setup your program and reward your first customer today.
          </p>
          <Link href="/business/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-xs shadow-md shadow-orange-500/10 inline-block transition active:scale-95">
            Start Your Free Trial
          </Link>
        </div>
      </section>

    </div>
  );
}
