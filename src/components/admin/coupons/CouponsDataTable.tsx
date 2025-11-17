
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coupon } from '@/services/coupon/types';
import { format } from 'date-fns';

interface CouponsDataTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
}

export function CouponsDataTable({ coupons, onEdit }: CouponsDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Expires At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow key={coupon.id}>
            <TableCell>{coupon.code}</TableCell>
            <TableCell>
              {coupon.discountType === 'percentage'
                ? `${coupon.discountValue}%`
                : `$${coupon.discountValue}`}
            </TableCell>
            <TableCell>{format(new Date(coupon.expiresAt), 'PPP')}</TableCell>
            <TableCell>
              <Badge variant={coupon.isActive ? 'default' : 'destructive'}>
                {coupon.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
