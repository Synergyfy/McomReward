
'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function EditCampaignPage() {
  const params = useParams();
  const { campaignId } = params;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Campaign: {campaignId}</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-700">
            This is a placeholder for the campaign editing form for campaign ID: <strong>{campaignId}</strong>.
          </p>
          <p className="mt-4 text-gray-600">
            Here you would find fields to modify campaign details, rewards, scheduling, etc.
          </p>
        </div>
      </div>
    </div>
  );
}
