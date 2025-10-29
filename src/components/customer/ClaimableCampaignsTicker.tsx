'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClaimConfirmationDialog } from './ClaimConfirmationDialog';
import { Award } from 'lucide-react';

const mockClaimableCampaigns = [
  {
    id: '4',
    title: "Coffee Lover's Dream",
    business: 'The Daily Grind',
    pointsCost: 100,
  },
  {
    id: '5',
    title: 'Bookworm Rewards',
    business: 'The Reading Nook',
    pointsCost: 150,
  },
  {
    id: '6',
    title: 'Tech Gadget Expo',
    business: 'Tech World',
    pointsCost: 200,
  },
  {
    id: '7',
    title: 'Free Movie Ticket',
    business: 'Cineplex',
    pointsCost: 50,
  },
];

export const ClaimableCampaignsTicker = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedPointsCost, setSelectedPointsCost] = useState(0);

  const handleClaimClick = (campaignTitle: string, pointsCost: number) => {
    setSelectedCampaign(campaignTitle);
    setSelectedPointsCost(pointsCost);
    setIsDialogOpen(true);
  };

  return (
    <>
      <style jsx>{`
        .marquee {
          overflow: hidden;
          position: relative;
          width: 100%;
        }
        .marquee-content {
          display: flex;
          animation: marquee 40s linear infinite;
          will-change: transform;
        }
        .marquee:hover .marquee-content {
          animation-play-state: paused;
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
      <div className="my-8">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-1 rounded-2xl shadow-2xl">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <Award className="w-8 h-8 text-yellow-500 mr-3" />
                        <h3 className="text-2xl font-bold text-gray-800">Campaigns Ready to Claim!</h3>
                    </div>
                    <div className="marquee">
                        <div className="marquee-content">
                        {[...mockClaimableCampaigns, ...mockClaimableCampaigns].map((campaign, index) => (
                            <div key={index} className="flex-shrink-0 w-auto mx-4">
                                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md min-w-[350px] border">
                                    <div className="flex flex-col">
                                        <p className="font-bold text-gray-800 truncate">{campaign.title}</p>
                                        <p className="text-sm text-gray-500">{campaign.business}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleClaimClick(campaign.title, campaign.pointsCost)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white ml-4 flex-shrink-0"
                                    >
                                        Claim
                                    </Button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <ClaimConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        campaignName={selectedCampaign}
        pointsCost={selectedPointsCost}
      />
    </>
  );
};
