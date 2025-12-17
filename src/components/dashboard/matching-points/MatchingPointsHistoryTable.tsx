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
import { MatchingPointHistoryItem, MatchingPointActivityType } from '@/services/matching-points/types';
import { format } from 'date-fns';

interface MatchingPointsHistoryTableProps {
  history: MatchingPointHistoryItem[];
}

const activityTypeColors: Record<MatchingPointActivityType | string, string> = {
  CAMPAIGN_CREATION: 'bg-blue-100 text-blue-800',
  REFERRAL: 'bg-green-100 text-green-800',
  MEMBERSHIP_PAYMENT: 'bg-indigo-100 text-indigo-800',
  MANUAL_ADJUSTMENT: 'bg-yellow-100 text-yellow-800',
  Earned: 'bg-green-100 text-green-800', // Fallback/Legacy
  Redeemed: 'bg-red-100 text-red-800', // Fallback/Legacy
  Adjusted: 'bg-yellow-100 text-yellow-800', // Fallback/Legacy
};

const formatActivityType = (type: string) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default function MatchingPointsHistoryTable({ history }: MatchingPointsHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Points Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Points</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history?.length > 0 ? (
              history.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.created_at ? format(new Date(activity.created_at), 'MMM dd, yyyy') : '-'}</TableCell>
                  <TableCell>
                    <Badge className={activityTypeColors[activity.activity_type] || 'bg-gray-100 text-gray-800'}>
                      {formatActivityType(activity.activity_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell className={activity.points > 0 ? 'text-green-600' : 'text-red-600'}>
                    {activity.points > 0 ? '+' : ''}{activity.points}
                  </TableCell>
                  <TableCell className="text-right font-medium">{activity.balance_after}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No activity history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

