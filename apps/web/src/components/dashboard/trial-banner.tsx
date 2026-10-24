'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Zap, CheckCircle2, ListTodo, ExternalLink, ArrowRight } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { ProgrammeTask } from '@/services/mcom-packages';


interface TrialBannerProps {
    planName: string;
    expiresAt: string;
    tasks?: ProgrammeTask[];
    upgradeUrl?: string;
}


export function OnboardingReminderBanner() {
    return (
        <div className="border-b border-orange-200 bg-gradient-to-r from-orange-50 via-white to-amber-50 px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                        <Zap className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-900">Your MCOM Rewards setup is waiting</p>
                        <p className="mt-0.5 text-sm text-slate-600">Continue setting up your rewards programme whenever you’re ready.</p>
                    </div>
                </div>
                <Link href="/loyalty-setup" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
                    Set up your rewards
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

export default function TrialBanner({ planName, expiresAt, tasks = [], upgradeUrl }: TrialBannerProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [progress, setProgress] = useState(100);

    const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
    const hasTasks = tasks.length > 0;

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const expirationDate = new Date(expiresAt);

            // If expired
            if (now >= expirationDate) {
                setTimeLeft('Expired');
                setProgress(0);
                return;
            }

            const totalDuration = 14 * 24 * 60 * 60 * 1000; // up to 14 days
            const timeRemaining = expirationDate.getTime() - now.getTime();
            const calculatedProgress = Math.min(100, Math.max(0, (timeRemaining / totalDuration) * 100));
            setProgress(calculatedProgress);

            const days = differenceInDays(expirationDate, now);
            const hours = differenceInHours(expirationDate, now) % 24;

            if (days > 0) {
                setTimeLeft(`${days} Days ${hours} Hours Remaining`);
            } else {
                const minutes = differenceInMinutes(expirationDate, now) % 60;
                setTimeLeft(`${hours} Hours ${minutes} Minutes Remaining`);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [expiresAt]);

    const targetUpgradeHref = upgradeUrl || '/dashboard/subscription';
    const isExternalUpgrade = Boolean(upgradeUrl && upgradeUrl.startsWith('http'));

    if (timeLeft === 'Expired') {
        return (
            <div className="bg-red-600 text-white px-4 py-3 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 animate-pulse" />
                        <span className="font-semibold">Your trial period has ended. Upgrade to reactivate your account.</span>
                    </div>
                    {isExternalUpgrade ? (
                        <a
                            href={targetUpgradeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap flex items-center gap-1.5"
                        >
                            <span>Upgrade on MCOM Central</span>
                            <ExternalLink size={14} />
                        </a>
                    ) : (
                        <Link
                            href="/dashboard/subscription"
                            className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
                        >
                            Upgrade Now
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white px-4 sm:px-6 py-3.5 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-white/30 w-full">
                <div
                    className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full flex-shrink-0">
                        <Zap className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-sm sm:text-base">
                                Active Trial: <span className="font-bold text-amber-300">{planName}</span>
                            </p>
                            {hasTasks && (
                                <span className="bg-white/20 text-white border border-white/20 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <ListTodo size={12} />
                                    <span>{completedTasksCount}/{tasks.length} Tasks</span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-indigo-100 flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{timeLeft}</span>
                            {hasTasks && (
                                <>
                                    <span>•</span>
                                    <span>Complete onboarding tasks to earn reward points</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 self-end md:self-auto">
                    {hasTasks && (
                        <Link
                            href="/dashboard/subscription#tasks"
                            className="text-white/90 hover:text-white text-xs sm:text-sm font-medium underline decoration-white/40 hover:decoration-white transition-all flex items-center gap-1"
                        >
                            <span>View Tasks</span>
                        </Link>
                    )}
                    {isExternalUpgrade ? (
                        <a
                            href={targetUpgradeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-indigo-700 px-4 py-2 rounded-full font-bold text-xs sm:text-sm hover:bg-amber-300 hover:text-indigo-900 transition-all shadow-md flex items-center gap-1.5"
                        >
                            <span>Upgrade</span>
                            <ExternalLink size={13} />
                        </a>
                    ) : (
                        <Link
                            href="/dashboard/subscription"
                            className="bg-white text-indigo-700 px-4 py-2 rounded-full font-bold text-xs sm:text-sm hover:bg-amber-300 hover:text-indigo-900 transition-all shadow-md"
                        >
                            Upgrade Now
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

