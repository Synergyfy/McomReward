'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, ArrowUpRight } from "lucide-react";
import { CampaignResponse } from "@/services/campaigns/types"; // Import CampaignResponse

interface ContactUsPagePreviewProps {
  campaign: CampaignResponse; // Changed from campaignData: CampaignFormData
}

export default function ContactUsPagePreview({ campaign }: ContactUsPagePreviewProps) {
  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      contact: campaign.contactPhoneNumber || '+1 (555) 123-4567',
      link: `tel:${campaign.contactPhoneNumber}`,
    },
    {
      icon: Mail,
      title: 'Email Us',
      contact: campaign.contactEmail || 'support@mcomloyalty.com',
      link: `mailto:${campaign.contactEmail}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            {campaign.contactUsPageTitle || 'Contact Us'}
          </h1>
          <p className="mt-4 text-xl text-gray-600" dangerouslySetInnerHTML={{ __html: campaign.contactUsPageDescription || 'We\'re here to help. Reach out to us with any questions.' }} />
        </div>

        {/* Contact Methods */}
        <div className="space-y-8">
          {contactMethods.map((method, index) => (
            <div key={index} className="block group"> {/* Changed <a> to <div> and disabled interaction */}
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                  {/* Removed ArrowUpRight as interaction is disabled */}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
