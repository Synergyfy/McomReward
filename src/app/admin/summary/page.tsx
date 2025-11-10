'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Briefcase,
  Award,
  Users,
  Handshake,
  SlidersHorizontal,
  Tag,
  Bell,
  Shield,
  Megaphone,
} from 'lucide-react';
import { initialSectors } from '@/lib/mock-data/sectors';
import { mockBusinessUsers, mockConsumerUsers } from '@/lib/mock-data/users';
import { mockPartners } from '@/lib/mock-data/partners';
import { mockDeals } from '@/lib/mock-data/deals';
import { mockAnnouncements, mockNotificationTemplates } from '@/lib/mock-data/notifications';
import { mockCampaigns } from '@/lib/mock-data/campaigns';

export default function AdminControlSummaryPage() {
  const summaryData = {
    sectors: initialSectors.length,
    users: mockBusinessUsers.length + mockConsumerUsers.length,
    partners: mockPartners.length,
    deals: mockDeals.length,
    notifications: mockAnnouncements.length + mockNotificationTemplates.length,
    campaigns: mockCampaigns.length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Control Summary</h1>
        <p className="text-muted-foreground">A high-level overview and quick access to all major management areas.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sectors & Categories Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Sectors & Categories
            </CardTitle>
            <CardDescription>Define and organize business sectors.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summaryData.sectors} Sectors</p>
            <Link href="/admin/sectors" passHref>
              <Button className="mt-4 w-full">Manage Sectors</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Rewards & Campaigns Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" /> Rewards & Campaigns
            </CardTitle>
            <CardDescription>Create and oversee all rewards and campaigns.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summaryData.campaigns} Campaigns</p>
            <div className="flex gap-4 mt-4">
              <Link href="/admin/rewards" passHref className="flex-1">
                <Button variant="outline" className="w-full">Manage Rewards</Button>
              </Link>
              <Link href="/admin/campaigns/list" passHref className="flex-1">
                <Button className="w-full">Manage Campaigns</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* User Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> User Management
            </CardTitle>
            <CardDescription>Control and monitor all platform users.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summaryData.users} Total Users</p>
            <Link href="/admin/users" passHref>
              <Button className="mt-4 w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Partner Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" /> Partner Management
            </CardTitle>
            <CardDescription>Oversee co-branded and white-label partners.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summaryData.partners} Partners</p>
            <Link href="/admin/partner-management" passHref>
              <Button className="mt-4 w-full">Manage Partners</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Points & Deals Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" /> Points & Deals
            </CardTitle>
            <CardDescription>Manage matching points and business deals.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summaryData.deals} Active Deals</p>
            <div className="flex gap-4 mt-4">
              <Link href="/admin/matching-points" passHref className="flex-1">
                <Button variant="outline" className="w-full">Manage Points</Button>
              </Link>
              <Link href="/admin/deals-management" passHref className="flex-1">
                <Button className="w-full">Manage Deals</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Communication Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Communication
            </CardTitle>
            <CardDescription>Manage announcements and notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summaryData.notifications} Templates & Announcements</p>
            <Link href="/admin/notifications-control" passHref>
              <Button className="mt-4 w-full">Manage Notifications</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Security & Compliance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Security & Compliance
            </CardTitle>
            <CardDescription>Ensure platform integrity and accountability.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View audit trails and manage compliance settings.</p>
            <Button className="mt-4 w-full" disabled>View Logs (Future)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
