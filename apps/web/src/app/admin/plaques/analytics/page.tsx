'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Scan, Activity } from 'lucide-react';
import { useGetAdminQrPlaques } from '@/services/qr-plaques/hook';
import LoadingSpinner from '@/components/ui/Loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PlaqueAnalyticsPage() {
  const { data, isLoading } = useGetAdminQrPlaques({ limit: 1000 });

  const plaques = data || [];

  const totalPlaquesIssued = plaques.length;
  const totalActivePlaques = plaques.filter(p => p.status === 'ACTIVE').length;
  const totalScanCounts = plaques.reduce((sum, plaque) => sum + (plaque.scans || 0), 0);
  const averageScansPerPlaque = totalPlaquesIssued > 0 ? (totalScanCounts / totalPlaquesIssued).toFixed(2) : 0;

  const topPerformingPlaques = useMemo(() => {
    return [...plaques]
      .sort((a, b) => (b.scans || 0) - (a.scans || 0))
      .slice(0, 5); // Top 5
  }, [plaques]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plaque Analytics Dashboard</h1>
        <p className="text-muted-foreground">Overview of plaque performance and usage.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plaques Issued</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlaquesIssued}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Plaques</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivePlaques}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Scans Per Plaque</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScansPerPlaque}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Plaques Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Performing Plaques</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plaque Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Total Scans</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformingPlaques.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No plaques to display.
                  </TableCell>
                </TableRow>
              ) : (
                topPerformingPlaques.map((plaque) => (
                  <TableRow key={plaque.id}>
                    <TableCell className="font-medium">{plaque.name}</TableCell>
                    <TableCell>{plaque.ownerName || '—'}</TableCell>
                    <TableCell>{(plaque.scans || 0).toLocaleString()}</TableCell>
                    <TableCell>{plaque.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}