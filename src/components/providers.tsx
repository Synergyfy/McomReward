'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { CampaignMembershipProvider } from '@/context/CampaignMembershipContext';


const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CampaignMembershipProvider>
        {children}
      </CampaignMembershipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
