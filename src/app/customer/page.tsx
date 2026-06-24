"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Trophy, Gift, Milestone, ArrowRight, Calendar, Sparkles, Gamepad2, Activity, Heart, Shield } from 'lucide-react';

export default function CustomerLanding() {
  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen pb-32">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">MCOM Rewards</h1>
          </div>
          <button className="text-slate-500 hover:text-primary transition-colors">
            <Search className="h-6 w-6" />
          </button>
        </div>
      </header>

      <main className="space-y-20">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJc1w5KLaccPqmiX_WoA8CXqN-xltkOt66iPIp3xsqD2KmLxwiofcxEHp0khuaLjMLA3bo97pmbNVmAh3tJEYZ4ixlqQQaSKxRND4nZtLKPU2Sageac8qHzPLdwcqq_pFeQpaf0lmwjjUTd5mK3qvtVOL_rmAoBLQnh21SYruSwfvqbQ8w6GQuVLcjItZ3rV8rC1_c0vCjBw7mJ-WDNdNN-w4h_1eMXr3_FoJf6Fldtehfp3MLEIG8SecrEQ1pt_5rHd60H9V-s34" 
              alt="Rooftop luxury lounge evening" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-950/40 to-transparent" />
          </div>
          <div className="relative z-10 px-6 max-w-4xl mx-auto w-full">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/15 text-primary font-bold text-xs border border-primary/30 uppercase tracking-widest mb-6">
              PREMIUM ACCESS
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white mb-6">
              Welcome to the <span className="text-primary bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Inner Circle</span> of Rewards.
            </h2>
            <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl leading-relaxed">
              Experience a world where every purchase is a victory. Join 5 million members unlocking exclusive lifestyle brands, gaming thrills, and elite events daily.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/customer/signup" 
                className="bg-primary text-white hover:bg-orange-600 px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all text-center"
              >
                Join the Club
              </Link>
              <Link 
                href="/membership" 
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md text-white border border-white/10 px-8 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all text-center"
              >
                Explore Benefits
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Grid: The Value Streams */}
        <section className="px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[220px]">
            {/* Gaming/MCOMSpin (Large) */}
            <div className="md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative group cursor-pointer border border-slate-200/60 flex flex-col justify-end min-h-[380px] shadow-xl">
              <div className="absolute inset-0 z-0">
                <img 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGgEkDCL6UByEF7chJaRuGnC3bwI0isc_5b6T3m3M6LaTIHsMdgPxE7tSbsHGwP25relgTcBEoLdolx0ZlyM5-2Gl-i_3C6VhDHW2kJWMX7i4GAsF5D4I_jWLhIITcn1X9kGcN5q-NnoSoIp9u71QP7GaEeV51itaocwXbR19zhtHysWQpSwIy1hpGmWjPdeBOgm6JQMY_tnFNNOOtIaw8yUkuZxamoNI4HKp2mdxHs3ofymAgcijmfqkPF7pOJwqxlfIZ7kvUJVA" 
                  alt="Neon gaming spin wheel" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>
              <div className="relative z-10 p-6 md:p-8 space-y-2">
                <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-widest">
                  <Gamepad2 className="h-4 w-4" />
                  <span>DAILY WINS</span>
                </div>
                <h3 className="text-2xl font-bold text-white">MCOMSpin Rewards</h3>
                <p className="text-gray-200 text-xs md:text-sm max-w-md">Spin daily to win exclusive travel vouchers and tech gadgets.</p>
              </div>
            </div>

            {/* Brands (Small) */}
            <Link 
              href="/brands"
              className="bg-white rounded-3xl p-6 border border-slate-200/60 flex flex-col justify-between hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:-translate-y-1"
            >
              <Trophy className="text-primary h-8 w-8" />
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">500+ Brands</h4>
                <p className="text-slate-500 text-xs">Exclusive member pricing</p>
              </div>
            </Link>

            {/* Gift Cards (Small) */}
            <Link 
              href="/gift-cards"
              className="bg-white rounded-3xl p-6 border border-slate-200/60 flex flex-col justify-between hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:-translate-y-1"
            >
              <Gift className="text-primary h-8 w-8" />
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">Instant Gifts</h4>
                <p className="text-slate-500 text-xs">Digital delivery in seconds</p>
              </div>
            </Link>

            {/* Membership (Wide) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/60 flex items-center gap-6 group cursor-pointer hover:border-primary/20 transition-all shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Milestone className="text-primary h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Tier Up to Diamond</h4>
                <p className="text-slate-500 text-xs md:text-sm">Unlock concierge services and airport lounge access as you grow.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Brands Showcase */}
        <section className="px-6 max-w-7xl mx-auto overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Brands</h2>
            <Link href="/brands" className="text-primary font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
              VIEW ALL <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {[
              { label: "Luxury Fashion", icon: "shopping_bag" },
              { label: "Fine Dining", icon: "restaurant" },
              { label: "Global Travel", icon: "flight_takeoff" },
              { label: "Tech & Gear", icon: "devices" },
              { label: "Wellness", icon: "spa" }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="flex-none w-40 h-40 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors shadow-sm"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full mb-3 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500 text-2xl">{item.icon}</span>
                </div>
                <span className="text-xs font-bold text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Exclusive Events (Asymmetric Layout) */}
        <section className="px-6 max-w-7xl mx-auto py-12 border-t border-slate-200/60">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">
                Member-Only <span className="text-primary">Events</span>
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Access the inaccessible. From VIP music festival passes to private gallery viewings, your membership is the golden key.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Early Access Tickets</h5>
                    <p className="text-slate-500 text-xs">48h before the general public</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Private Experiences</h5>
                    <p className="text-slate-500 text-xs">Exclusive to Gold & Diamond tiers</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-7 relative">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-primary/20">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFMkECxYCsmasS8XOFTYMrciqfSAyV1__PN0iUEESubgp-y4c6xOE9o0ZCMKdUF-0gZtFBUX6PZutLm-q4E7X4aAEiMCcGvgbsppQpoxd2mx5oIR8gmwFV6NvOWNlqUuaMuQ2LH2lapYXm3p_YDJ2qY5qWYjPnurdx4e_CPxbnfNIWA1ycsVLRr2qB8ah5jIIjav6nH8R9JASgUgZ5CzRM9gLPNvLCuLHCQWiCCfWVuVEvaVWpqnJ6YRtD7_SMEshZiwaLHszW5pc" 
                  alt="Luxury VIP event venue" 
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 hidden md:block shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5">
                    <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden">
                      <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6a7Jvw268gpaF72B5ytXYVvrO8O5krvAoTy0TQqT49MoOxQaMKgSyvXpcI96e0wFpftxm0f9tfJqc1R9lHKZJkhMqzg4IEGGhkXhKUd2p6-FGq7P4h9GWS983d3sQLtQns5MT5yyH0joyFSyAgbxaFg9OXr1VV2C4F3ch-Jt3phCguJ8i7ncVfe44d-gAe0toJYJWtBujrcoHZIJsm5EahEzSjZq-4Rz8BEVtTl1xZuYj5M735JDmnBkK_mEA2oKN5A8efR82bJE" alt="Member avatar" />
                    </div>
                    <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden">
                      <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs7e_t_rM03GjCvHfgsx2xikWh3lyaqW_BPWlDOw9pdd5BzERMPfn-8K34Rm5sYTNwwVPl1YA7jFQfI5UVYRE52lYz2U4WZ2dwOnauisRH8I9Z_dJTuDtokJKuVjyKgKA5VIDw4E1j9Fs9Zb1T10SUTtgO-h0F39Ui7WEHd-j_Zjr2pM0Sz1HyIF7B4PiCOf2WzK8jD7zhLXAZquypUebPud-RbFDIyKKJlsxg9fjjsdIqdOMHHKVcp08nXGpKLTr3ZP2KxiNu0qQ" alt="Member avatar" />
                    </div>
                    <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden">
                      <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvC35t-WExnHMgKWF1bTcX_1IVRHwjfwugS4rpIsJb7mhOeNkWLCsIernQvBu_zYA7jzVr5asWSAkaglQNEAU5A1giW_9ZgxdFwoS55Y9SlAL9-6ai2ZlWQrTkEBIwcaYBwEHuqyTeQtq15JRQGvWSgam7uttTPbi43a3QEDClSrhJ-QQYq6VfUL9tY74Q9brAwn29kZ8sNqbZ-DgXWppsSzafyly5tQv6iKkDQdQjgGFJfamg9MCxIGDokic636-9GPWU4Lmq1Bw" alt="Member avatar" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Join 12k+ attending</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 max-w-7xl mx-auto pb-12">
          <div className="bg-primary/10 border border-primary/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10 text-center md:text-left space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">Ready to claim your status?</h2>
              <p className="text-slate-500 text-xs md:text-sm">It takes 30 seconds to start winning.</p>
            </div>
            <Link 
              href="/customer/signup" 
              className="relative z-10 bg-primary text-white hover:bg-orange-600 px-8 py-3.5 rounded-full font-bold text-xs md:text-sm transition-transform active:scale-95 shadow-lg shrink-0"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
