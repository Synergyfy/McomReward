'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PointHistoryRecord } from '@/services/wallet/types';

// --- Mock Data ---
const mockWalletData = { balance: 1250 };

const mockCampaignsData = {
  data: [
    { id: '1', title: 'Summer Bonanza' },
    { id: '2', title: 'Winter Wonderland Deals' },
    { id: '3', title: 'Loyalty Members Exclusive' },
  ],
};

const mockPointHistoryData: PointHistoryRecord[] = [
  { id: '1', timestamp: '2025-10-26T10:00:00Z', description: 'Joined campaign', type: 'earned', points: 100, campaign: { id: '1', title: 'Summer Bonanza' } },
  { id: '2', timestamp: '2025-10-25T14:30:00Z', description: 'Redeemed reward: Free Coffee', type: 'spent', points: 50 },
  { id: '3', timestamp: '2025-10-24T09:00:00Z', description: 'Joined campaign', type: 'earned', points: 150, campaign: { id: '2', title: 'Winter Wonderland Deals' } },
  { id: '4', timestamp: '2025-10-23T18:00:00Z', description: 'Manual adjustment by admin', type: 'earned', points: 20 },
  { id: '5', timestamp: '2025-10-22T11:00:00Z', description: 'Joined campaign', type: 'earned', points: 200, campaign: { id: '3', title: 'Loyalty Members Exclusive' } },
  { id: '6', timestamp: '2025-10-21T16:45:00Z', description: 'Redeemed reward: 10% Discount', type: 'spent', points: 100 },
  { id: '7', timestamp: '2025-10-20T12:00:00Z', description: 'Joined campaign', type: 'earned', points: 50, campaign: { id: '1', title: 'Summer Bonanza' } },
  { id: '8', timestamp: '2025-10-19T08:20:00Z', description: 'Joined campaign', type: 'earned', points: 100, campaign: { id: '2', title: 'Winter Wonderland Deals' } },
  { id: '9', timestamp: '2025-10-18T20:00:00Z', description: 'Redeemed reward: Free Shipping', type: 'spent', points: 120 },
  { id: '10', timestamp: '2025-10-17T13:10:00Z', description: 'Joined campaign', type: 'earned', points: 300, campaign: { id: '3', title: 'Loyalty Members Exclusive' } },
  { id: '11', timestamp: '2025-10-16T10:00:00Z', description: 'Welcome bonus', type: 'earned', points: 500 },
];
// --- End of Mock Data ---

export default function WalletPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Smaller limit for demonstration
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();

  const handleFilterChange = (campaignId: string) => {
    setPage(1); // Reset to first page on filter change
    setSelectedCampaignId(campaignId === 'all' ? undefined : campaignId);
  };

  const filteredHistory = useMemo(() => {
    if (!selectedCampaignId) {
      return mockPointHistoryData;
    }
    return mockPointHistoryData.filter(record => record.campaign?.id === selectedCampaignId);
  }, [selectedCampaignId]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredHistory.slice(startIndex, startIndex + limit);
  }, [filteredHistory, page, limit]);

  const totalPages = Math.ceil(filteredHistory.length / limit);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

      <Card className="max-w-sm mb-10">
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{mockWalletData.balance} Points</p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-5">Point History</h2>

      <div className="flex justify-end mb-4">
        <Select onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filter by campaign..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            {mockCampaignsData.data.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {paginatedHistory.length === 0 ? (
        <p>No point history found.</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>{record.description}</TableCell>
                  <TableCell>{record.campaign?.title || 'N/A'}</TableCell>
                  <TableCell className={`text-right font-semibold ${record.type === 'earned' ? 'text-green-500' : 'text-red-500'}`}>
                    {record.type === 'earned' ? '+' : '-'}{record.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center items-center mt-4 space-x-4 p-4">
            <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
