import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Target, ChevronRight } from 'lucide-react';
import { ParticipantBadge } from '@/services/progression/types';
import { motion } from 'framer-motion';

interface CustomerProgressionCardProps {
    currentPoints: number;
    currentBadge: ParticipantBadge;
    nextBadge: ParticipantBadge | null;
    remainingPoints: number;
    progressPercentage: number;
}

export default function CustomerProgressionCard({
    currentPoints,
    currentBadge,
    nextBadge,
    remainingPoints,
    progressPercentage
}: CustomerProgressionCardProps) {
    return (
        <Card className="overflow-hidden border-none bg-slate-900/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/5">
            <div
                className="absolute top-0 left-0 w-full h-1.5"
                style={{ background: `linear-gradient(90deg, ${currentBadge.color || '#f97316'}, ${nextBadge?.color || '#fbbf24'})` }}
            />

            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-2xl font-black text-white tracking-tight">
                            <Trophy className="text-amber-400 h-6 w-6" />
                            <span>Your Journey</span>
                        </CardTitle>
                        <p className="text-slate-400 text-sm font-medium">
                            Keep collecting points to reach the next milestone
                        </p>
                    </div>
                    <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/10 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        {currentBadge.name} Level
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Points Visualization */}
                <div className="flex items-center justify-between gap-6 px-2">
                    <div className="flex flex-col items-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300"
                            style={{ backgroundColor: `${currentBadge.color}20`, border: `2px solid ${currentBadge.color}40` }}
                        >
                            <Star style={{ color: currentBadge.color }} className="h-8 w-8" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Current</span>
                        <span className="text-lg font-black text-white leading-none">{currentPoints} pts</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-2 relative">
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </div>
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                            {progressPercentage}% to next badge
                        </span>

                        {/* Animated pulse from current to next */}
                        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none overflow-hidden h-12">
                            <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-1/4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg -rotate-3 hover:rotate-0 transition-transform duration-300 opacity-60"
                            style={{ backgroundColor: nextBadge ? `${nextBadge.color}20` : 'rgba(255,255,255,0.05)', border: nextBadge ? `2px solid ${nextBadge.color}40` : '2px dashed rgba(255,255,255,0.1)' }}
                        >
                            {nextBadge ? (
                                <Trophy style={{ color: nextBadge.color }} className="h-8 w-8 text-amber-500" />
                            ) : (
                                <Target className="h-8 w-8 text-slate-600" />
                            )}
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Next</span>
                        <span className="text-lg font-black text-white leading-none">
                            {nextBadge ? `${nextBadge.minPoints} pts` : 'Max'}
                        </span>
                    </div>
                </div>

                {/* Progress Stats Card */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center group hover:bg-white/10 transition-colors">
                        <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Points Remaining</span>
                        <span className="text-xl font-black text-white">{remainingPoints}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center group hover:bg-white/10 transition-colors">
                        <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                            <Target className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Point Multiplier</span>
                        <span className="text-xl font-black text-white">x{currentBadge.multiplier}</span>
                    </div>
                </div>

                {/* Next Badge Benefits */}
                {nextBadge && (
                    <div className="pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Star className="h-3 w-3 text-amber-400" />
                                Benefits of {nextBadge.name}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-bold">Upcoming</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {nextBadge.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/5 py-2.5 px-3 rounded-xl">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    <span className="text-xs font-medium text-slate-300">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
