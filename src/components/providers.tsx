'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { CampaignMembershipProvider } from '@/context/CampaignMembershipContext';
import { ImpersonationProvider } from '@/context/ImpersonationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ImpersonationProvider>
        <CampaignMembershipProvider>
          {children}
        </CampaignMembershipProvider>
      </ImpersonationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
