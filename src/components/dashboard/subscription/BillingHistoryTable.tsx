import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { BillingHistory } from '@/services/tiers/types';

interface BillingHistoryTableProps {
  history: BillingHistory[];
}

const statusDisplay: Record<string, { text: string; className: string; }> = {
  succeeded: { text: 'Paid', className: 'bg-green-100 text-green-800' },
  pending: { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  failed: { text: 'Failed', className: 'bg-red-100 text-red-800' },
};

const defaultStatus = { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };

export default function BillingHistoryTable({ history }: BillingHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => {
              const displayStatus = statusDisplay[item.status.toLowerCase()] || defaultStatus;
              return (
                <TableRow key={item.id}>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>£{item.amount}</TableCell>
                  <TableCell>
                    <Badge className={displayStatus.className}>{displayStatus.text}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
