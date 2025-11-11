'use client';

import { useState } from 'react';
import { UserDataTable } from '@/components/admin/users/UserDataTable';
import { createBusinessColumns } from '@/components/admin/users/columns';
import { mockBusinessUsers as initialMockBusinessUsers, BusinessUser, ConsumerUser } from '@/lib/mock-data/users';

export default function AdminBusinessUsersPage() {
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>(initialMockBusinessUsers);

  const handleUpdateUser = (updatedUser: BusinessUser | ConsumerUser) => {
    if ('tier' in updatedUser) { // It's a BusinessUser
      setBusinessUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
    }
    // No need to handle consumer users here
  };

  const handleDeleteUser = (userId: string, userType: 'business' | 'consumer') => {
    if (userType === 'business') {
      setBusinessUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  const handleAdjustUserPoints = (userId: string, userType: 'business' | 'consumer', amount: number, reason: string) => {
    console.log(`Adjusting points for ${userType} user ${userId} by ${amount} for reason: ${reason}`);
    if (userType === 'business') {
      setBusinessUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, pointsBalance: user.pointsBalance + amount } : user
        )
      );
    }
  };

  const handleSuspendUser = (userId: string, userType: 'business' | 'consumer') => {
    console.log(`Suspending ${userType} user ${userId}`);
    if (userType === 'business') {
      setBusinessUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, activityStatus: 'Suspended' } : user
        )
      );
    }
  };

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
      </div>
    </div>
  );
}
