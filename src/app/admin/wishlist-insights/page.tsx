'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';
import { AudienceEstimateModal } from '@/components/admin/campaigns/AudienceEstimateModal';
import { useGetWishlistInsights } from '@/services/wishlist/hook';
import { WishlistAggregate } from '@/services/wishlist/types';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

type WishlistInsight = {
  itemName: string;
  category: string;
  estimatedCount: number;
  topDates: string;
  priorityDistribution: string;
  // Store original for reference if needed
  original?: WishlistAggregate; 
};

export default function WishlistInsightsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistInsight | null>(null);
  const { data: insightsData, isLoading: loading, error } = useGetWishlistInsights({ page: 1, limit: 100 });
  const { toast } = useToast();

  if (error) {
      console.error("Failed to fetch admin wishlist insights:", error);
      toast({
          title: "Error",
          description: "Failed to load wishlist insights. Please try again.",
          variant: "destructive",
      });
  }

  // Transform API data to Component state
  const insights: WishlistInsight[] = insightsData?.data?.map(item => ({
        itemName: item.itemName,
        category: item.category.name,
        estimatedCount: item.audienceSize,
        topDates: item.targetDates.filter(Boolean).slice(0, 3).join(', ') || 'N/A', // Show top 3 dates
        priorityDistribution: 'N/A', // API response doesn't currently include priority breakdown
        original: item
    })) || [];

  const handleCreateCampaignClick = (item: WishlistInsight) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmNavigation = () => {
    if (selectedItem) {
      router.push(`/admin/campaigns/create?itemName=${encodeURIComponent(selectedItem.itemName)}`);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">Wishlist Insights</h1>
          <p className="mt-4 text-lg text-gray-600">Customers waiting for your products.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Aggregated Wishlist Data</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Estimated Count</TableHead>
                    <TableHead>Top Dates</TableHead>
                    <TableHead>Priority Distribution</TableHead>
                    <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {insights.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                No wishlist insights available yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        insights.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.estimatedCount}</TableCell>
                            <TableCell>{item.topDates}</TableCell>
                            <TableCell>{item.priorityDistribution}</TableCell>
                            <TableCell>
                            <Button onClick={() => handleCreateCampaignClick(item)}>Create Campaign</Button>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
      {selectedItem && (
        <AudienceEstimateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmNavigation}
          audienceCount={selectedItem.estimatedCount}
        />
      )}
    </>
  );
}
