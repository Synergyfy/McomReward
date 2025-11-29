import React from 'react';
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
  onPageChange: (newPage: number) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filterCategories: string[];
}

export function TransactionHistoryTable({
  transactions,
  isLoading,
  page,
  totalPages,
  onPageChange,
  activeFilter,
  onFilterChange,
  filterCategories,
}: TransactionHistoryTableProps) {

  const getIconForTransaction = (transaction: ParticipantHistoryItem) => {
    if (transaction.type === 'EARN') {
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
                onClick={() => onFilterChange(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading history...</div>
        ) : transactions.length === 0 ? (
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
                  <TableHead className="w-2/12 text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{getIconForTransaction(record)}</TableCell>
                    <TableCell>
                      <p className="font-semibold">{record.description}</p>
                      <p className="text-xs text-gray-500">{record.campaign?.name}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.type === 'EARN' ? 'default' : 'secondary'}>
                        {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className={`text-right font-bold ${record.type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                      {record.type === 'EARN' ? '+' : '-'}{record.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-center items-center mt-6 space-x-4 p-4 border-t">
              <Button onClick={() => onPageChange(page - 1)} disabled={page === 1} variant="outline">
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
