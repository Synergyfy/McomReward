'use client';

import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SubscriptionPage() {
  useEffect(() => {
    const solutionsUrl = process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'https://mcomsolutions.vercel.app';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const callbackUrl = encodeURIComponent(`${appUrl}/dashboard`);

    window.location.replace(`${solutionsUrl}/getstarted/business?source=mcomloyalty&redirect=${callbackUrl}`);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      <h1 className="text-xl font-bold text-gray-955 font-sans">Redirecting to Central Billing...</h1>
      <p className="text-gray-500 text-xs font-sans">Please wait while we securely transfer you to McomSolutions.</p>
    </div>
  );
}
