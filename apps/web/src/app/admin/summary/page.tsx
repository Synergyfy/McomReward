'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Briefcase,
  Award,
  Users,
  Handshake,
  SlidersHorizontal,
  Bell,
  Shield,
  ArrowRight,
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

  const controlAreas = [
    {
      icon: <Briefcase className="h-8 w-8 text-blue-500" />,
      title: 'Sectors & Categories',
      description: 'Define and organize business sectors.',
      count: `${summaryData.sectors} Sectors`,
      link: '/admin/sectors',
      linkText: 'Manage Sectors',
    },
    {
      icon: <Award className="h-8 w-8 text-blue-500" />,
      title: 'Rewards & Campaigns',
      description: 'Create and oversee all rewards and campaigns.',
      count: `${summaryData.campaigns} Campaigns`,
      links: [
        { href: '/admin/rewards', text: 'Manage Rewards', variant: 'outline' as const },
        { href: '/admin/campaigns', text: 'Manage Campaigns' },
      ],
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: 'User Management',
      description: 'Control and monitor all platform users.',
      count: `${summaryData.users} Total Users`,
      link: '/admin/users',
      linkText: 'Manage Users',
    },
    {
      icon: <Handshake className="h-8 w-8 text-purple-500" />,
      title: 'Partner Management',
      description: 'Oversee co-branded and white-label partners.',
      count: `${summaryData.partners} Partners`,
      link: '/admin/partner-management',
      linkText: 'Manage Partners',
    },
    {
      icon: <SlidersHorizontal className="h-8 w-8 text-red-500" />,
      title: 'Points & Deals',
      description: 'Manage matching points and business deals.',
      count: `${summaryData.deals} Active Deals`,
      links: [
        { href: '/admin/matching-points', text: 'Manage Points', variant: 'outline' as const },
        { href: '/admin/deals-management', text: 'Manage Deals' },
      ],
    },
    {
      icon: <Bell className="h-8 w-8 text-yellow-500" />,
      title: 'Communication',
      description: 'Manage announcements and notifications.',
      count: `${summaryData.notifications} Templates & Announcements`,
      link: '/admin/notifications-control',
      linkText: 'Manage Notifications',
    },
    {
      icon: <Shield className="h-8 w-8 text-gray-500" />,
      title: 'Security & Compliance',
      description: 'Ensure platform integrity and accountability.',
      count: 'Audit Logs & RBAC',
      link: '/admin/security',
      linkText: 'View Security',
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Admin Control Summary</h1>
          <p className="mt-3 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            A high-level overview and quick access to all major management areas.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {controlAreas.map((area) => (
            <Card key={area.title} className="flex flex-col hover:shadow-xl transition-shadow duration-300 group">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                <div className="bg-gray-100 p-3 rounded-lg mt-1">{area.icon}</div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">{area.title}</CardTitle>
                  <CardDescription>{area.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-3xl font-bold text-gray-800">{area.count}</div>
              </CardContent>
              <CardFooter className="pt-4">
                {area.links ? (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {area.links.map((link) => (
                      <Link key={link.href} href={link.href} passHref>
                        <Button variant={link.variant || 'default'} className="w-full text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {link.text}
                          <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link href={area.link || '#'} passHref className="w-full">
                    <Button className="w-full text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors" disabled={area.disabled}>
                      {area.linkText}
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
