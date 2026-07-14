'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Zap } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

interface TrialBannerProps {
    planName: string;
    expiresAt: string;
}

export default function TrialBanner({ planName, expiresAt }: TrialBannerProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [progress, setProgress] = useState(100);

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

            const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in ms (assuming 7 day trial)
            // Ideally we'd know the start date too to calculate progress accurately, 
            // but we can approximate or just use time remaining ratio if we knew the start.
            // For now, let's just make the progress bar based on 7 days max.

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

    if (timeLeft === 'Expired') {
        return (
            <div className="bg-red-600 text-white px-4 py-3 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 animate-pulse" />
                        <span className="font-semibold">Your trial has ended. Upgrade to reactivate your account.</span>
                    </div>
                    <Link
                        href="/dashboard/subscription"
                        className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                        Upgrade Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-white/30 w-full">
                <div
                    className="h-full bg-yellow-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                        <Zap className="h-5 w-5 text-yellow-300" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm sm:text-base">
                            You are currently on a 7‑Day Trial of <span className="font-bold text-yellow-300">{planName}</span>
                        </p>
                        <p className="text-xs sm:text-sm text-indigo-100 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeLeft}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/subscription" // Or a specific features page
                        className="text-white/80 hover:text-white text-sm font-medium underline decoration-white/30 hover:decoration-white transition-all hidden sm:block"
                    >
                        See Full Benefits
                    </Link>
                    <Link
                        href="/dashboard/subscription"
                        className="bg-white text-indigo-600 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-yellow-300 hover:text-indigo-800 transition-all shadow-lg transform hover:-translate-y-0.5"
                    >
                        Upgrade Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
