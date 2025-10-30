'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/campaigns/Header';
import Footer from '@/components/campaigns/Footer';

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeaderFooter = pathname === '/campaigns';

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeaderFooter && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}
