"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ReferFriendsFamily() {
  const [copied, setCopied] = useState(false);
  const referLink = "mcom.io/ref/user_99";

  const handleCopy = () => {
    navigator.clipboard.writeText(referLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-12">
      
      {/* Hero Section */}
      <section className="relative rounded-[32px] overflow-hidden min-h-[380px] flex items-center p-6 md:p-12 shadow-sm border border-gray-100">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7CDDVwBlF7Y3XnPbiJv2ezWempwHIPKFpMB6lIZTlcJDGYtPTUKdFZdKB7wiLZqjT_IdWf3M-qWaqxz-yDCOvUop6ZFgfrRYe_wXwGI3cfihUZ-NXhqwh2q5GLuDw-ji_6pJuCNDpDH_2_uwIHxE0Y0zAfVy9J92Zv_nYE0_1T7e3Zavllz5xNk3SxMyyeS9F1pdUvlAGDZW9LQQGufJVFiqDXUdiggGr4pewMpxt8-ModZHPOSFlvAuA_DCZfIuQx2tpRHzOOdwR" 
            alt="Friends and family laughing" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 font-bold text-xs">
            REWARDS HUB
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-headline-lg leading-tight tracking-tight text-gray-900">
            Share the Joy, Share the Rewards
          </h1>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-md">
            Invite your circle to MCOM and unlock premium experiences together. It's more than a referral—it's a shared journey.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-md shadow-orange-500/10 active:scale-95 transition-all">
              Invite Friends
            </button>
            <button className="bg-gray-150 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-bold text-xs active:scale-95 transition-all">
              Invite Family
            </button>
          </div>
        </div>
      </section>

      {/* Earn Highlight Card */}
      <section className="bg-orange-50 border border-orange-100 p-6 rounded-3xl text-center space-y-1 max-w-xl mx-auto shadow-sm">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Exclusive Offer</span>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Earn 500 Pts for every successful referral
        </h2>
      </section>

      {/* Bento Hub Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        
        {/* Referral Rewards Dashboard */}
        <div className="lg:col-span-8 bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h3 className="text-lg font-bold text-gray-800">Referral Rewards Dashboard</h3>
            <span className="material-symbols-outlined text-gray-400">analytics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Points Earned</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">12,500</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Successful Referrals</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">25</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending Invites</p>
              <p className="text-2xl font-bold text-slate-500 mt-1">08</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center">
                  JD
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800">Jane Doe</h4>
                  <p className="text-[10px] text-gray-400 font-semibold">Referred 2 days ago</p>
                </div>
              </div>
              <span className="text-orange-500 font-bold text-xs">+500 Pts</span>
            </div>

            <div className="flex items-center justify-between p-3 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                  MS
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800">Mark Smith</h4>
                  <p className="text-[10px] text-gray-400 font-semibold">Referred 5 days ago</p>
                </div>
              </div>
              <span className="text-gray-400 text-xs font-semibold">Pending</span>
            </div>
          </div>
        </div>

        {/* Shared Gift Cards (Tall layout) */}
        <div className="lg:col-span-4 bg-orange-500 text-white p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg leading-snug">Shared Gift Cards</h3>
              <span className="material-symbols-outlined text-white opacity-85">card_giftcard</span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              Pool your referral points with your family group to unlock high-value global gift cards faster.
            </p>
          </div>

          <div className="space-y-4 relative z-10 pt-6">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Amazon Global</span>
                <span>£100</span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-white w-3/4 rounded-full" />
              </div>
              <p className="text-[9px] text-white/80 text-right font-medium">750/1000 Pts to target</p>
            </div>
            <Link href="/gift-cards" className="bg-white text-orange-600 w-full py-2.5 rounded-full font-bold text-xs text-center block transition hover:bg-orange-50 active:scale-95 shadow">
              View All Cards
            </Link>
          </div>

          {/* Background decoration */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* Invite Friends Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        
        {/* Friend Share Link */}
        <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-base text-gray-800">Invite Friends</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Share your unique link with friends. They get a welcome bonus, and you get 500 Pts.
          </p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-1 pl-4">
            <input 
              type="text" 
              readOnly 
              value={referLink}
              className="bg-transparent border-none focus:ring-0 text-xs grow text-gray-500 font-medium outline-none"
            />
            <button 
              onClick={handleCopy}
              className="bg-neutral-900 hover:bg-neutral-800 text-white py-2 px-5 rounded-full font-bold text-xs active:scale-95 transition-all shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          
          <div className="flex gap-4 justify-center pt-2">
            <span className="material-symbols-outlined p-3 bg-gray-50 border border-gray-100 rounded-full text-gray-500 shadow-sm cursor-pointer hover:scale-105 transition-transform active:scale-95">
              share
            </span>
            <span className="material-symbols-outlined p-3 bg-gray-50 border border-gray-100 rounded-full text-gray-500 shadow-sm cursor-pointer hover:scale-105 transition-transform active:scale-95">
              mail
            </span>
          </div>
        </div>

        {/* Family Hub invite */}
        <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-base text-gray-800">Invite Family</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Create a family pool to combine forces. Send invites directly to their email or phone number.
          </p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="family@member.com" 
              className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs grow text-gray-600 outline-none focus:border-orange-500"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold text-xs transition active:scale-95 shrink-0 shadow shadow-orange-500/10">
              Send Invite
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
