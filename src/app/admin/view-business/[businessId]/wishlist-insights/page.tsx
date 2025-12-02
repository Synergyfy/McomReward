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
import { useParams } from 'next/navigation'; // Import useParams

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
  const params = useParams();
  const businessId = params.businessId as string; // Extract businessId from URL

  const { data: insightsData, isLoading: loading, error } = useGetWishlistInsights({ page: 1, limit: 100, businessId });

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Wishlist Insights</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={loading || data.length === 0}>
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
