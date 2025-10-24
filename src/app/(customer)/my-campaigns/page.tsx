'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import CampaignTransactionHistoryDialog from '@/components/customer/CampaignTransactionHistoryDialog';

const mockMyCampaigns = [
  {
    id: '1',
    title: 'Gourmet Burger Fest',
    business: 'Burger Queen',
    progress: 75,
    description: 'You are only 25 points away from your next reward!',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=999&q=80',
  },
  {
    id: '2',
    title: 'Winter Wonderland Deals',
    business: 'The Fashion Hub',
    progress: 40,
    description: 'Keep shopping to unlock exclusive winter discounts.',
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  {
    id: '3',
    title: 'Loyalty Members Exclusive',
    business: 'Tech Gadgets',
    progress: 90,
    description: 'Almost there! Your next tech reward is just around the corner.',
    imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
  },
];

export default function MyCampaignsPage() {
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState('');

  const handleCardClick = (campaignId: string, campaignTitle: string) => {
    setSelectedCampaignId(campaignId);
    setSelectedCampaignTitle(campaignTitle);
    setIsHistoryDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">My Campaigns</h1>
        <p className="mt-4 text-lg text-gray-600">Track your progress and see the rewards you&apos;re working towards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockMyCampaigns.map((campaign) => (
          <Card 
            key={campaign.id} 
            className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl cursor-pointer"
            onClick={() => handleCardClick(campaign.id, campaign.title)}
          >
            <div className="relative h-40 w-full">
              <img src={campaign.imageUrl} alt={campaign.title} className="h-full w-full object-cover" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-500">{campaign.business}</h3>
              <h2 className="text-xl font-bold mb-2 text-gray-800">{campaign.title}</h2>
              <p className="text-gray-600 mb-4 text-sm">{campaign.description}</p>
              <Progress value={campaign.progress} className="h-2" />
              <p className="text-xs text-right text-gray-500 mt-1">{campaign.progress}% Complete</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <CampaignTransactionHistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        campaignId={selectedCampaignId}
        campaignTitle={selectedCampaignTitle}
      />
    </div>
  );
}
