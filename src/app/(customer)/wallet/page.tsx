'use client';

import React from 'react';
import { mockWallet } from '@/lib/mock-data/wallet';
import { PointsBalanceCard } from '@/components/customer/PointsBalanceCard';
import { TransactionHistory } from '@/components/customer/TransactionHistory';
import { ClaimableCampaignsTicker } from '@/components/customer/ClaimableCampaignsTicker'; // Import the ticker

export default function WalletPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">My Wallet</h1>
          <p className="mt-4 text-lg text-gray-600">Your points balance and transaction history.</p>
        </div>

        <div className="space-y-8">
          <PointsBalanceCard wallet={mockWallet} />
          <ClaimableCampaignsTicker /> {/* Re-add the ticker */}
          <TransactionHistory transactions={mockWallet.transactions} />
        </div>
      </div>
    </div>
  );
}

