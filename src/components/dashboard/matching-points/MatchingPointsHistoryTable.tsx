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
import { MatchingPointActivity } from '@/lib/mock-data/matchingPoints';

interface MatchingPointsHistoryTableProps {
  history: MatchingPointActivity[];
}

const activityTypeColors: Record<MatchingPointActivity['type'], string> = {
  Earned: 'bg-green-100 text-green-800',
  Redeemed: 'bg-red-100 text-red-800',
  Adjusted: 'bg-yellow-100 text-yellow-800',
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
            {history.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.date}</TableCell>
                <TableCell>
                  <Badge className={activityTypeColors[activity.type]}>
                    {activity.type}
                  </Badge>
                </TableCell>
                <TableCell>{activity.description}</TableCell>
                <TableCell className={activity.points > 0 ? 'text-green-600' : 'text-red-600'}>
                  {activity.points > 0 ? '+' : ''}{activity.points}
                </TableCell>
                <TableCell className="text-right font-medium">{activity.balance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
