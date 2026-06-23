"use client";

import React from 'react';
import Link from 'next/link';

const membershipTiers = [
  {
    name: "Bronze",
    sub: "Entry Level",
    gradientClass: "bg-gradient-to-br from-[#A87E63] to-[#764D35]",
    icon: "stars",
    benefits: [
      { text: "1x Point Multiplier", active: true },
      { text: "Access to Standard Offers", active: true },
      { text: "Digital Wallet integration", active: true },
      { text: "Priority Booking Access", active: false }
    ],
    cta: "Select Bronze Tier",
    secondary: true
  },
  {
    name: "Silver",
    sub: "Frequent User",
    gradientClass: "bg-gradient-to-br from-[#E2E2E2] to-[#8E8E8E]",
    icon: "military_tech",
    benefits: [
      { text: "1.5x Point Multiplier", active: true },
      { text: "Monthly Specials & Codes", active: true },
      { text: "Standard Support Queue", active: true },
      { text: "Priority Booking Access", active: false }
    ],
    cta: "Upgrade to Silver",
    secondary: true
  },
  {
    name: "Gold",
    sub: "Elite Member",
    gradientClass: "bg-gradient-to-br from-[#FFD700] to-[#B8860B]",
    icon: "award_star",
    benefits: [
      { text: "3x Point Multiplier", active: true },
      { text: "Priority Booking Access", active: true },
      { text: "Exclusive Local Events", active: true },
      { text: "No Point Expiry Period", active: true }
    ],
    cta: "Upgrade to Gold",
    popular: true
  },
  {
    name: "Platinum",
    sub: "Ultimate Luxury",
    gradientClass: "bg-gradient-to-br from-[#E5E4E2] to-[#534D4C]",
    icon: "diamond",
    benefits: [
      { text: "5x Point Multiplier", active: true },
      { text: "VIP Hospitality Booking", active: true },
      { text: "Personal Concierge Queue", active: true },
      { text: "Invitation-Only Campaigns", active: true }
    ],
    cta: "Request Invitation",
    dark: true
  }
];

export default function MembershipTiers() {
  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-12">
      
      {/* Hero Header */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold font-headline-lg text-gray-900 leading-tight">
          Experience the <span className="text-orange-500">Next Level</span>
        </h1>
        <p className="text-sm md:text-base text-gray-500 leading-relaxed">
          Elevate your rewards experience. From exclusive campaigns to high-velocity multipliers, choose the tier that matches your lifestyle.
        </p>
      </section>

      {/* Tier Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {membershipTiers.map((tier) => (
          <div
            key={tier.name}
            className={`group bg-white rounded-3xl p-6 shadow-sm border flex flex-col justify-between overflow-hidden relative transition-all duration-300 hover:-translate-y-1 ${
              tier.popular 
                ? 'border-amber-400 ring-2 ring-amber-400/10 shadow-[0_20px_40px_rgba(184,134,11,0.1)]' 
                : tier.dark
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                  : 'border-gray-100'
            }`}
          >
            {/* Watermark Icon background */}
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${tier.dark ? 'text-white' : 'text-neutral-900'}`}>
              <span className="material-symbols-outlined text-[100px] select-none">{tier.icon}</span>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Colored Header Badge */}
              <div className="flex justify-between items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow ${tier.gradientClass}`}>
                  <span className="material-symbols-outlined text-lg">{tier.icon}</span>
                </div>
                {tier.popular && (
                  <span className="bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Popular
                  </span>
                )}
              </div>

              {/* Title & Sub */}
              <div className="space-y-1">
                <h3 className={`text-xl font-bold font-headline-lg ${tier.dark ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${tier.dark ? 'text-gray-400' : 'text-gray-400'}`}>{tier.sub}</p>
              </div>

              {/* Benefits Checklist */}
              <ul className="space-y-2.5 pt-2">
                {tier.benefits.map((benefit, idx) => (
                  <li 
                    key={idx} 
                    className={`flex items-center gap-2 text-xs ${
                      benefit.active 
                        ? tier.dark ? 'text-gray-200' : 'text-gray-700'
                        : 'text-gray-300 line-through'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-sm ${
                      benefit.active 
                        ? 'text-orange-500' 
                        : 'text-gray-300'
                    }`}>
                      {benefit.active ? 'check_circle' : 'cancel'}
                    </span>
                    <span>{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTA Button */}
            <div className="pt-8 relative z-10">
              <button className={`w-full py-2.5 rounded-full font-bold text-xs transition-colors active:scale-95 border ${
                tier.dark
                  ? 'bg-white text-neutral-900 border-white hover:bg-neutral-100'
                  : tier.popular
                    ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/10'
                    : 'border-orange-500 text-orange-600 hover:bg-orange-50'
              }`}>
                {tier.cta}
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Comparison Detail Section */}
      <section className="bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1.5">
            <h4 className="font-bold text-xs text-gray-800">How do point multipliers work?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              When you scan to earn points at local merchants, your points are automatically multiplied based on your tier status. For example, a £10 purchase yielding 10 points yields 30 points if you are a Gold member.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-xs text-gray-800">Do points expire?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              For Bronze and Silver tiers, points expire after 12 months of inactivity. Gold and Platinum tier members enjoy lifetime point validity with no expiry dates.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
