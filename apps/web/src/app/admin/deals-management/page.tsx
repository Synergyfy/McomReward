'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Tag as TagIcon, DollarSign, CheckCircle, XCircle, Star, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { AddEditDealModal } from '@/components/admin/deals-management/AddEditDealModal';
import { ViewDealDetailsModal } from '@/components/admin/deals-management/ViewDealDetailsModal';
import { useGetAdminDeals, useUpdateDealStatus, useDeleteDeal, useCreateDeal, useUpdateDeal } from '@/services/deals/hook';
import { Deal, CreateDealDto } from '@/services/deals/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useGetSectors } from '@/services/sectors/hook';

export default function DealsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: sectors } = useGetSectors();

  // API Hooks — sectorId is now supported by GET /deals/admin/all
  const { data: dealsData, isLoading, isError } = useGetAdminDeals({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    status: filterStatus !== 'all' ? (filterStatus as 'pending' | 'approved' | 'declined') : undefined,
    sectorId: filterSector !== 'all' ? filterSector : undefined,
  });

  const updateStatusMutation = useUpdateDealStatus();
  const deleteDealMutation = useDeleteDeal();
  const createDealMutation = useCreateDeal();
  const updateDealMutation = useUpdateDeal();

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{
    title: string;
    description: React.ReactNode;
    actionText: string;
  }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  // State for Add/Edit Deal Modal
  const [showAddEditDealModal, setShowAddEditDealModal] = useState(false);
  const [currentEditDeal, setCurrentEditDeal] = useState<Deal | undefined>(undefined);

  // State for View Deal Details Modal
  const [showViewDealModal, setShowViewDealModal] = useState(false);
  const [currentViewDeal, setCurrentViewDeal] = useState<Deal | undefined>(undefined);

  const handleAddEditDeal = (deal?: Deal) => {
    setCurrentEditDeal(deal);
    setShowAddEditDealModal(true);
  };

  const handleSaveDeal = async (savedDeal: CreateDealDto) => { // Type 'any' used here because the modal might return a partial object or DTO
    try {
      if (currentEditDeal) {
        await updateDealMutation.mutateAsync({ id: currentEditDeal.id, ...savedDeal });
        handleShowFeedback("Deal Updated", `Deal "${savedDeal.title}" has been updated.`);
      } else {
        await createDealMutation.mutateAsync(savedDeal);
        handleShowFeedback("Deal Added", `Deal "${savedDeal.title}" has been added.`);
      }
      setShowAddEditDealModal(false);
    } catch (error) {
      console.error("Failed to save deal", error);
      handleShowFeedback("Error", "Failed to save deal. Please try again.");
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        await deleteDealMutation.mutateAsync(dealId);
        handleShowFeedback("Deal Deleted", `Deal has been deleted.`);
      } catch (error) {
        console.error("Failed to delete deal", error);
        handleShowFeedback("Error", "Failed to delete deal. Please try again.");
      }
    }
  };

  const handleApproveRejectDeal = async (dealId: string, newStatus: 'approved' | 'declined') => {
    try {
      await updateStatusMutation.mutateAsync({ id: dealId, status: newStatus });
      handleShowFeedback("Deal Status Updated", `Deal has been ${newStatus}.`);
    } catch (error) {
      console.error("Failed to update status", error);
      handleShowFeedback("Error", "Failed to update deal status. Please try again.");
    }
  };

  const handleViewDealDetails = (deal: Deal) => {
    setCurrentViewDeal(deal);
    setShowViewDealModal(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deals Management</h1>
        <p className="text-muted-foreground">Control visibility and performance of business deals and exchanges.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <CardTitle>All Deals</CardTitle>
            <div className="flex gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full max-w-sm"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              {/* Sector filter — wired to backend via sectorId */}
              <Select value={filterSector} onValueChange={(v) => { setFilterSector(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {(sectors || []).map(sector => (
                    <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => handleAddEditDeal()}><PlusCircle className="mr-2 h-4 w-4" /> Create New Deal</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading deals...
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-red-500">
                    Failed to load deals.
                  </TableCell>
                </TableRow>
              ) : dealsData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No deals found.
                  </TableCell>
                </TableRow>
              ) : (
                dealsData?.data.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.title}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(deal.status)}>{deal.status}</Badge>
                    </TableCell>
                    <TableCell>£{Number(deal.value || 0).toFixed(2)}</TableCell>
                    <TableCell>{deal.business?.name || 'N/A'}</TableCell>
                    <TableCell>{deal.business?.sector?.name || 'N/A'}</TableCell>
                    <TableCell>{deal.business?.name || 'Admin'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDealDetails(deal)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddEditDeal(deal)}><Edit className="h-4 w-4" /></Button>
                        {deal.status === 'pending' && (
                          <>
                            <Button variant="default" size="sm" onClick={() => handleApproveRejectDeal(deal.id, 'approved')}><CheckCircle className="h-4 w-4" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => handleApproveRejectDeal(deal.id, 'declined')}><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteDeal(deal.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Simple Pagination Controls */}
          {dealsData && dealsData.total > limit && (
            <div className="flex justify-end mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Page {page} of {Math.ceil(dealsData.total / limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!dealsData.nextPage}
              >
                Next
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>B2B Exchange Activities Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold">{dealsData?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total deals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(dealsData?.data ?? []).filter((d) => d.status === 'approved').length}
              </p>
              <p className="text-xs text-muted-foreground">Approved (this page)</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(dealsData?.data ?? []).filter((d) => d.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">Pending review (this page)</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                £{(dealsData?.data ?? []).reduce((s, d) => s + Number(d.value || 0), 0).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Combined deal value (this page)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddEditDealModal
        isOpen={showAddEditDealModal}
        onClose={() => setShowAddEditDealModal(false)}
        initialData={currentEditDeal}
        onSave={handleSaveDeal}
        onShowFeedback={handleShowFeedback}
      />

      <ViewDealDetailsModal
        isOpen={showViewDealModal}
        onClose={() => setShowViewDealModal(false)}
        deal={currentViewDeal}
      />

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}
