'use client';

import React from 'react';
import { mockWallet } from '@/lib/mock-data/wallet';
import { PointsBalanceCard } from '@/components/customer/PointsBalanceCard';
import { TransactionHistory } from '@/components/customer/TransactionHistory';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, ChevronRight } from 'lucide-react';

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

          <Card className="border-orange-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Ticket className="text-orange-600 h-5 w-5" />
                  Mall Rewards
                </CardTitle>
                <CardDescription>
                  Access your cross-platform gift cards, vouchers, and coupons.
                </CardDescription>
              </div>
              <Link href="/mall-rewards">
                <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 rounded-lg p-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 font-medium">
                  Check your latest redeemed rewards and discount codes.
                </div>
                <Link href="/mall-rewards">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    Manage Rewards
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

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

