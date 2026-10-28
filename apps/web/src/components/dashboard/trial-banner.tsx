'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

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
