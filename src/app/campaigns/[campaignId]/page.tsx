'use client';

import { useGetPublicCampaignDetails, useJoinCampaign } from "@/services/customer-campaigns/hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function CampaignDetailPage({ params }: { params: { campaignId: string } }) {
  const { data: campaign, isLoading } = useGetPublicCampaignDetails(params.campaignId);
  const { mutate: joinCampaign, isPending: isJoining } = useJoinCampaign();

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
    <div className="container mx-auto py-10">
      {isLoading ? (
        <p className="text-center">Loading campaign details...</p>
      ) : campaign ? (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{campaign.description}</p>
          
          <div className="flex justify-between text-sm text-muted-foreground mb-8">
            <span>Starts: {new Date(campaign.startDate).toLocaleDateString()}</span>
            <span>Ends: {new Date(campaign.endDate).toLocaleDateString()}</span>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Reward for this Campaign</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Image 
                src={campaign.reward.image} 
                alt={campaign.reward.title} 
                width={80} 
                height={80} 
                className="rounded-md"
              />
              <div>
                <h3 className="font-semibold">{campaign.reward.title}</h3>
                <p>Points: {campaign.reward.points_required}</p>
                <p>Value: ${campaign.reward.value}</p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleJoin} disabled={isJoining} className="w-full">
            {isJoining ? 'Joining...' : 'Join Campaign'}
          </Button>
        </div>
      ) : (
        <p className="text-center">Campaign not found.</p>
      )}
    </div>
  );
}
