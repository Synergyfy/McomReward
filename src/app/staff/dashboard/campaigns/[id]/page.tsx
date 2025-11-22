"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetStaffCampaignById } from "@/services/campaigns/hook";
import Loader from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, Flame, Tag, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { OngoingCampaignReward } from "@/services/campaigns/types";

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: campaign, isLoading, isError } = useGetStaffCampaignById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Campaign Not Found</h2>
        <p className="text-gray-500">Unable to load campaign details.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
      </div>

      {/* Banner Section */}
      <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-md bg-gray-100">
        {campaign.bannerUrl ? (
          <Image
            src={campaign.bannerUrl}
            alt={campaign.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Banner Image
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge
            variant={campaign.disabled ? "destructive" : "default"}
            className={!campaign.disabled ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {campaign.disabled ? "Inactive" : "Active"}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {campaign.campaignMessage}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                  <Flame className="h-4 w-4" />
                  <span className="capitalize">{campaign.campaignType?.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full">
                  <Users className="h-4 w-4" />
                  <span className="capitalize">{campaign.audienceType}</span>
                </div>
                {campaign.business?.name && (
                   <div className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                    <MapPin className="h-4 w-4" />
                    <span>{campaign.business.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rewards Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-orange-500" />
              Available Rewards
            </h2>
            {campaign.rewards && campaign.rewards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {campaign.rewards.map((reward: OngoingCampaignReward) => (
                  <Card key={reward.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-32 bg-gray-200">
                      {reward.image ? (
                        <Image
                          src={reward.image}
                          alt={reward.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                      {reward.pointsRequired > 0 && (
                        <Badge className="absolute top-2 right-2 bg-orange-500">
                          {reward.pointsRequired} pts
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-800 truncate" title={reward.title}>{reward.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1" title={reward.description}>
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                        <span className="capitalize">{reward.rewardType}</span>
                        <span>Qty: {reward.quantity}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No rewards configured for this campaign.</p>
            )}
          </div>
        </div>

        {/* Right Column: Stats & Info */}
        <div className="space-y-6">
          <Card>
             <CardHeader>
              <CardTitle className="text-lg">Campaign Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Start Date</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(campaign.startDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                 <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">End Date</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(campaign.endDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

           <Card>
             <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Participants</span>
                  <span className="text-sm font-bold text-gray-900">{campaign.participantCount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Points Earned</p>
                  <p className="font-bold text-green-600">{campaign.totalPointsEarned.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Points Redeemed</p>
                  <p className="font-bold text-orange-600">{campaign.totalPointsRedeemed.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
