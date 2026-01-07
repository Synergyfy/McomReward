'use client';

import React from 'react';
import { useGetParticipantProgression } from '@/services/progression/hook';
import CustomerProgressionCard from '@/components/customer/progression/CustomerProgressionCard';
import CustomerBadgeGrid from '@/components/customer/progression/CustomerBadgeGrid';
import { Loader2, Zap, Award, Sparkles, ChevronRight, Gift, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function CustomerProgressionPage() {
    const { data: progression, isLoading, isError } = useGetParticipantProgression();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-500 opacity-20" />
                    <Rocket className="h-6 w-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                </div>
                <p className="mt-6 font-bold text-slate-400 animate-pulse tracking-widest uppercase text-xs">Synchronizing Journey...</p>
            </div>
        );
    }

    if (isError || !progression) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 text-center px-6">
                <div className="bg-red-50 p-6 rounded-3xl mb-6 shadow-sm">
                    <Zap className="h-10 w-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Connection Interrupted</h2>
                <p className="text-slate-500 max-w-sm mx-auto mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    We couldn't retrieve your progression data. This might be a temporary hiccup in the matrix.
                </p>
                <Button
                    onClick={() => window.location.reload()}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-2xl shadow-lg shadow-orange-600/20 transition-all hover:scale-105"
                >
                    Try Reconnecting
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 lg:px-8 pt-8">
            {/* High-Impact Hero Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-50" />

                    <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                <Award className="h-4 w-4" />
                                Your Status: {progression.currentBadge.name}
                            </motion.div>

                            <div className="space-y-4">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[0.9]"
                                >
                                    Elevate Your <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Rewards</span>
                                </motion.h1>
                                <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                    Every interaction brings you closer to legendary status. Unlock exclusive privileges and multipliers as you climb.
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/10">
                                    <Zap className="h-5 w-5 text-orange-400" />
                                    <span className="text-sm font-bold">x{progression.currentBadge.multiplier} Earning Multiplier</span>
                                </div>
                                <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl shadow-sm">
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                    <span className="text-sm font-bold">{progression.currentBadge.benefits.length} Active Privileges</span>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full lg:w-[450px] shrink-0"
                        >
                            <CustomerProgressionCard
                                currentPoints={progression.currentPoints}
                                currentBadge={progression.currentBadge}
                                nextBadge={progression.nextBadge}
                                remainingPoints={progression.remainingPoints}
                                progressPercentage={progression.progressPercentage}
                            />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Badge Grid Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Milestones</span>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>

                <CustomerBadgeGrid
                    badges={progression.allBadges}
                    currentBadgeId={progression.currentBadge.id}
                />
            </div>

            {/* Premium CTA Section */}
            <div className="relative group overflow-hidden rounded-[2.5rem]">
                <div className="absolute inset-0 bg-slate-900" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                            Accelerate Your <span className="text-orange-500">Growth</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-xl font-medium">
                            Ready to jump to the next level? Complete more campaigns and refer friends to boost your points instantly.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-10 py-8 rounded-[1.5rem] text-lg shadow-2xl shadow-orange-600/20 group transition-all"
                        >
                            Earn Points Now
                            <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-transparent border-white/20 text-white hover:bg-white/5 font-bold px-10 py-8 rounded-[1.5rem] text-lg transition-all"
                        >
                            View Rewards
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
