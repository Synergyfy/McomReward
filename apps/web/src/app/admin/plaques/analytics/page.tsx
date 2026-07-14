'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Scan, Activity } from 'lucide-react';
import { mockPlaques } from '@/lib/mock-data/plaques';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, BarChart, Bar } from 'recharts';

export default function PlaqueAnalyticsPage() {
  // Calculate summary data
  const totalPlaquesIssued = mockPlaques.length;
  const totalActivePlaques = mockPlaques.filter(p => p.status === 'Active').length;
  const totalScanCounts = mockPlaques.reduce((sum, plaque) => sum + plaque.scanCounts, 0);
  const averageScansPerPlaque = totalPlaquesIssued > 0 ? (totalScanCounts / totalPlaquesIssued).toFixed(2) : 0;

  // Mock data for scans over time (daily for the last 7 days)
  const scansOverTimeData = useMemo(() => {
    const data: { date: string; scans: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
      // Simulate random scans for each day
      const scans = Math.floor(Math.random() * 500) + 100;
      data.push({ date: formattedDate, scans });
    }
    return data;
  }, []);

  // Top Performing Plaques (by scan count)
  // const topPerformingPlaques = useMemo(() => {
  //   return [...mockPlaques]
  //     .sort((a, b) => b.scanCounts - a.scanCounts)
  //     .slice(0, 5); // Top 5
  // }, [mockPlaques]);

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

      {/* Scans Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Scans Over Time (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={scansOverTimeData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="scans" stroke="#ea580c" name="Total Scans" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Plaques Table */}
      {/* <Card>
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
                    <TableCell>{plaque.ownerName}</TableCell>
                    <TableCell>{plaque.scanCounts.toLocaleString()}</TableCell>
                    <TableCell>{plaque.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
    </div>
  );
}
