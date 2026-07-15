'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle, Loader2 } from 'lucide-react';
import WishlistTable from '@/components/dashboard/wishlist-insights/WishlistTable';
import { exportToCsv } from '@/lib/export';
import { useGetWishlistInsights } from '@/services/wishlist/hook';
import { WishlistAggregate } from '@/services/wishlist/types';
import { toast } from 'sonner';

// Adapter to match WishlistTable expected props
const adaptToTableItem = (item: WishlistAggregate) => ({
  id: item.id,
  itemName: item.itemName,
  category: item.category.name,
  occasion: 'Various', // Aggregated data doesn't have single occasion
  count: item.audienceSize,
  targetDate: item.targetDates.filter(Boolean).join(', ') || 'N/A',
});

export default function WishlistInsightsPage() {
  const { data: insightsData, isLoading: loading, error } = useGetWishlistInsights({ page: 1, limit: 100 });

  const data = insightsData?.data?.map(adaptToTableItem) || [];

  if (error) {
      console.error("Failed to fetch wishlist insights:", error);
      toast.error("Failed to load insights. Please try again.");
  }

  const handleExport = () => {
    // Flatten data for CSV export
    const csvData = data.map(item => ({
        ...item
    }));
    exportToCsv(csvData, 'wishlist-insights.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Wishlist Insights</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} disabled={loading || data.length === 0} className="flex-1 sm:flex-none text-xs sm:text-sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/campaigns/create?from=wishlist" className="flex-1 sm:flex-none">
            <Button className="w-full text-xs sm:text-sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <WishlistTable wishlistItems={data} /> 
      )}
    </div>
  );
}
