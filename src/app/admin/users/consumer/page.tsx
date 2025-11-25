'use client';

import { useState } from 'react';
import { UserDataTable } from '@/components/admin/users/UserDataTable';
import { createConsumerColumns } from '@/components/admin/users/columns';
import { BusinessUser, ConsumerUser } from '@/lib/mock-data/users';
import { useAdminParticipants } from '@/services/admin/hook';
import { Loader2 } from 'lucide-react';

export default function AdminConsumerUsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: response, isLoading, isError } = useAdminParticipants(page, limit);

  // Map API data to ConsumerUser type
  const consumerUsers: ConsumerUser[] = response?.data.map((participant) => ({
    id: participant.id,
    name: participant.name,
    email: participant.email,
    badgeLevel: participant.badgeLevel as ConsumerUser['badgeLevel'], // Casting assuming API returns valid values
    location: participant.location,
    activity: participant.activity as ConsumerUser['activity'],
    campaignsJoined: participant.campaignsJoined,
    rewardsRedeemed: participant.rewardsRedeemed,
    points: participant.points,
    matchingPoints: participant.matchingPoints,
    joinedDate: new Date(participant.joinedDate),
  })) || [];

  const handleUpdateUser = (updatedUser: BusinessUser | ConsumerUser) => {
    // Implement update logic if needed, possibly calling a mutation
    console.log('Update user', updatedUser);
  };

  const handleDeleteUser = (userId: string, userType: 'business' | 'consumer') => {
     // Implement delete logic
     console.log('Delete user', userId);
  };

  const handleAdjustUserPoints = (userId: string, userType: 'business' | 'consumer', amount: number, reason: string) => {
    // Implement adjust points logic
    console.log('Adjust points', userId, amount, reason);
  };

  const handleSuspendUser = (userId: string, userType: 'business' | 'consumer') => {
    // Implement suspend logic
    console.log('Suspend user', userId);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="text-red-500">Error loading consumers. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Consumer Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all consumer accounts on the platform.</p>
      </div>
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Consumer User Data Table</h2>
        <UserDataTable
          columns={createConsumerColumns}
          data={consumerUsers}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onAdjustUserPoints={handleAdjustUserPoints}
          onSuspendUser={handleSuspendUser}
        />
        {/* Simple Pagination Controls (since UserDataTable does client-side pagination on the provided data) */}
        {/* If we want true server-side pagination, we'd need to update UserDataTable or provide controls here */}
        <div className="flex justify-end gap-2 mt-4">
             <button
                className="px-4 py-2 text-sm border rounded disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous Page
              </button>
              <span className="flex items-center text-sm">
                Page {page} of {response?.totalPages || 1}
              </span>
              <button
                className="px-4 py-2 text-sm border rounded disabled:opacity-50"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= (response?.totalPages || 1)}
              >
                Next Page
              </button>
        </div>
      </div>
    </div>
  );
}
