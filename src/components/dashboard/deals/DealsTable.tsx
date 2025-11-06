'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Deal, DealCategory, dealsData } from '@/lib/mock-data/deals';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DealStatsModal from './DealStatsModal';

interface DealsTableProps {
  deals: Deal[];
}

const categories = ['Food & Drink', 'Retail', 'Services', 'Entertainment', 'Travel'];
const statuses = ['Active', 'Scheduled', 'Expired'];

export default function DealsTable({ deals }: DealsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedDealForStats, setSelectedDealForStats] = useState<Deal | null>(null);

  const handleViewStats = (deal: Deal) => {
    setSelectedDealForStats(deal);
    setIsStatsModalOpen(true);
  };

  const getStatusVariant = (status: Deal['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Scheduled':
        return 'outline';
      case 'Expired':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || deal.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [deals, searchTerm, statusFilter, categoryFilter]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Deals</CardTitle>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.title}</TableCell>
                  <TableCell>{deal.type}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(deal.status)}>
                      {deal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{deal.endDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewStats(deal)}>View Stats</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/campaigns/create?dealName=${encodeURIComponent(deal.title)}`}>
                            Connect to Campaign
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <DealStatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} deal={selectedDealForStats} />
    </>
  );
}
