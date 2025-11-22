'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useGrowthActivityChart, useSystemOverview, useTopBusinesses, useTopRewards } from '@/services/analytics/hook';
import {
  pointsDistributionData,
  consumerGrowthData,
  businessTierData,
  conversionRetentionData,
} from '@/lib/mock-data/reports';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function ReportingAnalyticsPage() {
  const { data: systemOverview, isLoading: isLoadingSystemOverview, error: systemOverviewError } = useSystemOverview();
  const { data: topBusinesses, isLoading: isLoadingTopBusinesses, error: topBusinessesError } = useTopBusinesses();
  const { data: topRewards, isLoading: isLoadingTopRewards, error: topRewardsError } = useTopRewards();
  const { data: growthData, isLoading: isLoadingGrowthData, error: growthDataError } = useGrowthActivityChart();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const chartData = React.useMemo(() => {
    if (!growthData) return [];
    return growthData.labels.map((label, index) => ({
      month: label,
      newRegistrations: growthData.registrations[index],
      activityCount: growthData.activities[index],
    }));
  }, [growthData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDownload = (reportName: string, data: Record<string, any> | Record<string, any>[]) => {
    const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportName);
    XLSX.writeFile(wb, `${reportName}.xlsx`);
  };

  const handleDownloadPdf = (reportName: string) => {
    const doc = new jsPDF();
    doc.text(`${reportName} Report`, 10, 10);
    // In a real app, you'd generate a more complex PDF, e.g., from a table or chart element
    doc.save(`${reportName}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reporting & Analytics</h1>
        <p className="text-muted-foreground">Monitor the platform’s performance and ensure business owners achieve goals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns Created</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSystemOverview ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : systemOverviewError ? (
              <p className="text-xs text-destructive">Failed to load</p>
            ) : (
              <div className="text-2xl font-bold">{systemOverview?.totalCampaigns}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns Joined</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSystemOverview ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : systemOverviewError ? (
              <p className="text-xs text-destructive">Failed to load</p>
            ) : (
              <div className="text-2xl font-bold">{systemOverview?.totalParticipants}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSystemOverview ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : systemOverviewError ? (
              <p className="text-xs text-destructive">Failed to load</p>
            ) : (
              <div className="text-2xl font-bold">{systemOverview?.totalRedemptions}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Business Tier Distribution</CardTitle>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" onClick={() => handleDownload('Consumer_Growth', consumerGrowthData)}>
                <Download className="mr-2 h-4 w-4" /> Download XLS
              </Button>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" onClick={() => handleDownload('Business_Tiers', businessTierData)}>
                  <Download className="mr-2 h-4 w-4" /> Download XLS
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadPdf('Business_Tiers')}>
                  Download PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={businessTierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {businessTierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Businesses</CardTitle>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" onClick={() => handleDownload('Top_Businesses', topBusinesses || [])}>
                <Download className="mr-2 h-4 w-4" /> Download XLS
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDownloadPdf('Top_Businesses')}>
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTopBusinesses ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : topBusinessesError ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-sm text-destructive">Failed to load data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topBusinesses}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPointsRedeemed" fill="#8884d8" name="Redemptions" />
                  <Bar dataKey="totalPointsEarned" fill="#82ca9d" name="Points Issued" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Popular Rewards</CardTitle>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" onClick={() => handleDownload('Popular_Rewards', topRewards || [])}>
                <Download className="mr-2 h-4 w-4" /> Download XLS
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDownloadPdf('Popular_Rewards')}>
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTopRewards ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : topRewardsError ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-sm text-destructive">Failed to load data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRewards} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalRedemptions" fill="#ffc658" name="Redemption Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Points Distributed (Standard vs Matching)</CardTitle>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" onClick={() => handleDownload('Points_Distribution', pointsDistributionData)}>
                <Download className="mr-2 h-4 w-4" /> Download XLS
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDownloadPdf('Points_Distribution')}>
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pointsDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {pointsDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion & Retention Metrics</CardTitle>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" onClick={() => handleDownload('Conversion_Retention', conversionRetentionData)}>
                <Download className="mr-2 h-4 w-4" /> Download XLS
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDownloadPdf('Conversion_Retention')}>
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Registration to Join Rate</span>
              <span className="text-lg font-bold">{conversionRetentionData.registrationToJoinRate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Join to Redeem Rate</span>
              <span className="text-lg font-bold">{conversionRetentionData.joinToRedeemRate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monthly Retention Rate</span>
              <span className="text-lg font-bold">{conversionRetentionData.monthlyRetentionRate}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
