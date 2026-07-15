'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook';
import LoadingSpinner from '@/components/ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";
import { CampaignResponse, BusinessCampaign } from '@/services/campaigns/types';

// Type guard to determine if the campaign is a BusinessCampaign
const isBusinessCampaign = (campaign: CampaignResponse | BusinessCampaign): campaign is BusinessCampaign => {
  return (campaign as BusinessCampaign).campaign_type !== undefined;
};

export default function CustomerContactUsPage() {
    const params = useParams();
    const { campaignId } = params;
    const { data: campaignData, isLoading, isError } = useGetCampaignById(campaignId as string);

    if (isLoading) return <LoadingSpinner />;
    
    const campaign = campaignData as (CampaignResponse | BusinessCampaign);

    if (isError || !campaign) return <p className="text-center text-red-500 py-10">Campaign not found.</p>;

    const contactUsPageTitle = isBusinessCampaign(campaign) ? campaign.contact_us_page_title : campaign.contactUsPageTitle;
    const contactUsPageDescription = isBusinessCampaign(campaign) ? campaign.contact_us_page_description : campaign.contactUsPageDescription;
    const contactEmail = isBusinessCampaign(campaign) ? campaign.contact_email : campaign.contactEmail;
    const contactPhoneNumber = isBusinessCampaign(campaign) ? campaign.contact_phone_number : campaign.contactPhoneNumber;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Card className="border-none shadow-lg">
                <CardHeader className="bg-green-50 border-b border-green-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            {contactUsPageTitle || 'Contact Us'}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-8 space-y-8">
                    <div
                        className="prose prose-lg max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: contactUsPageDescription || '<p>No description available.</p>' }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="p-3 bg-white rounded-full shadow-sm text-orange-500">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase">Email</p>
                                <p className="text-lg font-medium text-gray-900">{contactEmail || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="p-3 bg-white rounded-full shadow-sm text-green-500">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase">Phone</p>
                                <p className="text-lg font-medium text-gray-900">{contactPhoneNumber || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
