'use client';

import { useGetPublicCampaignDetails, useJoinCampaign } from "@/services/customer-campaigns/hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Tag } from "lucide-react";

interface PageProps {
  params: { campaignId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Mock data for a single campaign, since the API is not yet available
const mockCampaign = {
    id: '1',
    title: 'Gourmet Burger Fest',
    description: 'A culinary journey to taste the most exquisite burgers. Join us to savor unique flavors and enjoy a special discount on our new menu. Perfect for foodies and burger enthusiasts!',
    startDate: '2025-11-01T00:00:00.000Z',
    endDate: '2025-11-30T23:59:59.000Z',
    reward: {
        id: 'reward-1',
        title: '25% Off Your Next Meal',
        description: 'Enjoy a hefty discount on your next visit.',
        points_required: 500,
        value: 25,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80',
        quantity: 1000,
        createdAt: '2025-10-20T10:00:00.000Z',
        updatedAt: '2025-10-20T10:00:00.000Z',
    },
    category: 'Restaurants',
};

export default function CampaignDetailPage({ params }: PageProps) {
  // const { data: campaign, isLoading } = useGetPublicCampaignDetails(params.campaignId);
  const { mutate: joinCampaign, isPending: isJoining } = useJoinCampaign();

  // Using mock data for now
  const campaign = mockCampaign;
  const isLoading = false;

  const handleJoin = () => {
    joinCampaign(params.campaignId, {
      onSuccess: (data) => {
        alert(data.message);
      },
      onError: (error) => {
        alert(`Error joining campaign: ${error.message}`);
      },
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        {isLoading ? (
          <p className="text-center text-lg">Loading campaign details...</p>
        ) : campaign ? (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-64 w-full">
                <Image 
                    src={campaign.reward.image} 
                    alt={campaign.title} 
                    layout="fill"
                    objectFit="cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">{campaign.title}</h1>
                </div>
            </div>
            <div className="p-8">
              <p className="text-lg text-gray-700 mb-6">{campaign.description}</p>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 mb-8 space-y-2 sm:space-y-0">
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    <Tag className="w-3 h-3 mr-1.5" />
                    <span>{campaign.category}</span>
                </div>
              </div>

              <Card className="mb-8 border-2 border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Your Reward</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold text-gray-800">{campaign.reward.title}</h3>
                  <p className="text-gray-600 mt-1">Redeemable for {campaign.reward.points_required} points.</p>
                </CardContent>
              </Card>

              <Button onClick={handleJoin} disabled={isJoining} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                {isJoining ? 'Joining...' : 'Join Campaign & Get Reward'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-lg text-red-500">Campaign not found.</p>
        )}
      </div>
    </div>
  );
}
