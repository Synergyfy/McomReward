'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Hash, Hand, User } from "lucide-react";
import { CampaignResponse } from "@/services/campaigns/types"; // Import CampaignResponse

interface EarnPointsPagePreviewProps {
  campaign: CampaignResponse; // Changed from campaignData: CampaignFormData
}

export default function EarnPointsPagePreview({ campaign }: EarnPointsPagePreviewProps) {
  // Assuming earn methods are still static, but buttons are disabled for preview
  const earnMethods = [
    {
      icon: QrCode,
      title: 'QR Code',
      description: 'Present your unique QR code to the merchant for scanning.',
      action: () => console.log('Show QR Code'), // No-op for preview
    },
    {
      icon: Hash,
      title: 'Enter Code',
      description: 'Enter a code provided by the merchant to earn points.',
      action: () => console.log('Enter Code'), // No-op for preview
    },
    {
      icon: Hand,
      title: 'Merchant Enters Code',
      description: 'Allow the merchant to enter a secure code on your device.',
      action: () => console.log('Merchant Enter Code'), // No-op for preview
    },
    {
      icon: User,
      title: 'Customer Number',
      description: 'Provide your customer number to the merchant to add points.',
      action: () => console.log('Show Customer Number'), // No-op for preview
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            {campaign.earnPointPageTitle || 'Earn Points'}
          </h1>
          <p
            className="mt-4 text-xl text-gray-600"
            dangerouslySetInnerHTML={{ __html: campaign.earnPointPageDescription || 'Discover the different ways you can earn loyalty points with us.' }}
          />
        </div>

        {/* Earn Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {earnMethods.map((method, index) => (
            <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gray-100 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 text-white p-3 rounded-full">
                    <method.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">{method.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-lg text-gray-700 mb-6 h-20 line-clamp-3">
                  {method.description}
                </CardDescription>
                <Button
                  onClick={method.action}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                  disabled={true} // Always disabled for admin preview
                >
                  Use {method.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
