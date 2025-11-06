import React from 'react';
import Link from 'next/link';
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
import { WishlistItem } from '@/lib/mock-data/wishlist';

interface WishlistTableProps {
  wishlistItems: WishlistItem[];
}

export default function WishlistTable({ wishlistItems }: WishlistTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Wished Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Occasion</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Target Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wishlistItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.itemName}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.occasion}</TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell>{item.targetDate}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/campaigns/create?from=wishlist&itemName=${encodeURIComponent(item.itemName)}`}>
                    <Button variant="outline" size="sm">Create Campaign</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
