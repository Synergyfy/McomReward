'use client';

import React from 'react';
import PreviewHeader from '@/components/admin/campaigns/previews/PreviewHeader';

export default function CampaignPreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PreviewHeader />
      <main className="flex-grow p-6">
        {children}
      </main>
    </div>
  );
}
