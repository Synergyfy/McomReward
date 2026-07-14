import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ParticipantBadge } from '@/services/progression/types';
import { motion } from 'framer-motion';
import { Star, Lock, CheckCircle2, Award, Zap } from 'lucide-react';

interface CustomerBadgeGridProps {
    badges: ParticipantBadge[];
    currentBadgeId: string;
}

export default function CustomerBadgeGrid({ badges, currentBadgeId }: CustomerBadgeGridProps) {
    const currentBadgeIndex = badges.findIndex(b => b.id === currentBadgeId);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500/10 p-2 rounded-xl">
                        <Award className="h-6 w-6 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Badge Hierarchy</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Updates</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {badges.sort((a, b) => a.priority - b.priority).map((badge, index) => {
                    const isCurrent = badge.id === currentBadgeId;
                    const isUnlocked = index <= currentBadgeIndex;
                    const isNext = index === currentBadgeIndex + 1;

                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className={`relative group rounded-3xl p-6 transition-all duration-500 ${isCurrent
                                    ? 'bg-gradient-to-br from-white to-orange-50/30 border-2 border-orange-500 shadow-[0_20px_40px_rgba(249,115,22,0.15)] scale-[1.02] z-10'
                                    : isUnlocked
                                        ? 'bg-white border border-slate-200 shadow-sm'
                                        : 'bg-slate-50 border border-slate-100 border-dashed opacity-80'
                                }`}
                        >
                            {/* Status Indicator */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                {isCurrent ? (
                                    <Badge className="bg-orange-500 text-white border-none shadow-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        Current Status
                                    </Badge>
                                ) : isUnlocked ? (
                                    <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                ) : isNext ? (
                                    <Badge variant="outline" className="bg-white text-orange-600 border-orange-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        Next Goal
                                    </Badge>
                                ) : (
                                    <div className="bg-slate-200 text-slate-400 rounded-full p-1">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4 pt-2">
                                <div
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isUnlocked ? 'shadow-xl rotate-3 group-hover:rotate-0' : 'grayscale opacity-40'
                                        }`}
                                    style={{ backgroundColor: `${badge.color}15`, border: `1px solid ${badge.color}30` }}
                                >
                                    <Star style={{ color: isUnlocked ? badge.color : '#cbd5e1' }} className="h-8 w-8" />
                                </div>

                                <div>
                                    <h3 className={`text-xl font-black ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                                        {badge.name}
                                    </h3>
                                    <div className="flex items-center justify-center gap-1 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        <Zap className="h-3 w-3" />
                                        <span>x{badge.multiplier} Multiplier</span>
                                    </div>
                                </div>

                                <div className="w-full mt-4 space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-left mb-2 px-1">Privileges</p>
                                    {badge.benefits.map((benefit, bIdx) => (
                                        <div key={bIdx} className="flex items-start gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                                            <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${isUnlocked ? 'bg-orange-400' : 'bg-slate-300'}`} />
                                            <span className={`text-[11px] text-left leading-tight ${isUnlocked ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                                                {benefit}
                                            </span>
                                        </div>
                                    ))}
                                    {badge.benefits.length === 0 && (
                                        <span className="text-[10px] text-slate-400 italic">No specific benefits listed</span>
                                    )}
                                </div>

                                <div className="w-full pt-4 mt-auto">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Requirement
                                    </div>
                                    <div className={`text-sm font-black mt-0.5 ${isUnlocked ? 'text-orange-600' : 'text-slate-500'}`}>
                                        {badge.minPoints}+ Points
                                    </div>
                                </div>
                            </div>

                            {/* Decorative background glow for current badge */}
                            {isCurrent && (
                                <div
                                    className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-[60px] opacity-20 rounded-full"
                                    style={{ backgroundColor: badge.color }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
