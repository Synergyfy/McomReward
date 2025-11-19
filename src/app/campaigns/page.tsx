"use client";

import React from "react";
import {
  useGetClaimableCampaigns,
  useClaimCampaign,
  useGetMyCreatedCampaigns,
  useGetMyClaimedCampaigns,
} from "@/services/business-campaign/hooks";
import { Campaign } from "@/services/business-campaign/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Loader } from "lucide-react";

const CampaignsList = ({
  campaigns,
  onClaim,
  isClaimable = false,
}: {
  campaigns: Campaign[];
  onClaim?: (campaignId: string) => void;
  isClaimable?: boolean;
}) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-12">
        No campaigns found in this category.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {campaigns.map((campaign) => (
        <Card
          key={campaign.id}
          className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl"
        >
          <div className="relative h-48 w-full">
            <Image
              src={campaign.banner_url}
              alt={campaign.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              {campaign.name}
            </h2>
            <p className="text-gray-600 mb-4 h-20 overflow-hidden">
              {campaign.campaign_message}
            </p>
            {isClaimable && onClaim && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full"
                onClick={() => onClaim(campaign.id)}
              >
                Claim Campaign
              </Button>
            )}
            {!isClaimable && (
              <Link href={`/campaigns/${campaign.id}`}>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full">
                  View Details
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function CampaignsPage() {
  const {
    data: claimableCampaigns,
    isLoading: isLoadingClaimable,
    error: errorClaimable,
  } = useGetClaimableCampaigns();
  const {
    data: myCreatedCampaigns,
    isLoading: isLoadingMyCreated,
    error: errorMyCreated,
  } = useGetMyCreatedCampaigns();
  const {
    data: myClaimedCampaigns,
    isLoading: isLoadingMyClaimed,
    error: errorMyClaimed,
  } = useGetMyClaimedCampaigns();

  const claimCampaignMutation = useClaimCampaign();

  const handleClaimCampaign = (campaignId: string) => {
    claimCampaignMutation.mutate(campaignId, {
      onSuccess: () => {
        toast.success("Campaign claimed successfully!");
      },
      onError: (error) => {
        toast.error(`Failed to claim campaign: ${error.message}`);
      },
    });
  };

  const renderCampaigns = (
    title: string,
    data: any,
    isLoading: boolean,
    error: Error | null,
    isClaimable = false
  ) => (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
      {isLoading && <Loader className="animate-spin" />}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {data && (
        <CampaignsList
          campaigns={data.data}
          onClaim={isClaimable ? handleClaimCampaign : undefined}
          isClaimable={isClaimable}
        />
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
            Explore Campaigns
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Discover, claim, and manage your campaigns.
          </p>
        </div>

        {renderCampaigns(
          "Campaigns Ready to Claim!",
          claimableCampaigns,
          isLoadingClaimable,
          errorClaimable,
          true
        )}
        {renderCampaigns(
          "My Created Campaigns",
          myCreatedCampaigns,
          isLoadingMyCreated,
          errorMyCreated
        )}
        {renderCampaigns(
          "My Claimed Campaigns",
          myClaimedCampaigns,
          isLoadingMyClaimed,
          errorMyClaimed
        )}
      </div>
    </div>
  );
}