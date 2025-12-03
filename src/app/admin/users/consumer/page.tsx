'use client';

import { useState } from 'react';
import { UserDataTable } from '@/components/admin/users/UserDataTable';
import { createConsumerColumns } from '@/components/admin/users/columns';
import { BusinessUser, ConsumerUser } from '@/lib/mock-data/users';
import { useAdminParticipants } from '@/services/admin/hook';
import { Loader2, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    points: participant.globalTotalPoints,
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

  const totalPages = response?.totalPages || 1;

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5; // Adjust as needed
    const ellipsis = <MoreHorizontal className="h-4 w-4" />;

    if (totalPages <= maxVisiblePages + 2) {
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <Button
                    key={i}
                    variant={page === i ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setPage(i)}
                >
                    {i}
                </Button>
            );
        }
    } else {
        // Always show first page
        items.push(
            <Button
                key={1}
                variant={page === 1 ? "default" : "outline"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setPage(1)}
            >
                1
            </Button>
        );

        if (page > 3) {
            items.push(<div key="start-ellipsis" className="flex items-center justify-center w-8 h-8 text-muted-foreground">{ellipsis}</div>);
        }

        const startPage = Math.max(2, page - 1);
        const endPage = Math.min(totalPages - 1, page + 1);

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Button
                    key={i}
                    variant={page === i ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setPage(i)}
                >
                    {i}
                </Button>
            );
        }

        if (page < totalPages - 2) {
             items.push(<div key="end-ellipsis" className="flex items-center justify-center w-8 h-8 text-muted-foreground">{ellipsis}</div>);
        }

        // Always show last page
        items.push(
            <Button
                key={totalPages}
                variant={page === totalPages ? "default" : "outline"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setPage(totalPages)}
            >
                {totalPages}
            </Button>
        );
    }

    return items;
  };

  const handleViewDetails = (userId: string) => {
    // Implement view details logic, e.g., navigate to a user detail page
    console.log('View details for user', userId);
  };

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Consumer Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all consumer accounts on the platform.</p>
      </div>
      <div className="p-6 border rounded-lg bg-white shadow-sm flex flex-col min-h-[600px]">
        <h2 className="text-xl font-semibold mb-4">Consumer User Data Table</h2>
        <div className="flex-grow">
          <UserDataTable
            columns={createConsumerColumns}
            data={consumerUsers}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAdjustUserPoints={handleAdjustUserPoints}
            onSuspendUser={handleSuspendUser}
            onViewDetails={handleViewDetails}
          />
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 border-t pt-4">
          <div className="text-sm text-gray-500">
             Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, response?.total || 0)} of {response?.total || 0} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-1">
                {renderPaginationItems()}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
