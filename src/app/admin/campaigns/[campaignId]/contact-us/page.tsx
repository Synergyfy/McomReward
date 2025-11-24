'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook';
import LoadingSpinner from '@/components/ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactUsPage() {
  const params = useParams();
  const { campaignId } = params;

  const { data: campaign, isLoading, isError } = useGetCampaignById(campaignId as string);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !campaign) {
    return <p className="text-center text-lg text-red-500 py-20">Campaign not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-none overflow-hidden">
          <CardHeader className="bg-green-50 border-b border-green-100 p-8 text-center">
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {campaign.contactUsPageTitle || 'Contact Us'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div
              className="prose prose-lg max-w-none text-gray-600 text-center"
              dangerouslySetInnerHTML={{ __html: campaign.contactUsPageDescription || '<p>We are here to help.</p>' }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                <Mail className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-gray-500 uppercase">Email</p>
                <p className="text-lg font-medium text-gray-900">{campaign.contactEmail || 'Not provided'}</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                <Phone className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-gray-500 uppercase">Phone</p>
                <p className="text-lg font-medium text-gray-900">{campaign.contactPhoneNumber || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
