'use client';

import React from 'react';
import { mockWallet } from '@/lib/mock-data/wallet';
import { PointsBalanceCard } from '@/components/customer/PointsBalanceCard';
import { TransactionHistory } from '@/components/customer/TransactionHistory';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">My Wallet</h1>
          <p className="mt-4 text-lg text-gray-600">Your points balance and transaction history.</p>
        </div>

        <div className="space-y-8">
          <PointsBalanceCard />
          <TransactionHistory />

          <div className="flex justify-center mt-8">
            <Link href="/campaigns">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105">
                Join Campaign
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
