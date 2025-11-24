'use client';

import { useState } from 'react';
import { UserDataTable } from '@/components/admin/users/UserDataTable';
import { createBusinessColumns } from '@/components/admin/users/columns';
import { BusinessUser, ConsumerUser } from '@/lib/mock-data/users';
import { useAdminBusinesses } from '@/services/admin/hook';
import { Loader2 } from 'lucide-react';

export default function AdminBusinessUsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: response, isLoading, isError } = useAdminBusinesses(page, limit);

  // Map API data to BusinessUser type
  const businessUsers: BusinessUser[] = response?.data.map((business) => ({
    id: business.id,
    name: business.name,
    email: business.email,
    tier: business.tier as BusinessUser['tier'], // Casting assuming API returns valid values
    sector: business.sector,
    activityStatus: business.activityStatus as BusinessUser['activityStatus'],
    campaignsCreated: business.campaignsCreated,
    rewardsAttached: business.rewardsAttached,
    pointsBalance: business.pointsBalance,
    memberSince: new Date(business.memberSince),
  })) || [];

  const handleUpdateUser = (updatedUser: BusinessUser | ConsumerUser) => {
    console.log('Update user', updatedUser);
  };

  const handleDeleteUser = (userId: string, userType: 'business' | 'consumer') => {
    console.log('Delete user', userId);
  };

  const handleAdjustUserPoints = (userId: string, userType: 'business' | 'consumer', amount: number, reason: string) => {
    console.log('Adjust points', userId, amount, reason);
  };

  const handleSuspendUser = (userId: string, userType: 'business' | 'consumer') => {
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
        <div className="text-red-500">Error loading business users. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Owners Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all business accounts on the platform.</p>
      </div>
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Business User Data Table</h2>
        <UserDataTable
          columns={createBusinessColumns}
          data={businessUsers}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onAdjustUserPoints={handleAdjustUserPoints}
          onSuspendUser={handleSuspendUser}
        />
        {/* Manual Pagination Controls */}
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
