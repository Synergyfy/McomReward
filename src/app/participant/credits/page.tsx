'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGetCreditsBalance, useGetCreditsRules, useGetCreditsHistory } from '@/services/cashback/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Zap,
    TrendingUp,
    History,
    Info,
    ChevronRight,
    Sparkles,
    Lock,
    ArrowRight,
    Wallet,
    Coins,
    ShieldCheck,
    Gift,
    ChevronUp,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreditsPage() {
    const { data: balanceData } = useGetCreditsBalance();
    const { data: rulesData } = useGetCreditsRules();
    const { data: historyData } = useGetCreditsHistory(1, 10);

    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
    
    // Simulation state to act as "Live Version"
    const [simulatedBalance, setSimulatedBalance] = useState(60.00);
    const [simulatedCredits, setSimulatedCredits] = useState(125);
    const [simulatedLevel, setSimulatedLevel] = useState(0);

    // Initialize simulation from real data if available - only once
    const [isInitialized, setIsInitialized] = useState(false);
    useEffect(() => {
        if (balanceData && !isInitialized) {
            setSimulatedBalance(prev => Math.max(prev, balanceData.availableCashback || 0));
            setSimulatedCredits(prev => Math.max(prev, balanceData.credits || 0));
            setSimulatedLevel(prev => Math.max(prev, balanceData.progression?.currentLevel || 0));
            setIsInitialized(true);
        }
    }, [balanceData, isInitialized]);

    // Mocking levels
    const levels = useMemo(() => [
        { level: 1, creditsNeeded: 50, matchingContribution: 25, platformMatch: 25, totalCashback: 50 },
        { level: 2, creditsNeeded: 100, matchingContribution: 50, platformMatch: 50, totalCashback: 100 },
        { level: 3, creditsNeeded: 200, matchingContribution: 100, platformMatch: 100, totalCashback: 200 },
    ], []);

    const credits = simulatedCredits;
    const currentLevel = simulatedLevel;
    const nextLevel = useMemo(() => 
        levels.find(l => l.level > currentLevel) || levels[levels.length - 1],
    [levels, currentLevel]);

    const selectedLevel = useMemo(() => 
        levels.find(l => l.level === selectedLevelId),
    [levels, selectedLevelId]);

    const progressToNext = nextLevel
        ? Math.min(100, (credits / nextLevel.creditsNeeded) * 100)
        : 100;

    const handleUnlockClick = (level: number) => {
        setSelectedLevelId(level);
        setIsUnlockModalOpen(true);
    };

    const handleConfirmUnlock = () => {
        if (!selectedLevel) return;
        
        if (simulatedBalance < selectedLevel.matchingContribution) {
            toast.error("Insufficient Funds", {
                description: "You need more in your spendable balance to match this level."
            });
            return;
        }

        const rewardAmount = selectedLevel.totalCashback;
        const contribution = selectedLevel.matchingContribution;
        
        setSimulatedBalance(prev => (prev - contribution) + rewardAmount);
        setSimulatedLevel(selectedLevel.level);
        
        setIsUnlockModalOpen(false);
        
        toast.success("Reward Unlocked!", {
            description: `Level ${selectedLevel.level} activated. £${rewardAmount.toFixed(2)} added to your wallet.`,
            icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-8 px-4">
            {/* Hero Section - Credit Balance */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-30" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-400/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 opacity-30" />

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600/20 text-orange-600 rounded-full text-[10px] font-semibold uppercase tracking-widest border border-orange-600/20">
                            <Zap className="w-3 h-3 fill-orange-600" /> Reward Engine
                        </div>
                        <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tighter leading-none">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Credits</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-lg mx-auto md:mx-0">
                            Earn credits through actions and bookings. Contribute a matching amount to unlock them as spendable cashback in your wallet.
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                                <Wallet className="w-5 h-5 text-orange-400" />
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Spendable Balance</p>
                                    <p className="text-lg font-semibold text-white">£{simulatedBalance.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-orange-600 rounded-2xl flex items-center gap-3 shadow-xl shadow-orange-600/20">
                                <Coins className="w-5 h-5 text-white" />
                                <div>
                                    <p className="text-[10px] font-semibold text-white/60 uppercase">Earning Booster</p>
                                    <p className="text-lg font-semibold text-white">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-3xl text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-orange-400/5 group-hover:bg-orange-400/10 transition-colors" />
                            <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-2 relative">Current Credits</p>
                            <h2 className="text-8xl font-semibold text-white tabular-nums relative">{credits}</h2>
                            <div className="mt-4 flex items-center justify-center gap-2 relative">
                                <Sparkles className="w-4 h-4 text-orange-400" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Verified by Synergyfy</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Level Progression */}
            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-8 px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-semibold text-slate-900">Tier Progression</CardTitle>
                                <CardDescription className="text-sm font-medium">Climb levels to unlock bigger multipliers.</CardDescription>
                            </div>
                            <Badge className="bg-orange-600 text-white font-semibold px-4 py-1.5 rounded-full">LEVEL {currentLevel}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <p className="text-sm font-semibold text-slate-700">Progress to Level {currentLevel + 1}</p>
                                <p className="text-xs font-semibold text-orange-600 uppercase bg-orange-50 px-2 py-1 rounded-md">
                                    {credits} / {nextLevel?.creditsNeeded ?? 'MAX'}
                                </p>
                            </div>
                            <Progress value={progressToNext} className="h-4 bg-slate-100 rounded-full" />
                        </div>

                        <TooltipProvider>
                            <div className="grid gap-4">
                                {levels.map((lv) => (
                                    <Tooltip key={lv.level}>
                                        <TooltipTrigger asChild>
                                            <motion.div
                                                whileHover={{ x: 5 }}
                                                className={`p-6 rounded-3xl border transition-all cursor-help ${credits >= lv.creditsNeeded
                                                    ? 'bg-green-50 border-green-200 shadow-lg shadow-green-100/50'
                                                    : 'bg-white border-slate-100 opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-2xl ${credits >= lv.creditsNeeded ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                            {credits >= lv.creditsNeeded ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-semibold text-slate-900 tracking-tight">Level {lv.level}</p>
                                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">Requires {lv.creditsNeeded} Credits</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Potential Reward</p>
                                                        <p className="text-xl font-semibold text-slate-900">£{lv.totalCashback}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent 
                                            side="right" 
                                            className="z-[100000] p-4 bg-slate-900 text-white border-slate-800 rounded-2xl shadow-xl max-w-xs"
                                        >
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-orange-400">Level {lv.level} Contributors</p>
                                                <ul className="text-xs space-y-1.5 list-disc pl-4 text-slate-300">
                                                    <li>You need to contribute <span className="text-white font-semibold">£{lv.matchingContribution}</span></li>
                                                    <li>Platform will match with <span className="text-white font-semibold">£{lv.platformMatch}</span></li>
                                                    <li>Total reward available: <span className="text-white font-semibold">£{lv.totalCashback}</span></li>
                                                </ul>
                                                <p className="text-[10px] text-slate-500 mt-2 italic">This instruction links your contribution to the reward unlock.</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-2xl shadow-orange-100 bg-orange-600 text-white overflow-hidden rounded-[2.5rem] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-700" />
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Gift className="w-32 h-32 rotate-12" />
                    </div>
                    <CardHeader className="relative z-10 py-8 px-8">
                        <CardTitle className="text-2xl font-semibold">Matching Contribution</CardTitle>
                        <CardDescription className="text-orange-50 font-medium opacity-80">Convert your credits to real currency.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 p-8 pt-0 flex flex-col h-full justify-between">
                        <div className="space-y-6">
                            <p className="text-sm leading-relaxed text-indigo-50 font-medium">
                                To protect platform stability and shared value, credits must be claimed with a matching contribution. This unlocks the credits as spendable balance in your MCOM wallet.
                            </p>

                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4">
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <span>Next Available Tier</span>
                                    <span className="text-orange-400 font-semibold">Level {nextLevel?.level || 1}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs opacity-70">
                                    <span>Contributor Stake</span>
                                    <span>£{nextLevel?.matchingContribution || 25} GBP</span>
                                </div>
                                <div className="flex justify-between items-center text-xs opacity-70">
                                    <span>Platform Match</span>
                                    <span>£{nextLevel?.platformMatch || 25} GBP</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-sm font-semibold">Total Wallet Boost</span>
                                    <span className="text-2xl font-semibold text-white">£{(nextLevel?.totalCashback || 50).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Top-up Requirement Messaging */}
                            {simulatedBalance < (nextLevel?.matchingContribution || 25) && (
                                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-200 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-yellow-100">Action Required</p>
                                        <p className="text-[11px] text-yellow-50/80 leading-tight mt-1">
                                            Your balance is £{simulatedBalance.toFixed(2)}. You need to top up <span className="text-white font-bold text-xs">£{((nextLevel?.matchingContribution || 25) - simulatedBalance).toFixed(2)}</span> more to unlock this reward.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-10">
                            <Button
                                onClick={() => handleUnlockClick(nextLevel?.level || 1)}
                                disabled={credits < (nextLevel?.creditsNeeded || 50)}
                                className="w-full h-16 rounded-2xl bg-white text-orange-600 font-semibold text-sm uppercase tracking-widest shadow-xl transition-all hover:bg-orange-50 hover:text-orange-700 disabled:bg-white/10 disabled:text-white/50"
                            >
                                {credits < (nextLevel?.creditsNeeded || 50) 
                                    ? `Need ${nextLevel?.creditsNeeded - credits} More Credits` 
                                    : "Unlock My Rewards"} <ArrowRight className="ml-3 w-5 h-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* How to Earn */}
            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-xl bg-white rounded-[2.5rem]">
                    <CardHeader className="py-8 px-8 border-b border-slate-50">
                        <CardTitle className="text-xl font-semibold flex items-center gap-3 text-slate-800">
                            <Coins className="w-6 h-6 text-orange-600" />
                            Earning Rules
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">Perform these actions to stack your credits.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {rulesData?.map((rule) => (
                                <div key={rule.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-slate-100 rounded-2xl">
                                            <Sparkles className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 uppercase">{rule.eventType.replace(/_/g, ' ')}</p>
                                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5 tracking-tight uppercase">Platform: {rule.platform.split('_')[1]}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-orange-600">
                                            {rule.rewardType === 'PERCENTAGE' ? `${rule.rewardValue}%` : `+${rule.rewardValue} CR`}
                                        </p>
                                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter">per interaction</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white rounded-[2.5rem]">
                    <CardHeader className="py-8 px-8 border-b border-slate-50">
                        <CardTitle className="text-xl font-semibold flex items-center gap-3 text-slate-800">
                            <History className="w-6 h-6 text-slate-400" />
                            Recent Actions
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">Your historical credit accumulation.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {historyData?.data.filter(h => h.unit === 'CREDITS').map((item) => (
                                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{item.description}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{item.createdAt.split('T')[0]}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-900">+{item.amount} CR</p>
                                        <div className="mt-1">
                                            <Badge variant="outline" className="text-[8px] font-semibold uppercase py-0 px-2 h-4 border-slate-200">{item.status}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 text-center border-t border-slate-50">
                            <Button variant="ghost" className="text-xs font-semibold text-slate-500 hover:text-orange-600 uppercase tracking-widest">
                                View Full History <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 text-center">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                    MCOM LOYALTY PROTOCOL • ENFORCED BY SYNERGYFY CORE • ALL TRANSACTIONS RECORDED ON PLATFORM LEDGER
                </p>
            </div>

            {/* Unlock Modal */}
            <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
                <DialogContent className="sm:max-w-md bg-white border-none rounded-[2rem] p-0 overflow-hidden shadow-2xl">
                    <div className="bg-orange-600 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-20 h-20" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Unlock Level {selectedLevel?.level} Rewards</DialogTitle>
                            <DialogDescription className="text-orange-100 font-medium">
                                You have enough credits to reach this tier!
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">Required Credits</span>
                                </div>
                                <span className="font-bold text-slate-900">{selectedLevel?.creditsNeeded} CR</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Your Contribution</p>
                                    <p className="text-xl font-bold text-slate-900">£{selectedLevel?.matchingContribution}</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Platform Match</p>
                                    <p className="text-xl font-bold text-slate-900">£{selectedLevel?.platformMatch}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 flex justify-between items-center">
                                <span className="text-sm font-semibold">Total Potential Reward</span>
                                <span className="text-2xl font-bold">£{selectedLevel?.totalCashback}</span>
                            </div>
                        </div>

                        {simulatedBalance < (selectedLevel?.matchingContribution || 0) && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-red-900">Insufficient Balance</p>
                                    <p className="text-[11px] text-red-700 leading-tight mt-1">
                                        You need to top up <span className="font-bold">£{((selectedLevel?.matchingContribution || 0) - simulatedBalance).toFixed(2)}</span> to unlock this reward.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button 
                                onClick={handleConfirmUnlock}
                                disabled={simulatedBalance < (selectedLevel?.matchingContribution || 0)}
                                className="w-full h-14 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm uppercase tracking-wider"
                            >
                                {simulatedBalance < (selectedLevel?.matchingContribution || 0) 
                                    ? `Top Up £${((selectedLevel?.matchingContribution || 0) - simulatedBalance).toFixed(2)} to Unlock` 
                                    : "Yes, unlock these now"}
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                onClick={() => setIsUnlockModalOpen(false)}
                                className="w-full h-14 rounded-xl border-slate-200 text-slate-600 font-bold text-sm uppercase tracking-wider hover:bg-slate-50"
                            >
                                <ChevronUp className="w-4 h-4 mr-2" /> Continue to move to level {(selectedLevel?.level ?? 0) + 1}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            Secure Transaction • MCOM Protocol
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
