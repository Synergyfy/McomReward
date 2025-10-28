import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Assuming Badge component exists
import { ArrowDown, ArrowUp, Gift, ShoppingCart, Users, Award, Tag, Star } from 'lucide-react';
import { Transaction } from '@/lib/mock-data/wallet'; // Import the Transaction interface

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const filterCategories = [
  'All',
  'Regular',
  'Matching',
  'Earned',
  'Spent',
  'Purchase',
  'Referral Bonus',
  'Manual Adjustment',
  'Deal Redemption'
];

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredHistory = useMemo(() => {
    let history = transactions;

    if (activeFilter === 'Regular') {
      history = history.filter(record => record.type === 'regular');
    } else if (activeFilter === 'Matching') {
      history = history.filter(record => record.type === 'matching');
    } else if (activeFilter === 'Earned') {
      history = history.filter(record => record.points > 0);
    } else if (activeFilter === 'Spent') {
      history = history.filter(record => record.points < 0);
    } else if (activeFilter === 'Purchase') {
        history = history.filter(record => record.description.toLowerCase().includes('purchase'));
    } else if (activeFilter === 'Referral Bonus') {
        history = history.filter(record => record.description.toLowerCase().includes('referral bonus'));
    } else if (activeFilter === 'Manual Adjustment') {
        history = history.filter(record => record.description.toLowerCase().includes('admin bonus'));
    } else if (activeFilter === 'Deal Redemption') {
        history = history.filter(record => record.description.toLowerCase().includes('deal redemption'));
    }
    // 'All' filter is handled by default

    return history;
  }, [transactions, activeFilter]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredHistory.slice(startIndex, startIndex + limit);
  }, [filteredHistory, page, limit]);

  const totalPages = Math.ceil(filteredHistory.length / limit);

  const getIconForTransaction = (transaction: Transaction) => {
    if (transaction.type === 'matching') {
      return <Star className="w-5 h-5 text-yellow-500" />;
    }
    if (transaction.points > 0) {
      return <ArrowUp className="w-5 h-5 text-green-500" />;
    }
    return <ArrowDown className="w-5 h-5 text-red-500" />;
  };

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">Point History</CardTitle>
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
                  <TableHead className="w-4/12">Description</TableHead>
                  <TableHead className="w-2/12">Type</TableHead> {/* New column for type */}
                  <TableHead className="w-3/12">Date</TableHead>
                  <TableHead className="w-2/12 text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{getIconForTransaction(record)}</TableCell>
                    <TableCell>
                      <p className="font-semibold">{record.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.type === 'matching' ? 'secondary' : 'default'}>
                        {record.type === 'matching' ? 'Matching' : 'Regular'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell className={`text-right font-bold ${record.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {record.points > 0 ? '+' : ''}{record.points}
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
  );
}
