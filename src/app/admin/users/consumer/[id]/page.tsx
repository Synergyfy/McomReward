'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminParticipant } from '@/services/admin/hook';
import { PointsBalanceDisplay } from '@/components/customer/PointsBalanceDisplay';
import { TransactionHistoryTable } from '@/components/customer/TransactionHistoryTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { ConsumerUser } from '@/lib/mock-data/users';

export default function AdminConsumerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: participant, isLoading, isError } = useAdminParticipant(userId);

  // Map API data to ConsumerUser type (similar to the list page)
  const consumerUser: ConsumerUser | null = participant ? {
    id: participant.id,
    name: participant.name,
    email: participant.email,
    badgeLevel: participant.badgeLevel as ConsumerUser['badgeLevel'],
    location: participant.location,
    activity: participant.activity as ConsumerUser['activity'],
    campaignsJoined: participant.campaignsJoined,
    rewardsRedeemed: participant.rewardsRedeemed,
    points: participant.globalTotalPoints,
    matchingPoints: participant.matchingPoints,
    joinedDate: new Date(participant.joinedDate),
  } : null;

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isError || !consumerUser) {
    return (
      <div className="p-4 md:p-6 2xl:p-10">
         <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-red-500">Error loading consumer details or user not found.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4">
         <div className="flex items-center gap-2 mb-8">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
             {consumerUser.name}&apos;s Wallet
          </h1>
          <p className="mt-4 text-lg text-gray-600">
             Overview of points balance and transaction history.
          </p>
          <div className="mt-2 text-sm text-gray-500">
             {consumerUser.email} • {consumerUser.location}
          </div>
        </div>

        <div className="space-y-8">
          <PointsBalanceDisplay
            totalPoints={consumerUser.points}
            matchingPoints={consumerUser.matchingPoints}
            utilization={0} // Not available in API yet
            badgeLevel={consumerUser.badgeLevel}
            isLoading={isLoading}
          />

          <TransactionHistoryTable
            transactions={[]} // Not available in admin API yet
            isLoading={false}
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            activeFilter="All"
            onFilterChange={() => {}}
            filterCategories={['All', 'Earned', 'Spent']}
          />

          <div className="text-center text-sm text-muted-foreground italic mt-4">
             Transaction history is not currently available in the admin view.
          </div>
        </div>
      </div>
    </div>
  );
}
