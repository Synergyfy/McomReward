'use client';

import React, { useState } from 'react';
import { useGetCreditsBalance } from '@/services/cashback/hook';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    Coins,
    CheckCircle2,
    Info,
    ArrowRight,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface CashbackRedemptionProps {
    totalAmount: number;
    maxRedemptionPercent?: number; // e.g. 25 for 25%
    onApply: (appliedAmount: number) => void;
}

export default function CashbackRedemption({
    totalAmount,
    maxRedemptionPercent = 25,
    onApply
}: CashbackRedemptionProps) {
    const { data: balanceData } = useGetCreditsBalance();
    const availableBalance = balanceData?.availableCashback || 0;

    const maxRedeemableFromLimit = (totalAmount * maxRedemptionPercent) / 100;
    const maxPossibleRedemption = Math.min(availableBalance, maxRedeemableFromLimit);

    const [redeemAmount, setRedeemAmount] = useState(0);
    const [isApplied, setIsApplied] = useState(false);

    const handleApply = () => {
        if (redeemAmount > 0) {
            onApply(redeemAmount);
            setIsApplied(true);
            toast.success(`£${redeemAmount.toFixed(2)} rewards applied!`, {
                icon: <Sparkles className="w-4 h-4 text-amber-500" />,
                style: { borderRadius: '12px', border: '1px solid #e2e8f0' }
            });
        }
    };

    const handleReset = () => {
        onApply(0);
        setIsApplied(false);
        setRedeemAmount(0);
    };

    if (availableBalance <= 0) return null;

    return (
        <Card className={`overflow-hidden transition-all duration-500 ${isApplied ? 'border-green-200 bg-green-50/20 shadow-xl' : 'border-orange-100 shadow-2xl shadow-orange-500/5'}`}>
            <CardContent className="p-0">
                <div className={`p-5 flex items-center justify-between transition-colors duration-500 ${isApplied ? 'bg-green-50/50 border-b border-green-100' : 'bg-slate-50 border-b border-orange-50'}`}>
                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={isApplied ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}}
                            className={`p-2.5 rounded-2xl shadow-sm ${isApplied ? 'bg-green-100 text-green-600' : 'bg-orange-600 text-white'}`}
                        >
                            <Coins className="w-5 h-5" />
                        </motion.div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 tracking-tight">MCOM Wallet Credits</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Balance: £{availableBalance.toFixed(2)}</p>
                        </div>
                    </div>
                    {isApplied ? (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="px-3 py-1 bg-green-600 text-white rounded-full text-[10px] font-semibold uppercase">
                                -£{redeemAmount.toFixed(2)}
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-3 text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors uppercase">
                                Edit
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-300">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-semibold uppercase tracking-tighter">Verified Funds</span>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {!isApplied ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-8 space-y-8"
                        >
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">Redeemable Today</p>
                                        <p className="text-3xl font-semibold text-slate-900 tracking-tighter">£{redeemAmount.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-widest mb-1">Savings Impact</p>
                                        <p className="text-sm font-semibold text-orange-600">{((redeemAmount / totalAmount) * 100).toFixed(1)}% OFF</p>
                                    </div>
                                </div>

                                <Slider
                                    value={[redeemAmount]}
                                    onValueChange={(vals) => setRedeemAmount(vals[0])}
                                    max={maxPossibleRedemption}
                                    step={0.01}
                                    className="py-4"
                                />

                                <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase tracking-[0.1em]">
                                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">MIN: £0.00</span>
                                    <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">PLATFORM CAP: £{maxPossibleRedemption.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                                <div className="p-1.5 bg-white rounded-lg border border-slate-100 shrink-0 shadow-sm">
                                    <Info className="w-4 h-4 text-orange-600" />
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">
                                    Applying rewards will instantly reduce your payment due. These funds are originating from your claimed credits.
                                </p>
                            </div>

                            <Button
                                className="w-full h-14 font-semibold text-sm uppercase tracking-widest shadow-2xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-orange-600 hover:bg-orange-700 rounded-2xl"
                                disabled={redeemAmount <= 0}
                                onClick={handleApply}
                            >
                                Apply Reward <ArrowRight className="w-5 h-5 ml-3" />
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-10 flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-slate-800 uppercase tracking-tighter">Reward Success</p>
                                <p className="text-xs font-medium text-slate-500 mt-1">Your total checkout cost has been updated.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
