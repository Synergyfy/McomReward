"use client";

import React, { useState, useMemo } from 'react';
import DealCard from '@/components/deals/DealCard';
import SearchBar from '@/components/deals/filters/SearchBar';
import { useGetDeals } from '@/services/deals/hook';
import { Deal as ApiDeal } from '@/services/deals/types';
import { Deal as CardDeal, DealCategory } from '@/lib/mock-data/deals';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mapApiStatusToCardStatus = (apiStatus: ApiDeal['status']): CardDeal['status'] => {
  switch (apiStatus) {
    case 'approved':
      return 'active';
    case 'pending':
      return 'pending_approval';
    case 'declined':
      return 'rejected';
    default:
      return 'draft'; // Fallback for any unhandled status
  }
};

const adaptToCardDeal = (deal: ApiDeal): CardDeal => ({
  id: deal.id,
  title: deal.title,
  businessName: deal.business?.name || 'Unknown Business',
  description: deal.description,
  value: `£${deal.value}`,
  price: deal.value,
  startDate: new Date(deal.startDate),
  endDate: new Date(deal.endDate),
  terms: deal.termsAndConditions,
  category: (deal.category?.name as DealCategory) || 'Uncategorized',
  status: mapApiStatusToCardStatus(deal.status),
  imageUrl: deal.imageUrl || '/placeholder-image.jpg',
  sectorId: deal.category?.id || '', // Using category ID as sectorId, or empty string fallback
  isFeatured: false, // Default to false as it's not in ApiDeal
  createdAt: new Date(deal.createdAt),
  updatedAt: new Date(deal.updatedAt),
});

export default function DealsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<
    'approved' | 'declined' | 'pending' | 'all'
  >('approved');
  const [page, setPage] = useState(1);
  const limit = 12;

  const {
    data: dealsData,
    isLoading: isLoadingDeals,
    isError,
  } = useGetDeals({
    page,
    limit,
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    categoryId: undefined, // Category filter removed
  });

  const filteredDeals = useMemo(() => {
    if (!dealsData?.data) return [];
    return dealsData.data.map(adaptToCardDeal);
  }, [dealsData]);

  const totalPages = useMemo(() => {
    if (!dealsData?.total) return 0;
    return Math.ceil(dealsData.total / limit);
  }, [dealsData, limit]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Find Your Next Deal
      </h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
        <SearchBar onSearch={setSearchTerm} />
        <Select
          value={statusFilter}
          onValueChange={value => {
            setStatusFilter(
              value as 'approved' | 'declined' | 'pending' | 'all',
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoadingDeals ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : isError ? (
        <p className="col-span-full text-center text-red-500">
          Error fetching deals. Please try again.
        </p>
      ) : filteredDeals.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="p-2">{`Page ${dealsData?.page || page} of ${totalPages}`}</span>
            <Button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <p className="col-span-full text-center text-gray-500">
          No deals found matching your criteria.
        </p>
      )}
    </div>
  );
}
