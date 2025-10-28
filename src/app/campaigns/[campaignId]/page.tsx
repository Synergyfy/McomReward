'use client';

import React, { useState, use } from 'react';
import { useGetPublicCampaignDetails, useJoinCampaign } from "@/services/customer-campaigns/hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Tag, Info, Gift, CheckCircle } from "lucide-react";
import { JoinConfirmationDialog } from "@/components/customer/JoinConfirmationDialog";

interface PageProps {
  params: { campaignId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Expanded mock data for a single campaign
const mockCampaign = {
  id: '1',
  title: 'Exclusive Summer Rewards Extravaganza!',
  tagline: 'Unlock amazing benefits and discounts all summer long!',
  description: 'Dive into a season of unparalleled rewards with our Summer Extravaganza campaign! Earn double points on all purchases, get exclusive access to flash sales, and stand a chance to win a grand summer getaway. This campaign is designed to give back to our most loyal customers, offering a blend of immediate gratification and long-term value. Don\'t miss out on making your summer shopping more rewarding than ever before!',
  heroImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
  businessLogoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG0wby1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example logo
  businessName: 'Mcom Loyalty Store',
  startDate: '2025-06-01T00:00:00.000Z',
  endDate: '2025-08-31T23:59:59.000Z',
  category: 'Retail & Lifestyle',
  reward: {
    id: 'reward-summer-getaway',
    title: 'Luxury Weekend Getaway for Two!',
    description: 'Win an all-expenses-paid luxury weekend getaway to a destination of your choice. Includes flights, 5-star accommodation, and exclusive experiences. A truly unforgettable reward for our top earners!',
    points_required: 10000,
    value: '£2,500', // Monetary value for display
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    quantity: 5, // Limited quantity makes it more exclusive
  },
  howToEarn: [
    'Earn 2x points on all purchases made in June.',
    'Earn 1.5x points on all purchases made in July.',
    'Refer a friend and get 500 bonus points when they make their first purchase.',
    'Participate in our weekly challenges to earn extra points.',
  ],
  termsAndConditions: [
    'Campaign valid from June 1st to August 31st, 2025.',
    'Points are awarded automatically upon qualifying transactions.',
    'The Luxury Weekend Getaway reward is subject to availability and booking terms.',
    'Referral bonus points are credited after the referred friend\'s first successful transaction.',
    'Mcom Loyalty Store reserves the right to modify or cancel the campaign at any time.',
  ],
};

export default function CampaignDetailPage({ params }: PageProps) {
  const resolvedParams = use(params); // Unwrap params with React.use()
  const { campaignId } = resolvedParams;

  // const { data: campaign, isLoading } = useGetPublicCampaignDetails(campaignId); // Use destructured campaignId
  const { mutate: joinCampaign, isPending: isJoining } = useJoinCampaign();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false); // New state
  const [joinedCampaignTitle, setJoinedCampaignTitle] = useState(''); // New state

  // Using mock data for now
  const campaign = mockCampaign;
  const isLoading = false;

  const handleJoin = () => {
    joinCampaign(campaignId, {
      onSuccess: (data) => {
        setJoinedCampaignTitle(campaign.title); // Set campaign title
        setIsJoinDialogOpen(true); // Open dialog
      },
      onError: (error) => {
        // For now, just log the error. A proper error dialog could be implemented later.
        console.error(`Error joining campaign: ${error.message}`);
      },
    });
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      {isLoading ? (
        <p className="text-center text-lg py-20">Loading campaign details...</p>
      ) : campaign ? (
        <div className="relative">
          {/* Hero Section */}
          <div className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden">
            <Image
              src={campaign.heroImageUrl}
              alt={campaign.title}
              layout="fill"
              objectFit="cover"
              className="brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end pb-16 px-4 md:px-8 lg:px-16">
              <div className="max-w-4xl mx-auto text-white text-center">
                <div className="flex items-center justify-center mb-4">
                  {campaign.businessLogoUrl && (
                    <Image
                      src={campaign.businessLogoUrl}
                      alt={campaign.businessName + ' Logo'}
                      width={60}
                      height={60}
                      className="rounded-full mr-4 border-2 border-white shadow-lg"
                    />
                  )}
                  <p className="text-xl font-semibold">{campaign.businessName}</p>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                  {campaign.title}
                </h1>
                <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow-md">
                  {campaign.tagline}
                </p>
                <Button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isJoining ? 'Joining...' : 'Join Campaign & Get Reward'}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto py-12 px-4 md:px-8 lg:px-16 -mt-20 relative z-10">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-10">
              {/* Campaign Description */}
              <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">About This Campaign</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {campaign.description}
                </p>
              </section>

              {/* Key Information */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 shadow-md border-l-4 border-orange-600">
                  <CardHeader className="!p-0 mb-3">
                    <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                      <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                      Campaign Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="!p-0 text-gray-700 text-lg">
                    <p>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
                <Card className="p-6 shadow-md border-l-4 border-orange-600">
                  <CardHeader className="!p-0 mb-3">
                    <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                      <Tag className="w-5 h-5 mr-2 text-orange-600" />
                      Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="!p-0 text-gray-700 text-lg">
                    <p>{campaign.category}</p>
                  </CardContent>
                </Card>
              </section>

              {/* Reward Details */}
              <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Exclusive Reward</h2>
                <Card className="overflow-hidden shadow-lg border-2 border-orange-100">
                  <div className="relative h-60 w-full">
                    <Image
                      src={campaign.reward.image}
                      alt={campaign.reward.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <CardContent className="p-6 bg-orange-50">
                    <h3 className="text-2xl font-bold text-orange-800 mb-2">{campaign.reward.title}</h3>
                    <p className="text-gray-700 mb-4">{campaign.reward.description}</p>
                    <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                      <p className="flex items-center"><Gift className="w-5 h-5 mr-2 text-orange-600" /> Points Required: {campaign.reward.points_required}</p>
                      {campaign.reward.value && <p>Value: {campaign.reward.value}</p>}
                    </div>
                    {campaign.reward.quantity && campaign.reward.quantity > 0 && (
                      <p className="text-sm text-gray-600 mt-2">Limited to {campaign.reward.quantity} rewards.</p>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* How to Earn */}
              {campaign.howToEarn && campaign.howToEarn.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">How to Participate & Earn</h2>
                  <ul className="space-y-3 text-lg text-gray-700">
                    {campaign.howToEarn.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-6 h-6 mr-3 text-green-500 flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Terms and Conditions */}
              {campaign.termsAndConditions && campaign.termsAndConditions.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Terms & Conditions</h2>
                  <ul className="space-y-3 text-base text-gray-600 list-disc pl-5">
                    {campaign.termsAndConditions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {/* Sticky Join Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-20">
            <div className="max-w-4xl mx-auto flex justify-center">
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white text-lg px-12 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isJoining ? 'Joining...' : 'Join Campaign & Get Reward'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-lg text-red-500 py-20">Campaign not found.</p>
      )}
      <JoinConfirmationDialog
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
        campaignTitle={joinedCampaignTitle}
      />
    </div>
  );
}
