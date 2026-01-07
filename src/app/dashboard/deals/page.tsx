'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  Tag
} from 'lucide-react';
import { useGetDeals, useDeleteDeal, useDeactivateDeal } from '@/services/deals/hook';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '@/components/ui/Loading';
import DealItem from '@/components/dashboard/deals/DealItem';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DealsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'declined' | 'flagged'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: dealsData,
    isLoading,
    isRefetching,
  } = useGetDeals({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
    page: currentPage,
    limit,
  });

  const { mutate: deleteDeal } = useDeleteDeal();
  const { mutate: deactivateDeal } = useDeactivateDeal();

  const handleDeactivate = (id: string) => {
    const deal = dealsData?.data.find(d => d.id === id);
    if (!deal) return;

    deactivateDeal(
      { id, isActive: !deal.isActive },
      {
        onSuccess: () => {
          toast.success(`Deal ${deal.isActive ? 'deactivated' : 'activated'} successfully`);
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this deal permanently?')) {
      deleteDeal(id, {
        onSuccess: () => {
          toast.success('Deal deleted successfully');
        }
      });
    }
  };

  // derived stats
  const stats = useMemo(() => {
    if (!dealsData) return { total: 0, active: 0, pending: 0, expired: 0 };
    return {
      total: dealsData.total || 0,
      active: dealsData.data.filter(d => d.status === 'approved' && d.isActive).length,
      pending: dealsData.data.filter(d => d.status === 'pending').length,
      expired: dealsData.data.filter(d => new Date(d.endDate) < new Date()).length
    };
  }, [dealsData]);

  if (isLoading && !isRefetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4 animate-pulse">Loading your premium deals...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="px-3 py-1 text-primary border-primary/20 bg-primary/5 rounded-full font-bold uppercase tracking-wider text-[10px]">
            Deal Excellence
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Manage <span className="text-primary">Deals</span>
          </h1>
          <p className="text-gray-500 max-w-md">
            Create, monitor, and optimize your business offers to drive customer engagement.
          </p>
        </div>
        <Link href="/dashboard/deals/create">
          <Button className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 font-bold text-base gap-2">
            <PlusCircle className="h-5 w-5" />
            Create New Deal
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Deals', value: stats.total, icon: Tag, color: 'text-primary' },
          { label: 'Live Deals', value: stats.active, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Awaiting Approval', value: stats.pending, icon: Clock, color: 'text-amber-500' },
          { label: 'Expired/Inactive', value: stats.expired, icon: AlertCircle, color: 'text-rose-500' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl bg-gray-50 group-hover:scale-110 transition-transform", s.color)}>
                <s.icon size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Growth</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{s.value}</p>
            <p className="text-sm font-medium text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md py-4 -mx-4 px-4 rounded-b-3xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <Input
              placeholder="Search by title, description or terms..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-14 pl-12 rounded-2xl border-gray-100 bg-white focus:ring-primary/20 transition-all text-base shadow-sm"
            />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <Select
              value={statusFilter}
              onValueChange={value => {
                setStatusFilter(value as any);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] h-14 rounded-2xl border-gray-100 bg-white shadow-sm font-semibold">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved & Live</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={value => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] h-14 rounded-2xl border-gray-100 bg-white shadow-sm font-semibold">
                <SelectValue placeholder="Deal Type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DISCOUNT">Discount</SelectItem>
                <SelectItem value="BOGO">BOGO</SelectItem>
                <SelectItem value="CASHBACK">Cashback</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm h-14 shrink-0">
              <Button variant="ghost" size="icon" className="h-full px-4 rounded-xl text-primary bg-primary/5">
                <LayoutGrid size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="h-full px-4 rounded-xl text-gray-400 hover:text-gray-600">
                <ListIcon size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {dealsData?.data && dealsData.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 px-1">
            {dealsData.data.map(deal => (
              <DealItem
                key={deal.id}
                deal={deal}
                onDeactivate={handleDeactivate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 text-gray-300">
              <Tag size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-500 mb-8 max-w-sm text-center px-4">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl font-bold"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Improved Pagination */}
        {dealsData && dealsData.total > limit && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-100 px-4">
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="text-gray-900 font-bold">{(currentPage - 1) * limit + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * limit, dealsData.total)}</span> of <span className="text-gray-900 font-bold">{dealsData.total}</span> premium deals
            </p>
            <div className="flex items-center gap-4">
              <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-10 w-10 disabled:opacity-30"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </Button>
                <div className="flex items-center px-4">
                  <span className="text-sm font-bold text-primary">Page {currentPage}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-10 w-10 disabled:opacity-30"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!dealsData?.nextPage}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
