'use client';

import React, { useState } from 'react';
import ClaimRewardModal from '@/components/dashboard/rewards/ClaimRewardModal';
import { Button } from '@/components/ui/button';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Create a client with no retries for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export default function VerifyModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-10">
        <h1>Verification Page</h1>
        <Button onClick={() => setIsOpen(true)}>Open Claim Reward Modal</Button>
        <ClaimRewardModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onCreateFromScratch={() => console.log('Create from scratch')}
        />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
