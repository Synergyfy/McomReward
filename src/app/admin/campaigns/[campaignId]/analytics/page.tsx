'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetCampaignTierAnalytics, useGetCampaignById } from '@/services/campaigns/hook';
import { CampaignTierAnalytics } from '@/services/campaigns/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/Loading';
import { ArrowLeft, Download, Users, Award, Ticket, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function CampaignAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;

  const { data: analyticsData, isLoading: isAnalyticsLoading, isError: isAnalyticsError } = useGetCampaignTierAnalytics(campaignId);
  const { data: campaignData, isLoading: isCampaignLoading } = useGetCampaignById(campaignId);

  const tierAnalytics = analyticsData?.data || [];
  const campaign = campaignData;

  const isLoading = isAnalyticsLoading || isCampaignLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAnalyticsError || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
        <p className="text-gray-600">Failed to load analytics data.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const totalParticipants = tierAnalytics.reduce((acc: number, tier: CampaignTierAnalytics) => acc + tier.totalParticipants, 0);
  const totalClaims = tierAnalytics.reduce((acc: number, tier: CampaignTierAnalytics) => acc + tier.claimsCount, 0);
  const totalPointsGiven = tierAnalytics.reduce((acc: number, tier: CampaignTierAnalytics) => acc + tier.totalPointsEarned, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Campaign Analytics</h1>
            </div>
            <p className="text-gray-500 ml-12">
              Analytics for <span className="font-semibold text-gray-900">{campaign.name}</span>
            </p>
          </div>
          <div className="flex gap-2">
             {/* Placeholder for future export functionality */}
            <Button variant="outline" className="gap-2" disabled>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalParticipants}</div>
              <p className="text-xs text-muted-foreground">Across all tiers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClaims}</div>
              <p className="text-xs text-muted-foreground">Total rewards claimed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points Issued</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPointsGiven.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total points earned by users</p>
            </CardContent>
          </Card>
        </div>

        {/* Tiers Breakdown Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Tier Breakdown</CardTitle>
            <CardDescription>Detailed performance metrics by tier.</CardDescription>
          </CardHeader>
          <CardContent>
            {tierAnalytics.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tier analytics data available for this campaign.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier Name</TableHead>
                    <TableHead className="text-right">Claims Count</TableHead>
                    <TableHead className="text-right">Participants</TableHead>
                    <TableHead className="text-right">Points Earned</TableHead>
                    <TableHead className="text-right">Points Redeemed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tierAnalytics.map((tier) => (
                    <TableRow key={tier.tierId}>
                      <TableCell className="font-medium">{tier.tierName}</TableCell>
                      <TableCell className="text-right">{tier.claimsCount}</TableCell>
                      <TableCell className="text-right">{tier.totalParticipants}</TableCell>
                      <TableCell className="text-right">{tier.totalPointsEarned.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{tier.totalPointsRedeemed.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
