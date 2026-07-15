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
  REWARD_REDEMPTION: 'bg-purple-100 text-purple-800',
  Earned: 'bg-green-100 text-green-800',
  Redeemed: 'bg-red-100 text-red-800',
  Adjusted: 'bg-yellow-100 text-yellow-800',
};

const formatActivityType = (type: string) => {
  if (!type) return 'Unknown';
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default function MatchingPointsHistoryTable({ history }: MatchingPointsHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Points Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto"><Table>
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
              history.map((activity) => {
                // Map properties (camelCase vs snake_case)
                const createdAt = activity.createdAt || activity.created_at;
                const activityType = activity.activityType || activity.activity_type || 'Unknown';
                const balanceAfter = activity.balanceAfter ?? activity.balance_after ?? 0;

                return (
                  <TableRow key={activity.id}>
                    <TableCell>{createdAt ? format(new Date(createdAt), 'MMM dd, yyyy') : '-'}</TableCell>
                    <TableCell>
                      <Badge className={activityTypeColors[activityType] || 'bg-gray-100 text-gray-800'}>
                        {formatActivityType(activityType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell className={activity.points > 0 ? 'text-green-600' : 'text-red-600'}>
                      {activity.points > 0 ? '+' : ''}{activity.points}
                    </TableCell>
                    <TableCell className="text-right font-medium">{balanceAfter}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No activity history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table></div>
      </CardContent>
    </Card>
  );
}
