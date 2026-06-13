'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import CampaignTransactionHistoryDialog from '@/components/customer/CampaignTransactionHistoryDialog';
import { WishlistButton } from '@/components/customer/wishlist/WishlistButton';
import { WishlistModal } from '@/components/customer/wishlist/WishlistModal';
import { MyCampaign, PaginatedResponse } from '@/services/customer-campaigns/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MyCampaignsContentProps {
  data?: PaginatedResponse<MyCampaign>;
  isLoading: boolean;
}

export default function MyCampaignsContent({ data, isLoading }: MyCampaignsContentProps) {
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState('');
  const [selectedWishlistItemName, setSelectedWishlistItemName] = useState<string | undefined>();

  const handleCardClick = (campaignId: string, campaignTitle: string) => {
    setSelectedCampaignId(campaignId);
    setSelectedCampaignTitle(campaignTitle);
    setIsHistoryDialogOpen(true);
  };

  const handleWishlistClick = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    setSelectedWishlistItemName(title);
    setIsWishlistModalOpen(true);
  };

  const handleWishlistSave = () => {
    console.log('Wishlist item saved');
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden shadow-lg rounded-2xl">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const campaigns = data?.data || [];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">My Campaigns</h1>
        <p className="mt-4 text-lg text-gray-600">Track your progress and see the rewards you&apos;re working towards.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="max-w-md mx-auto px-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Campaigns Yet</h3>
            <p className="text-gray-600 mb-8">
              You haven&apos;t joined any campaigns yet. Start exploring available campaigns to earn rewards!
            </p>
            <Link href="/campaigns">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105">
                Start Earning
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign: MyCampaign) => {
            // Calculate progress if possible, otherwise default to 0 or logic based on requirements
            const target = campaign.regularPointsThreshold || 1000;
            const progress = Math.min((campaign.balance / target) * 100, 100);

            return (
              <Card
                key={campaign.id}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl cursor-pointer"
                onClick={() => handleCardClick(campaign.id, campaign.name)}
              >
                <div className="relative h-40 w-full bg-gray-100">
                  {campaign.bannerUrl ? (
                    <Image src={campaign.bannerUrl} alt={campaign.name} layout='fill' objectFit='cover' />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/30 rounded-full backdrop-blur-sm">
                    <WishlistButton onClick={(e) => handleWishlistClick(e, campaign.name)} />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-gray-800">{campaign.name}</h2>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{campaign.campaignMessage || 'No description available.'}</p>

                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">Balance: {campaign.balance}</span>
                    {campaign.regularPointsThreshold && (
                      <span className="text-gray-500">Target: {campaign.regularPointsThreshold}</span>
                    )}
                  </div>

                  {campaign.regularPointsThreshold ? (
                    <>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-right text-gray-500 mt-1">{progress.toFixed(0)}% to next reward</p>
                    </>
                  ) : (
                    <div className="h-2"></div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CampaignTransactionHistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        campaignId={selectedCampaignId}
        campaignTitle={selectedCampaignTitle}
      />
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        itemName={selectedWishlistItemName}
        onSave={handleWishlistSave}
      />
    </div>
  );
}
