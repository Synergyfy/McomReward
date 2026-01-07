'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ProgressionCard from '@/components/dashboard/progression/ProgressionCard';
import ProgressionBenefits from '@/components/dashboard/progression/ProgressionBenefits';
import { useGetMyProgression } from '@/services/progression/hook';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Loader2, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgressionPage() {
  const { data: progression, isLoading, isError } = useGetMyProgression();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Loader2 className="h-12 w-12 mb-4 animate-spin text-orange-500 opacity-50" />
        <p className="animate-pulse font-medium">Loading your progression status...</p>
      </div>
    );
  }

  if (isError || !progression) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 text-center px-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Zap className="h-8 w-8 text-red-400" />
        </div>
        <p className="font-bold text-slate-800 text-lg">Unable to load progression</p>
        <p className="text-sm mt-2 max-w-xs mx-auto">We're having trouble reaching the server. Please check your connection or try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentLevelName = progression.currentLevel;
  // Find the next level (the first one that is NOT current)
  const nextLevel = progression.nextLevels.find(l => !l.isCurrent && l.level !== currentLevelName);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 md:px-0">
      {/* Page Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Level Up Your <span className="text-orange-600">Progression</span>
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl leading-relaxed">
            Track your business growth and unlock premium features as you advance through our specialized progression tiers.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-5 py-2.5 rounded-2xl">
          <ShieldCheck className="text-orange-600 h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-0.5">Membership Tier</span>
            <span className="text-sm font-bold text-slate-800">{progression.tierName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Status Column */}
        <div className="lg:col-span-12">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
            {/* Background elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-600/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-widest">
                  <Zap className="h-3 w-3" />
                  Your Current Level
                </div>

                <div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">
                    {currentLevelName}
                  </h2>
                  <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-xl">
                    You've reached the <strong>{currentLevelName}</strong> milestone. You're currently utilizing specialized tools designed to scale your business efficiency.
                  </p>
                </div>

                {/* Metrics summary */}
                <div className="flex flex-wrap gap-x-12 gap-y-6">
                  {Object.entries(progression.metrics || {}).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-2xl font-black text-white">{String(value)}</span>
                    </div>
                  ))}
                  {Object.entries(progression.metrics || {}).length === 0 && (
                    <div className="text-slate-500 text-sm italic">Status metrics are being updated...</div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 self-stretch">
                {nextLevel ? (
                  <ProgressionCard
                    currentLevelName={currentLevelName}
                    nextLevel={nextLevel}
                  />
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-10 text-center space-y-4 h-full flex flex-col justify-center min-w-[320px]">
                    <Trophy className="h-16 w-16 text-emerald-400 mx-auto" />
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Peak Growth!</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Exceptional work! You've reached the highest progression level available for your current tier.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="lg:col-span-12">
          <ProgressionBenefits levels={progression.nextLevels} currentLevelName={currentLevelName} />
        </div>
      </div>

      {/* Upgrade CTA / Footer section */}
      <Card className="border-none bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-[2rem] overflow-hidden shadow-xl">
        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Want more business power?</h3>
            <p className="text-orange-50 opacity-90 text-lg max-w-xl leading-relaxed">
              Unlock even higher progression levels and exclusive tools by upgrading your base membership tier today.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard/subscription'}
            className="group flex items-center gap-3 bg-white text-orange-600 px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
          >
            Explore Tiers
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
