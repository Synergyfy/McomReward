'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetPointLogs } from '@/services/analytics/hook';
import { format } from 'date-fns';

export default function PointsLogPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetPointLogs(page, limit);
  const pointLogs = data?.data || [];
  const totalLogs = data?.total || 0;
  const totalPages = Math.ceil(totalLogs / limit);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Points Transaction Log</h1>
        <p className="text-muted-foreground">A complete history of all point transactions.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <CardTitle>All Transactions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center p-8 text-red-500">
              Failed to load point logs. Please try again.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointLogs.length > 0 ? (
                    pointLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">{log.name}</div>
                          <div className="text-sm text-muted-foreground">{log.email}</div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize bg-muted px-2 py-1 rounded-md text-xs">
                            {log.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`capitalize px-2 py-1 rounded-md text-xs ${log.type === 'Matching' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                            {log.type}
                          </span>
                        </TableCell>
                        <TableCell>{format(new Date(log.date), 'PPpp')}</TableCell>
                        <TableCell className={`text-right font-bold ${log.points < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {log.points > 0 ? '+' : ''}{log.points}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-sm text-muted-foreground mr-4">
                  Page {page} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
