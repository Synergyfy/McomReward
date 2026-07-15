'use client';

import React from 'react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Search,
    UserPlus,
    BarChart3,
    ArrowRight,
    Sparkles,
    Gift,
    Stamp,
    Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessReward } from '@/services/business-reward/types';

interface UnifiedViewCustomersModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: BusinessReward | null;
}

export default function UnifiedViewCustomersModal({
    isOpen,
    onClose,
    reward,
}: UnifiedViewCustomersModalProps) {
    if (!reward) return null;

    const isStampCard = reward.is_stamps_enabled || reward.isStampsEnabled || (Number(reward.stampsRequired || reward.stamps_required) > 0);
    const isHybrid = isStampCard && (reward.is_points_enabled || reward.isPointsEnabled || (Number(reward.pointRequired || reward.points_required) > 0));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-transparent shadow-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]"
                >
                    {/* Header with Background Pattern - FIXED */}
                    <div className="relative p-8 overflow-hidden flex-shrink-0">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-2xl shadow-lg ring-4 ring-white dark:ring-gray-800 ${isHybrid ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                                    isStampCard ? 'bg-gradient-to-br from-orange-500 to-amber-600' :
                                        'bg-gradient-to-br from-blue-500 to-indigo-600'
                                    }`}>
                                    <Users className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Reward Insights
                                        </DialogTitle>
                                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                                            Beta
                                        </Badge>
                                    </div>
                                    <DialogDescription className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        {reward.title} • {isHybrid ? 'Hybrid' : isStampCard ? 'Stamp Card' : 'Point Reward'}
                                    </DialogDescription>
                                </div>
                            </div>

                            <div className="hidden sm:block">
                                <div className="p-1 px-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live Tracking</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Body Container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Stats Grid Preview */}
                        <div className="px-8 mb-4 grid grid-cols-3 gap-4">
                            {[
                                { label: 'Engaged', value: '0', icon: Users, color: 'blue' },
                                { label: 'Completions', value: '0', icon: Trophy, color: 'orange' },
                                { label: 'Conversions', value: '0%', icon: BarChart3, color: 'purple' },
                            ].map((stat, i) => (
                                <div key={i} className="p-4 rounded-3xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="p-8 pt-4">
                            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-2 z-10 transition-all rounded-xl px-2 -mx-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    Active Participants
                                    <span className="text-sm font-normal text-gray-400">(0)</span>
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        disabled
                                        placeholder="Search customers..."
                                        className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm w-48 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-not-allowed opacity-50 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Stunning Empty State */}
                            <div className="py-8 flex flex-col items-center text-center">
                                <div className="relative mb-8 transform hover:scale-105 transition-transform duration-300">
                                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
                                    <div className="relative w-32 h-32 bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                        <Sparkles className="h-12 w-12 text-orange-500" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-12">
                                        <UserPlus className="h-6 w-6 text-white" />
                                    </div>
                                </div>

                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                    No customers yet
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8 leading-relaxed">
                                    As soon as customers start engaging with this reward, their progress and details will appear here.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    <Card className="border-none bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl md:rounded-[2rem] transition-colors hover:bg-orange-100/50 dark:hover:bg-orange-900/20">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                                    <Stamp className="h-4 w-4 text-orange-600" />
                                                </div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">Growth Tip</p>
                                            </div>
                                            <p className="text-[11px] text-left text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                                Promote this reward in your campaign to attract more customers.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-none bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl md:rounded-[2rem] transition-colors hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                                    <Trophy className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">Redemptions</p>
                                            </div>
                                            <p className="text-[11px] text-left text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                                High engagement leads to more redemptions and customer loyalty.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions - FIXED */}
                    <div className="p-6 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex justify-between items-center px-8 flex-shrink-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Real-time sync active
                        </p>
                        <Button
                            onClick={onClose}
                            className="rounded-2xl px-10 h-11 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-xl shadow-gray-900/10 dark:shadow-none transition-all active:scale-95"
                        >
                            Got it
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
