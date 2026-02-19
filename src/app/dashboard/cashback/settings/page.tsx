'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
    Settings2,
    Save,
    RefreshCcw,
    Info,
    TrendingUp,
    Percent,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function MerchantCreditsSettingsPage() {
    const [rewardPercent, setRewardPercent] = useState(5);
    const [redemptionLimit, setRedemptionLimit] = useState(25);
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        setIsSaving(false);
        toast.success('Credit configuration updated successfully!');
    };

    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Credit Configuration</h1>
                <p className="text-muted-foreground font-medium">Control how your customers earn credits and redeem rewards for your services.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Main Settings Form */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-50/80 border-b pb-6">
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                                <Settings2 className="w-5 h-5 text-orange-600" />
                                Reward Policy
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">
                                Set the percentage and limits for your internal credits ecosystem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-10">
                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                                <div className="space-y-1">
                                    <Label htmlFor="active-status" className="text-base font-semibold text-orange-900">Loyalty Program Active</Label>
                                    <p className="text-xs font-medium text-orange-700/70">When disabled, customers won't earn credits from your services.</p>
                                </div>
                                <Switch
                                    id="active-status"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>

                            {/* Percent Slider */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Percent className="w-4 h-4 text-slate-500" />
                                        <Label className="font-semibold uppercase text-[10px] tracking-widest text-slate-500">Credit Earning Rate</Label>
                                    </div>
                                    <Badge variant="secondary" className="text-xl px-4 py-1.5 font-semibold bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100">
                                        {rewardPercent}%
                                    </Badge>
                                </div>
                                <Slider
                                    value={[rewardPercent]}
                                    onValueChange={(vals) => setRewardPercent(vals[0])}
                                    max={25}
                                    step={0.5}
                                    className="py-4"
                                />
                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Typical rates are between 3% and 10%. Higher rates drive significantly more repeat bookings through the credit matching system.
                                    </p>
                                </div>
                            </div>

                            {/* Redemption Limit */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-slate-500" />
                                        <Label className="font-semibold uppercase text-[10px] tracking-widest text-slate-500">Max Wallet Usage</Label>
                                    </div>
                                    <Badge variant="outline" className="text-xl px-4 py-1.5 font-semibold border-slate-200 text-slate-700 rounded-xl">
                                        {redemptionLimit}%
                                    </Badge>
                                </div>
                                <Slider
                                    value={[redemptionLimit]}
                                    onValueChange={(vals) => setRedemptionLimit(vals[0])}
                                    max={100}
                                    step={5}
                                    className="py-4"
                                />
                                <p className="text-xs text-slate-400 font-medium">
                                    Limits the percentage of a total bill that can be paid using claimed wallet funds.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            className="flex-1 h-14 text-sm font-semibold uppercase tracking-widest shadow-xl shadow-orange-200 bg-orange-600 hover:bg-orange-700 transition-all active:scale-95 text-white border-none"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Configuration
                                </>
                            )}
                        </Button>
                        <Button variant="outline" className="h-14 px-8 border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50">
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative group">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                                <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
                                ROI Prediction
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">Est. Customer Retention</p>
                                <p className="text-4xl font-semibold text-white mt-1 group-hover:text-orange-300 transition-colors">+12.4%</p>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '12%' }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.5)]"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic opacity-70">
                                "Based on your {rewardPercent}% rate, we predict a strong increase in customer lifetime value."
                            </p>
                        </CardContent>
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                            <TrendingUp className="w-32 h-32 rotate-12" />
                        </div>
                    </Card>

                    <Card className="border-orange-100 bg-orange-50/30 overflow-hidden">
                        <CardHeader className="pb-3 bg-orange-50/50 border-b border-orange-100">
                            <CardTitle className="text-[10px] font-semibold text-orange-900 flex items-center gap-2 uppercase tracking-widest">
                                <Info className="w-3 h-3" />
                                Platform Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ul className="text-[10px] text-orange-800/80 space-y-3 font-medium leading-relaxed">
                                <li className="flex gap-2">
                                    <span className="shrink-0">•</span>
                                    <span>Rewards are issued as non-fiscal platform credits.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="shrink-0">•</span>
                                    <span>Settlement occurs only when users claim credits through matching contribution.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="shrink-0">•</span>
                                    <span>Changes take effect immediately for all subsequent transactions.</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
