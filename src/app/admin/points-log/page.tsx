'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockAdminTransactions, AdminPointTransaction } from '@/lib/mock-data/admin-transactions'; // Updated import

export default function PointsLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTransactionType, setFilterTransactionType] = useState('all'); // Renamed for clarity
  const [filterPointType, setFilterPointType] = useState('all'); // New state for point type filter
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const filteredTransactions = useMemo(() => {
    return mockAdminTransactions.filter(tx => {
      const matchesTransactionType = filterTransactionType === 'all' || tx.transactionType === filterTransactionType;
      const matchesPointType = filterPointType === 'all' || tx.pointType === filterPointType; // New filter logic

      const matchesSearch = tx.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tx.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (tx.campaign?.title && tx.campaign.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (tx.reward?.title && tx.reward.title.toLowerCase().includes(searchTerm.toLowerCase()));

      const txDate = new Date(tx.timestamp);
      const matchesDateRange = (!dateRange.from || txDate >= dateRange.from) &&
                               (!dateRange.to || txDate <= dateRange.to);

      return matchesTransactionType && matchesPointType && matchesSearch && matchesDateRange; // Combined filters
    });
  }, [searchTerm, filterTransactionType, filterPointType, dateRange]); // Added filterPointType to dependencies

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Points Transaction Log</h1>
        <p className="text-muted-foreground">A complete history of all point transactions.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex gap-4 flex-wrap">
              <Input
                placeholder="Search by customer or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm"
              />
              <Select value={filterTransactionType} onValueChange={setFilterTransactionType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transaction Types</SelectItem>
                  <SelectItem value="earned">Earned</SelectItem>
                  <SelectItem value="spent">Spent</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="referral_bonus">Referral</SelectItem>
                  <SelectItem value="manual_adjustment">Adjustment</SelectItem>
                  <SelectItem value="deal_redemption">Deal Redemption</SelectItem>
                </SelectContent>
              </Select>
              {/* New Select for Point Type */}
              <Select value={filterPointType} onValueChange={setFilterPointType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by point type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Point Types</SelectItem>
                  <SelectItem value="regular">Regular Points</SelectItem>
                  <SelectItem value="matching">Matching Points</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange(range || {})}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Campaign/Reward</TableHead>
                <TableHead>Transaction Type</TableHead> {/* Renamed for clarity */}
                <TableHead>Point Type</TableHead> {/* New TableHead */}
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="font-medium">{tx.customer.name}</div>
                    <div className="text-sm text-muted-foreground">{tx.customer.email}</div>
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>
                    {tx.campaign?.title || tx.reward?.title || '-'}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize bg-muted px-2 py-1 rounded-md text-xs">{tx.transactionType.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`capitalize px-2 py-1 rounded-md text-xs ${tx.pointType === 'matching' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {tx.pointType}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                  <TableCell className={`text-right font-bold ${tx.points < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.points > 0 ? '+' : ''}{tx.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
