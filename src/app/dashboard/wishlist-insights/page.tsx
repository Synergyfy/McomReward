'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';
import { AudienceEstimateModal } from '@/components/dashboard/campaigns/AudienceEstimateModal';

type WishlistInsight = {
  itemName: string;
  category: string;
  estimatedCount: number;
  topDates: string;
  priorityDistribution: string;
};

const mockWishlistInsights: WishlistInsight[] = [
  {
    itemName: 'Gourmet Burger',
    category: 'Food',
    estimatedCount: 124,
    topDates: 'Oct, Nov',
    priorityDistribution: 'High: 60%, Medium: 30%, Low: 10%',
  },
  {
    itemName: 'Winter Jacket',
    category: 'Fashion',
    estimatedCount: 78,
    topDates: 'Dec, Jan',
    priorityDistribution: 'High: 40%, Medium: 50%, Low: 10%',
  },
  {
    itemName: 'Wireless Headphones',
    category: 'Electronics',
    estimatedCount: 210,
    topDates: 'N/A',
    priorityDistribution: 'High: 70%, Medium: 20%, Low: 10%',
  },
];

export default function WishlistInsightsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistInsight | null>(null);

  const handleCreateCampaignClick = (item: WishlistInsight) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmNavigation = () => {
    if (selectedItem) {
      router.push(`/dashboard/campaigns/create?itemName=${encodeURIComponent(selectedItem.itemName)}`);
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
                {mockWishlistInsights.map((item, index) => (
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
                ))}
              </TableBody>
            </Table>
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