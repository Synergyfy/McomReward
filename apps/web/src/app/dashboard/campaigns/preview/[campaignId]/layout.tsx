
'use client';

import React from 'react';
import PreviewHeader from '@/components/dashboard/campaigns/previews/PreviewHeader';

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PreviewHeader />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
