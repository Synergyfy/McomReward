'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle } from 'lucide-react';
import WishlistTable from '@/components/dashboard/wishlist-insights/WishlistTable';
import { wishlistData } from '@/lib/mock-data/wishlist';
import { exportToCsv } from '@/lib/utils';

export default function WishlistInsightsPage() {
  const handleExport = () => {
    exportToCsv(wishlistData, 'wishlist-insights.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Wishlist Insights</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Link href="/dashboard/campaigns/create?from=wishlist">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Campaign from Wishlist
            </Button>
          </Link>
        </div>
      </div>
      <WishlistTable wishlistItems={wishlistData} />
    </div>
  );
}
