import React from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerActivity } from '@/lib/mock-data/activities';

interface ActivitiesTableProps {
  activities: CustomerActivity[];
  onViewDetails: (activity: CustomerActivity) => void;
}

const activityTypeColors: Record<CustomerActivity['activityType'], string> = {
  Redemption: 'bg-blue-100 text-blue-800',
  Referral: 'bg-green-100 text-green-800',
  Wishlist: 'bg-yellow-100 text-yellow-800',
};

export default function ActivitiesTable({ activities, onViewDetails }: ActivitiesTableProps) {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Activity Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium flex items-center">
                  <Image
                    src={activity.customer.avatarUrl}
                    alt={activity.customer.name}
                    width={32}
                    height={32}
                    className="rounded-full mr-3"
                  />
                  {activity.customer.name}
                </TableCell>
                <TableCell>
                  <Badge className={activityTypeColors[activity.activityType]}>
                    {activity.activityType}
                  </Badge>
                </TableCell>
                <TableCell>{activity.details}</TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onViewDetails(activity)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
