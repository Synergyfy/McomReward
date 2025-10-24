'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PointHistoryRecord } from '@/services/wallet/types';
import { ArrowDown, ArrowUp, Gift, ShoppingCart } from 'lucide-react';

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
    { id: '1', timestamp: '2025-10-26T10:00:00Z', description: 'Joined Summer Bonanza', type: 'earned', points: 100, campaign: { id: '1', title: 'Summer Bonanza' } },
    { id: '2', timestamp: '2025-10-25T14:30:00Z', description: 'Redeemed: Free Coffee', type: 'spent', points: 50 },
    { id: '3', timestamp: '2025-10-24T09:00:00Z', description: 'Joined Winter Wonderland', type: 'earned', points: 150, campaign: { id: '2', title: 'Winter Wonderland Deals' } },
    { id: '4', timestamp: '2025-10-23T18:00:00Z', description: 'Admin bonus', type: 'earned', points: 20 },
    { id: '5', timestamp: '2025-10-22T11:00:00Z', description: 'Joined Loyalty Exclusive', type: 'earned', points: 200, campaign: { id: '3', title: 'Loyalty Members Exclusive' } },
    { id: '6', timestamp: '2025-10-21T16:45:00Z', description: 'Redeemed: 10% Discount', type: 'spent', points: 100 },
    { id: '11', timestamp: '2025-10-16T10:00:00Z', description: 'Welcome bonus', type: 'earned', points: 500 },
  ];
// --- End of Mock Data ---

const filterCategories = ['All', 'Earned', 'Spent'];

export default function WalletPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'All') {
      return mockPointHistoryData;
    }
    return mockPointHistoryData.filter(record => record.type === activeFilter.toLowerCase());
  }, [activeFilter]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredHistory.slice(startIndex, startIndex + limit);
  }, [filteredHistory, page, limit]);

  const totalPages = Math.ceil(filteredHistory.length / limit);

  const getIconForType = (type: 'earned' | 'spent') => {
    if (type === 'earned') {
      return <ArrowUp className="w-5 h-5 text-green-500" />;
    }
    return <ArrowDown className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">My Wallet</h1>
          <p className="mt-4 text-lg text-gray-600">Your points balance and transaction history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Balance Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl rounded-2xl overflow-hidden bg-orange-600 text-white">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <h2 className="text-lg font-semibold opacity-80 mb-2">Total Balance</h2>
                <div className="flex items-center">
                  <Gift className="w-12 h-12 mr-4 opacity-90" />
                  <span className="text-5xl font-bold tracking-tight">{mockWalletData.balance}</span>
                </div>
                <p className="mt-2 opacity-80">Points</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Point History */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg rounded-2xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">Point History</CardTitle>
                  <div className="flex space-x-2">
                    {filterCategories.map(filter => (
                      <Button
                        key={filter}
                        variant={activeFilter === filter ? 'default' : 'outline'}
                        className="rounded-full"
                        onClick={() => setActiveFilter(filter)}
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {paginatedHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No transactions found for this filter.</p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/12"></TableHead>
                          <TableHead className="w-5/12">Description</TableHead>
                          <TableHead className="w-4/12">Date</TableHead>
                          <TableHead className="w-2/12 text-right">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{getIconForType(record.type)}</TableCell>
                            <TableCell>
                                <p className="font-semibold">{record.description}</p>
                                {record.campaign && <p className="text-sm text-gray-500">{record.campaign.title}</p>}
                            </TableCell>
                            <TableCell>{new Date(record.timestamp).toLocaleDateString()}</TableCell>
                            <TableCell className={`text-right font-bold ${record.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                              {record.type === 'earned' ? '+' : '-'}{record.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex justify-center items-center mt-6 space-x-4 p-4 border-t">
                      <Button onClick={() => setPage(page - 1)} disabled={page === 1} variant="outline">
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                      </span>
                      <Button onClick={() => setPage(page + 1)} disabled={page === totalPages} variant="outline">
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
