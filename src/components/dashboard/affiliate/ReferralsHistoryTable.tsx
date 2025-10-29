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
import { Referral } from '@/lib/mock-data/affiliate';

interface ReferralsHistoryTableProps {
  referrals: Referral[];
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
              <TableHead>Date Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Reward</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell className="font-medium">{referral.businessName}</TableCell>
                <TableCell>{referral.joinDate}</TableCell>
                <TableCell>
                  <Badge variant={referral.status === 'Completed' ? 'default' : 'outline'}>
                    {referral.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{referral.reward > 0 ? `${referral.reward} pts` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
