'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserDataTable } from '@/components/admin/users/UserDataTable';
import { createBusinessColumns, createConsumerColumns } from '@/components/admin/users/columns';
import { mockBusinessUsers as initialMockBusinessUsers, mockConsumerUsers as initialMockConsumerUsers, BusinessUser, ConsumerUser } from '@/lib/mock-data/users';

export default function AdminUsersPage() {
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>(initialMockBusinessUsers);
  const [consumerUsers, setConsumerUsers] = useState<ConsumerUser[]>(initialMockConsumerUsers);

  const handleUpdateUser = (updatedUser: BusinessUser | ConsumerUser) => {
    if ('tier' in updatedUser) { // It's a BusinessUser
      setBusinessUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
    } else { // It's a ConsumerUser
      setConsumerUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
    }
  };

  const handleDeleteUser = (userId: string, userType: 'business' | 'consumer') => {
    if (userType === 'business') {
      setBusinessUsers((prev) => prev.filter((user) => user.id !== userId));
    } else {
      setConsumerUsers((prev) => prev.filter((user) => user.id !== userId));
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
    } else {
      setConsumerUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, points: user.points + amount } : user
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
    } else {
      // Consumer users don't have activityStatus, but we can simulate suspension
      // For now, let's just log it. In a real app, this would update a 'status' field.
      console.log(`Consumer user ${userId} suspended (simulated)`);
    }
  };


  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all business and consumer accounts on the platform.</p>
      </div>

      <Tabs defaultValue="business">
        <TabsList className="grid w-full grid-cols-2 sm:w-96">
          <TabsTrigger value="business">Business Owners</TabsTrigger>
          <TabsTrigger value="consumer">Consumers</TabsTrigger>
        </TabsList>
        <TabsContent value="business" className="mt-6">
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
        </TabsContent>
        <TabsContent value="consumer" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}