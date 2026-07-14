'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Snowflake, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanTypeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectType: (type: 'standard' | 'seasonal') => void;
}

export function PlanTypeSelectionModal({ isOpen, onClose, onSelectType }: PlanTypeSelectionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border-0 shadow-2xl">
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-50/50 via-white to-rose-50/50 dark:from-orange-950/20 dark:via-zinc-950 dark:to-rose-950/20" />

                <div className="relative z-10 p-8 sm:p-12">
                    <DialogHeader className="mb-8 text-center p-4">
                        <DialogTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-600 dark:from-orange-400 dark:to-rose-400">
                            Choose Plan Type
                        </DialogTitle>
                        <DialogDescription className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-lg mx-auto">
                            Select the type of subscription plan you want to create for your users.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid md:grid-cols-2 gap-6">
                        <button
                            onClick={() => onSelectType('standard')}
                            className="group relative flex flex-col items-start p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 text-left"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-5 w-5 text-orange-500 transform group-hover:translate-x-1 transition-transform" />
                            </div>

                            <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                Standard Plan
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                                Recurring subscription plan billed monthly, quarterly, or annually. Includes trial period configuration.
                            </p>
                        </button>

                        <button
                            onClick={() => onSelectType('seasonal')}
                            className="group relative flex flex-col items-start p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 text-left"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-5 w-5 text-rose-500 transform group-hover:translate-x-1 transition-transform" />
                            </div>

                            <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Snowflake className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                Seasonal Plan
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                                Time-limited plan for specific seasons or events. Fixed duration with start and end dates. No trial period.
                            </p>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
