'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import DealsTable from '@/components/dashboard/deals/DealsTable';
import { useGetDeals } from '@/services/deals/hook';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Deal } from '@/services/deals/types';
import LoadingSpinner from '@/components/ui/Loading';

export default function DealsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'declined'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: dealsData,
    isLoading,
    isError,
  } = useGetDeals({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
    limit,
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div>Error fetching deals</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manage Deals</h1>
        <Link href="/dashboard/deals/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Deal
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search by title..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={value =>
            setStatusFilter(
              value as 'all' | 'pending' | 'approved' | 'declined',
            )
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DealsTable deals={dealsData?.data || []} />
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {dealsData?.page} of{' '}
          {dealsData?.total ? Math.ceil(dealsData.total / limit) : 1}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!dealsData?.nextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
