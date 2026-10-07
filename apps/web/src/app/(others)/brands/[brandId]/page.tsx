"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Affiliate brand detail pages were retired: brand catalog now comes from
// live business campaigns. Redirect to the marketplace.
export default function BrandDetails() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/brands');
  }, [router]);
  return <p className="max-w-7xl mx-auto px-6 py-8 text-sm text-gray-500">Redirecting to brands…</p>;
}
