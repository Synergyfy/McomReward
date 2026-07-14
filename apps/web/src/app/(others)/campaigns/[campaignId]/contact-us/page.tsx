'use client';

import React, { use } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Phone, Mail, ArrowUpRight } from "lucide-react";
import { useGetPublicCampaignDetails } from '@/services/customer-campaigns/hook';

interface PageProps {
    params: Promise<{ campaignId: string }>;
}

export default function ContactUsPage({ params }: PageProps) {
    const { campaignId } = use(params);
    console.log('ContactUsPage campaignId:', campaignId);
    const { data: campaign, isLoading, error } = useGetPublicCampaignDetails(campaignId);
    console.log('ContactUsPage data:', campaign, 'isLoading:', isLoading, 'error:', error);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (error || !campaign) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load contact info.</div>;
    }

    const contactMethods = [];

    if (campaign.contactPhoneNumber) {
        contactMethods.push({
            icon: Phone,
            title: 'Call Us',
            contact: campaign.contactPhoneNumber,
            link: `tel:${campaign.contactPhoneNumber.replace(/\D/g, '')}`,
        });
    }

    if (campaign.contactEmail) {
        contactMethods.push({
            icon: Mail,
            title: 'Email Us',
            contact: campaign.contactEmail,
            link: `mailto:${campaign.contactEmail}`,
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
                        {campaign.contactUsPageTitle || 'Contact Us'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {campaign.contactUsPageDescription || 'We are here to help. Reach out to us via any of the methods below.'}
                    </p>
                </div>

                {/* Contact Methods */}
                <div className="space-y-8">
                    {contactMethods.length > 0 ? (
                        contactMethods.map((method, index) => (
                            <a href={method.link} key={index} className="block group">
                                <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-orange-600 border-2 border-transparent">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center space-x-6">
                                            <div className="bg-orange-600 text-white p-4 rounded-full">
                                                <method.icon className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-gray-800">{method.title}</CardTitle>
                                                <p className="text-lg text-gray-600">{method.contact}</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="h-8 w-8 text-gray-400 group-hover:text-orange-600 transition-colors duration-300" />
                                    </CardContent>
                                </Card>
                            </a>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No contact information available for this campaign.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
