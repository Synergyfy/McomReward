'use client';

import React, { useState } from 'react';
import { useGetCampaignAccess } from '@/services/campaign-access/hook';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CampaignAccessPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data: campaignAccessData, isLoading } = useGetCampaignAccess(page, limit);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5 text-primary">Campaign Access</h1>
      <p className="mb-5">View which customers have joined your campaigns.</p>

      {isLoading ? (
        <p>Loading campaign access data...</p>
      ) : !campaignAccessData || campaignAccessData.data.length === 0 ? (
        <p>No campaign access data available.</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Customer Email</TableHead>
                <TableHead>Campaign Joined</TableHead>
                <TableHead>Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignAccessData.data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.customer.name}</TableCell>
                  <TableCell>{record.customer.email}</TableCell>
                  <TableCell>{record.campaign.title}</TableCell>
                  <TableCell>{new Date(record.joinedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center items-center mt-4 space-x-4 p-4">
            <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <span>
              Page {page} of {Math.ceil(campaignAccessData.total / limit)}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === Math.ceil(campaignAccessData.total / limit)}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
