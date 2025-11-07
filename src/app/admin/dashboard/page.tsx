'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Activity,
  Award,
  Gift,
  PlusCircle,
  Search,
  Bell,
  Building,
  BarChart,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock Data based on task.md
const summaryStats = {
  totalBusinesses: 42,
  activeCampaigns: 12,
  totalConsumers: 1256,
  totalRewardsClaimed: 834,
  totalMatchingPointsIssued: 75000,
};

const businessTierBreakdown = {
  starter: 20,
  active: 15,
  trusted: 5,
  partner: 2,
};

const notifications = [
  {
    id: 1,
    type: 'approval',
    message: 'New campaign "Summer Sale" from "Cafe Delight" requires approval.',
    time: '10 mins ago',
  },
  {
    id: 2,
    type: 'announcement',
    message: 'Scheduled maintenance this Sunday at 2 AM.',
    time: '1 hour ago',
  },
  {
    id: 3,
    type: 'flag',
    message: 'Unusual activity detected on "Tech Gadgets" account.',
    time: '3 hours ago',
  },
];

export default function AdminDashboard() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button>Download Report</Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by business, user, or campaign..." className="pl-8" />
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalBusinesses}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">+5 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalConsumers}</div>
            <p className="text-xs text-muted-foreground">+150 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Claimed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalRewardsClaimed}</div>
            <p className="text-xs text-muted-foreground">+20% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matching Points Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalMatchingPointsIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total points issued</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Create new platform assets.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Reward
            </Button>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Sector
            </Button>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Business
            </Button>
          </CardContent>
        </Card>

        {/* Business Tier Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Business Tier Breakdown</CardTitle>
            <CardDescription>Distribution of businesses across tiers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Starter</span>
              <Badge variant="secondary">{businessTierBreakdown.starter}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Active</span>
              <Badge variant="secondary">{businessTierBreakdown.active}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Trusted</span>
              <Badge variant="secondary">{businessTierBreakdown.trusted}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Partner</span>
              <Badge variant="default">{businessTierBreakdown.partner}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent platform events and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}