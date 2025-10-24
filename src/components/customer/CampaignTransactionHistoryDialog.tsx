'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useGetPointHistory } from '@/services/wallet/hook';

interface CampaignTransactionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
}

export default function CampaignTransactionHistoryDialog({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
}: CampaignTransactionHistoryDialogProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const { data: historyData, isLoading } = useGetPointHistory(page, limit, campaignId);

  const totalPages = historyData ? Math.ceil(historyData.total / limit) : 1;

  const getIconForType = (type: 'earned' | 'spent') => {
    if (type === 'earned') {
      return <ArrowUp className="w-5 h-5 text-green-500" />;
    }
    return <ArrowDown className="w-5 h-5 text-red-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transaction History for {campaignTitle}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <p className="text-center">Loading history...</p>
          ) : historyData?.data.length === 0 ? (
            <p className="text-center text-gray-500">No transactions found for this campaign.</p>
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
                  {historyData?.data.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getIconForType(record.type)}</TableCell>
                      <TableCell>
                        <p className="font-semibold">{record.description}</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
