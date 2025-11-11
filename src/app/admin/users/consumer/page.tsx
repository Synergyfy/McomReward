'use client';

import { useState } from 'react';
import { UserDataTable } from '@/components/admin/users/UserDataTable';
import { createConsumerColumns } from '@/components/admin/users/columns';
import { mockConsumerUsers as initialMockConsumerUsers, BusinessUser, ConsumerUser } from '@/lib/mock-data/users';

export default function AdminConsumerUsersPage() {
  const [consumerUsers, setConsumerUsers] = useState<ConsumerUser[]>(initialMockConsumerUsers);

  const handleUpdateUser = (updatedUser: BusinessUser | ConsumerUser) => {
    if (!('tier' in updatedUser)) { // It's a ConsumerUser
      setConsumerUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
    }
    // No need to handle business users here
  };

  const handleDeleteUser = (userId: string, userType: 'business' | 'consumer') => {
    if (userType === 'consumer') {
      setConsumerUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  const handleAdjustUserPoints = (userId: string, userType: 'business' | 'consumer', amount: number, reason: string) => {
    console.log(`Adjusting points for ${userType} user ${userId} by ${amount} for reason: ${reason}`);
    if (userType === 'consumer') {
      setConsumerUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, points: user.points + amount } : user
        )
      );
    }
  };

  const handleSuspendUser = (userId: string, userType: 'business' | 'consumer') => {
    console.log(`Suspending ${userType} user ${userId}`);
    if (userType === 'consumer') {
      // Consumer users don't have activityStatus, but we can simulate suspension
      // For now, let's just log it. In a real app, this would update a 'status' field.
      console.log(`Consumer user ${userId} suspended (simulated)`);
    }
  };

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
      </div>
    </div>
  );
}
