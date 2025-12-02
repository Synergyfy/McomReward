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
import { Badge } from '@/components/ui/badge';
import { ReferredBusiness } from '@/services/affiliate/types';

interface ReferralsHistoryTableProps {
  referrals: ReferredBusiness[];
}

export default function ReferralsHistoryTable({ referrals }: ReferralsHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Date Referred</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral, index) => (
              <TableRow key={index}> {/* Using index as key, consider a unique ID if available */}
                <TableCell className="font-medium">{referral.name}</TableCell>
                <TableCell>{new Date(referral.referredAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={referral.status === 'completed' ? 'default' : 'outline'}>
                    {referral.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
