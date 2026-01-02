'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetDetailedCampaignAnalytics } from '@/services/campaigns/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { Loader2, Download, ArrowLeft, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, subDays, isAfter, isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CampaignAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = Array.isArray(params.campaignId) ? params.campaignId[0] : params.campaignId;
  const [dateRange, setDateRange] = useState('all');

  const { data: analytics, isLoading, error } = useGetDetailedCampaignAnalytics(campaignId as string);

  const filteredChartData = useMemo(() => {
    if (!analytics?.weeklyChartData) return [];

    const now = new Date();
    let startDate: Date | null = null;

    if (dateRange === '7days') startDate = subDays(now, 7);
    if (dateRange === '30days') startDate = subDays(now, 30);
    if (dateRange === '90days') startDate = subDays(now, 90);

    if (!startDate) return analytics.weeklyChartData;

    return analytics.weeklyChartData.filter(item => {
      // Assuming item.date is YYYY-MM-DD or ISO string
      const itemDate = parseISO(item.date);
      return isAfter(itemDate, startDate!);
    });
  }, [analytics?.weeklyChartData, dateRange]);

  const handleDownload = (filename: string, data: any[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Failed to load analytics</div>;
  if (!analytics) return null;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Campaign Analysis</h1>
        </div>
        <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalParticipants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRewardsRedeemed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPointsAwarded || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.redemptionRate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={filteredChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="pointsAwarded" stroke="#8884d8" name="Points Awarded" />
              <Line yAxisId="right" type="monotone" dataKey="rewardsRedeemed" stroke="#82ca9d" name="Redemptions" />
              <Line yAxisId="right" type="monotone" dataKey="newParticipants" stroke="#ffc658" name="New Participants" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Rewards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Rewards</CardTitle>
            <Button size="sm" variant="outline" onClick={() => handleDownload('top_rewards', analytics.topRewards)}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topRewards} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="rTitle" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalRedemptions" fill="#82ca9d" name="Redemptions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Participants */}
        <Card>
           <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Participants</CardTitle>
             <Button size="sm" variant="outline" onClick={() => handleDownload('top_participants', analytics.rankedParticipants)}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Redemptions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.rankedParticipants.slice(0, 5).map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">{participant.pName}</TableCell>
                    <TableCell className="text-right">{participant.totalPointsEarned}</TableCell>
                    <TableCell className="text-right">{participant.totalRedemptions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
