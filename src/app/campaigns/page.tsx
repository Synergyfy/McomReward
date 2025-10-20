'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const mockCampaigns = [
  {
    id: '1',
    title: 'Summer Bonanza',
    description: 'Get 20% off on all summer collection items. T&C apply.',
  },
  {
    id: '2',
    title: 'Winter Wonderland Deals',
    description: 'Enjoy special discounts on winter apparel and accessories.',
  },
  {
    id: '3',
    title: 'Back to School Sale',
    description: 'All your school essentials at an unbeatable price.',
  },
  {
    id: '4',
    title: 'Flash Sale Friday',
    description: 'Limited time offers every Friday. Dont miss out!',
  },
  {
    id: '5',
    title: 'Loyalty Members Exclusive',
    description: 'Exclusive access to new arrivals for our loyalty members.',
  },
  {
    id: '6',
    title: 'Holiday Special',
    description: 'Celebrate the holidays with our special offers and gifts.',
  },
];

export default function CampaignsPage() {
  const [page] = useState(1);
  const [limit] = useState(9);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Campaigns</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockCampaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <CardTitle>{campaign.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{campaign.description}</p>
              <Link href={`/campaigns/${campaign.id}`}>
                <Button>View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Pagination can be re-enabled when the API is ready */}
    </div>
  );
}
