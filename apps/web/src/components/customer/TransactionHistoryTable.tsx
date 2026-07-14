import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { ParticipantHistoryItem } from '@/services/customer-campaigns/types';

interface TransactionHistoryTableProps {
  transactions: ParticipantHistoryItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  historyType: 'both' | 'points' | 'stamps';
  onHistoryTypeChange: (type: 'both' | 'points' | 'stamps') => void;
}

const filterCategories = [
  'All',
  'Earned',
  'Spent',
];

const historyTypeFilters: { label: string; value: 'both' | 'points' | 'stamps' }[] = [
  { label: 'Both', value: 'both' },
  { label: 'Points Only', value: 'points' },
  { label: 'Stamps Only', value: 'stamps' },
];

export function TransactionHistoryTable({
  transactions,
  isLoading,
  page,
  totalPages,
  onPageChange,
  historyType,
  onHistoryTypeChange
}: TransactionHistoryTableProps) {

  const [activeFilter, setActiveFilter] = useState('All');

  const filteredTransactions = transactions.filter(record => {
    const isEarn = record.type === 'EARN' || record.type === 'STAMP_EARN' || record.type === 'MATCHING';
    const isSpend = record.type === 'REDEEM' || record.type === 'STAMP_REDEEM';
    
    if (activeFilter === 'Earned') return isEarn;
    if (activeFilter === 'Spent') return isSpend;
    return true;
  });

  const getIconForTransaction = (transaction: ParticipantHistoryItem) => {
    const isEarn = transaction.type === 'EARN' || transaction.type === 'STAMP_EARN' || transaction.type === 'MATCHING';
    if (isEarn) {
      return <ArrowUp className="w-5 h-5 text-green-500" />;
    }
    return <ArrowDown className="w-5 h-5 text-red-500" />;
  };

  const isStampType = (type: string) => type.includes('STAMP');

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">History</CardTitle>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              {filterCategories.map(filter => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'outline'}
                  className="rounded-full text-xs px-3 py-1"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium self-center text-gray-500 mr-2">Show:</span>
            {historyTypeFilters.map(filter => (
              <Button
                key={filter.value}
                variant={historyType === filter.value ? 'secondary' : 'ghost'}
                className="rounded-md text-xs px-3 py-1 h-8"
                onClick={() => onHistoryTypeChange(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading history...</div>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions found.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/12"></TableHead>
                  <TableHead className="w-4/12">Description</TableHead>
                  <TableHead className="w-2/12">Type</TableHead>
                  <TableHead className="w-3/12">Date</TableHead>
                  <TableHead className="w-2/12 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((record) => {
                  const isEarn = record.type === 'EARN' || record.type === 'STAMP_EARN' || record.type === 'MATCHING';
                  const isStamp = isStampType(record.type);
                  const amount = isStamp ? record.stamps : record.points;
                  const unit = isStamp ? 'Stamps' : 'Points';
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell>{getIconForTransaction(record)}</TableCell>
                      <TableCell>
                        <p className="font-semibold">{record.description}</p>
                        <p className="text-xs text-gray-500">{record.campaign?.name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isEarn ? 'default' : 'secondary'} className={isStamp ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}>
                          {record.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className={`text-right font-bold ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
                        {isEarn ? '+' : '-'}{amount} <span className="text-[10px] font-normal text-gray-400">{unit}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex justify-center items-center mt-6 space-x-4 p-4 border-t">
              <Button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} variant="outline">
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages || 1}
              </span>
              <Button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} variant="outline">
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
