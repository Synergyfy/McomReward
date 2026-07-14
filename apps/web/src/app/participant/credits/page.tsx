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
        <div className="max-w-6xl mx-auto space-y-10 py-8 px-4 bg-[#101415] text-[#e0e3e5]">
            {/* Hero Section - Credit Balance */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-[#1d2022] border border-white/5 shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-30" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 opacity-30" />

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-semibold uppercase tracking-widest border border-primary/20">
                            <Zap className="w-3 h-3 fill-primary" /> Reward Engine
                        </div>
                        <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tighter leading-none">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff843a]">Credits</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-lg mx-auto md:mx-0">
                            Earn credits through actions and bookings. Contribute a matching amount to unlock them as spendable cashback in your wallet.
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="px-6 py-3 bg-[#101415] backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-3">
                                <Wallet className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Spendable Balance</p>
                                    <p className="text-lg font-semibold text-white">£{simulatedBalance.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-primary rounded-2xl flex items-center gap-3 shadow-xl shadow-primary/20">
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
                            className="bg-[#101415] backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-3xl text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2 relative">Current Credits</p>
                            <h2 className="text-8xl font-semibold text-white tabular-nums relative">{credits}</h2>
                            <div className="mt-4 flex items-center justify-center gap-2 relative">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Verified by Synergyfy</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Level Progression */}
            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border border-white/5 shadow-2xl bg-[#1d2022] overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="bg-[#101415]/40 border-b border-white/5 py-8 px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-semibold text-white">Tier Progression</CardTitle>
                                <CardDescription className="text-sm font-medium text-gray-400">Climb levels to unlock bigger multipliers.</CardDescription>
                            </div>
                            <Badge className="bg-primary text-white font-semibold px-4 py-1.5 rounded-full">LEVEL {currentLevel}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <p className="text-sm font-semibold text-gray-300">Progress to Level {currentLevel + 1}</p>
                                <p className="text-xs font-semibold text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-1 rounded-md">
                                    {credits} / {nextLevel?.creditsNeeded ?? 'MAX'}
                                </p>
                            </div>
                            <Progress value={progressToNext} className="h-4 bg-[#101415] rounded-full" />
                        </div>

                        <TooltipProvider>
                            <div className="grid gap-4">
                                {levels.map((lv) => (
                                    <Tooltip key={lv.level}>
                                        <TooltipTrigger asChild>
                                            <motion.div
                                                whileHover={{ x: 5 }}
                                                className={`p-6 rounded-3xl border transition-all cursor-help ${credits >= lv.creditsNeeded
                                                    ? 'bg-green-500/10 border-green-500/20 shadow-lg shadow-green-950/20'
                                                    : 'bg-[#101415] border-white/5 opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-2xl ${credits >= lv.creditsNeeded ? 'bg-green-600 text-white' : 'bg-[#1d2022] text-gray-500'}`}>
                                                            {credits >= lv.creditsNeeded ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-semibold text-white tracking-tight">Level {lv.level}</p>
                                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">Requires {lv.creditsNeeded} Credits</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-semibold text-gray-500 uppercase">Potential Reward</p>
                                                        <p className="text-xl font-semibold text-white">£{lv.totalCashback}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent 
                                            side="right" 
                                            className="z-[100000] p-4 bg-[#1d2022] text-white border-white/5 rounded-2xl shadow-xl max-w-xs"
                                        >
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-primary">Level {lv.level} Contributors</p>
                                                <ul className="text-xs space-y-1.5 list-disc pl-4 text-gray-300">
                                                    <li>You need to contribute <span className="text-white font-semibold">£{lv.matchingContribution}</span></li>
                                                    <li>Platform will match with <span className="text-white font-semibold">£{lv.platformMatch}</span></li>
                                                    <li>Total reward available: <span className="text-white font-semibold">£{lv.totalCashback}</span></li>
                                                </ul>
                                                <p className="text-[10px] text-gray-500 mt-2 italic">This instruction links your contribution to the reward unlock.</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-2xl bg-primary text-white overflow-hidden rounded-[2.5rem] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/95" />
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Gift className="w-32 h-32 rotate-12" />
                    </div>
                    <CardHeader className="relative z-10 py-8 px-8">
                        <CardTitle className="text-2xl font-semibold">Matching Contribution</CardTitle>
                        <CardDescription className="text-orange-50 font-medium opacity-80">Convert your credits to real currency.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 p-8 pt-0 flex flex-col h-full justify-between">
                        <div className="space-y-6">
                            <p className="text-sm leading-relaxed text-orange-100 font-medium">
                                To protect platform stability and shared value, credits must be claimed with a matching contribution. This unlocks the credits as spendable balance in your MCOM wallet.
                            </p>

                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4">
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <span>Next Available Tier</span>
                                    <span className="text-white font-semibold bg-white/20 px-2 py-0.5 rounded-full text-xs">Level {nextLevel?.level || 1}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs opacity-80">
                                    <span>Contributor Stake</span>
                                    <span>£{nextLevel?.matchingContribution || 25} GBP</span>
                                </div>
                                <div className="flex justify-between items-center text-xs opacity-80">
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
                                    <AlertCircle className="w-5 h-5 text-yellow-250 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-yellow-100">Action Required</p>
                                        <p className="text-[11px] text-yellow-100/80 leading-tight mt-1">
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
                                className="w-full h-16 rounded-2xl bg-white text-primary font-semibold text-sm uppercase tracking-widest shadow-xl transition-all hover:bg-white/95 disabled:bg-white/10 disabled:text-white/50"
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
                <Card className="border border-white/5 shadow-xl bg-[#1d2022] rounded-[2.5rem]">
                    <CardHeader className="py-8 px-8 border-b border-white/5">
                        <CardTitle className="text-xl font-semibold flex items-center gap-3 text-white">
                            <Coins className="w-6 h-6 text-primary" />
                            Earning Rules
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-gray-400">Perform these actions to stack your credits.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {rulesData?.map((rule) => (
                                <div key={rule.id} className="p-6 flex items-center justify-between hover:bg-[#101415]/40 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-[#101415] border border-white/5 rounded-2xl">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white uppercase">{rule.eventType.replace(/_/g, ' ')}</p>
                                            <p className="text-[10px] font-semibold text-gray-500 mt-0.5 tracking-tight uppercase">Platform: {rule.platform.split('_')[1]}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-primary">
                                            {rule.rewardType === 'PERCENTAGE' ? `${rule.rewardValue}%` : `+${rule.rewardValue} CR`}
                                        </p>
                                        <p className="text-[9px] font-semibold text-gray-505 uppercase tracking-tighter">per interaction</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-white/5 shadow-xl bg-[#1d2022] rounded-[2.5rem]">
                    <CardHeader className="py-8 px-8 border-b border-white/5">
                        <CardTitle className="text-xl font-semibold flex items-center gap-3 text-white">
                            <History className="w-6 h-6 text-gray-450" />
                            Recent Actions
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-gray-400">Your historical credit accumulation.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {historyData?.data.filter(h => h.unit === 'CREDITS').map((item) => (
                                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-[#101415]/40 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-[#101415] text-primary border border-white/5 rounded-2xl">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-tight">{item.description}</p>
                                            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">{item.createdAt.split('T')[0]}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-white">+{item.amount} CR</p>
                                        <div className="mt-1">
                                            <Badge variant="outline" className="text-[8px] font-semibold uppercase py-0 px-2 h-4 border-white/10 text-gray-400">{item.status}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 text-center border-t border-white/5">
                            <Button variant="ghost" className="text-xs font-semibold text-gray-400 hover:text-primary uppercase tracking-widest">
                                View Full History <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-[#1d2022] p-6 rounded-3xl border border-dashed border-white/5 text-center">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] leading-relaxed">
                    MCOM LOYALTY PROTOCOL • ENFORCED BY SYNERGYFY CORE • ALL TRANSACTIONS RECORDED ON PLATFORM LEDGER
                </p>
            </div>

            {/* Unlock Modal */}
            <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
                <DialogContent className="sm:max-w-md bg-[#1d2022] border border-white/5 rounded-[2rem] p-0 overflow-hidden shadow-2xl text-white">
                    <div className="bg-primary p-8 text-white relative">
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
                            <div className="flex items-center justify-between p-4 bg-[#101415] rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#1d2022] border border-white/5 rounded-xl shadow-sm">
                                        <ShieldCheck className="w-5 h-5 text-green-500" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-300">Required Credits</span>
                                </div>
                                <span className="font-bold text-white">{selectedLevel?.creditsNeeded} CR</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Your Contribution</p>
                                    <p className="text-xl font-bold text-white">£{selectedLevel?.matchingContribution}</p>
                                </div>
                                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Platform Match</p>
                                    <p className="text-xl font-bold text-white">£{selectedLevel?.platformMatch}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-green-600 text-white rounded-2xl shadow-lg flex justify-between items-center">
                                <span className="text-sm font-semibold">Total Potential Reward</span>
                                <span className="text-2xl font-bold">£{selectedLevel?.totalCashback}</span>
                            </div>
                        </div>

                        {simulatedBalance < (selectedLevel?.matchingContribution || 0) && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-red-400">Insufficient Balance</p>
                                    <p className="text-[11px] text-red-300 leading-tight mt-1">
                                        You need to top up <span className="font-bold">£{((selectedLevel?.matchingContribution || 0) - simulatedBalance).toFixed(2)}</span> to unlock this reward.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button 
                                onClick={handleConfirmUnlock}
                                disabled={simulatedBalance < (selectedLevel?.matchingContribution || 0)}
                                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm uppercase tracking-wider border-none"
                            >
                                {simulatedBalance < (selectedLevel?.matchingContribution || 0) 
                                    ? `Top Up £${((selectedLevel?.matchingContribution || 0) - simulatedBalance).toFixed(2)} to Unlock` 
                                    : "Yes, unlock these now"}
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                onClick={() => setIsUnlockModalOpen(false)}
                                className="w-full h-14 rounded-xl border-white/10 bg-transparent text-white font-bold text-sm uppercase tracking-wider hover:bg-white/5"
                            >
                                <ChevronUp className="w-4 h-4 mr-2" /> Continue to move to level {(selectedLevel?.level ?? 0) + 1}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-[#101415]/50 p-4 border-t border-white/5 text-center">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                            Secure Transaction • MCOM Protocol
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
