'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Tag as TagIcon, DollarSign, CheckCircle, XCircle, Star, Edit, Trash2, Eye } from 'lucide-react';
import { mockDeals, Deal } from '@/lib/mock-data/deals';
import { initialSectors } from '@/lib/mock-data/sectors';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { AddEditDealModal } from '@/components/admin/deals-management/AddEditDealModal';
import { ViewDealDetailsModal } from '@/components/admin/deals-management/ViewDealDetailsModal';

export default function DealsManagementPage() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSector, setFilterSector] = useState('all');

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState({
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

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            deal.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || deal.status === filterStatus;
      const matchesSector = filterSector === 'all' || deal.sectorId === filterSector;
      return matchesSearch && matchesStatus && matchesSector;
    });
  }, [deals, searchTerm, filterStatus, filterSector]);

  const handleAddEditDeal = (deal?: Deal) => {
    setCurrentEditDeal(deal);
    setShowAddEditDealModal(true);
  };

  const handleSaveDeal = (savedDeal: Deal) => {
    // Close the AddEditDealModal first
    setShowAddEditDealModal(false);

    // Then, after a short delay, show the feedback dialog
    setTimeout(() => {
      if (savedDeal.id.startsWith('new-')) {
        setDeals(prev => [...prev, { ...savedDeal, id: `deal-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() }]);
        handleShowFeedback("Deal Added", `Deal "${savedDeal.title}" has been added.`);
      } else {
        setDeals(prev => prev.map(deal => (deal.id === savedDeal.id ? { ...savedDeal, updatedAt: new Date() } : deal)));
        handleShowFeedback("Deal Updated", `Deal "${savedDeal.title}" has been updated.`);
      }
    }, 300); // A small delay (e.g., 300ms) to allow the modal to close
  };

  const handleDeleteDeal = (dealId: string) => {
    // In a real app, this would trigger a confirmation dialog first
    setDeals(prev => prev.filter(deal => deal.id !== dealId));
    handleShowFeedback("Deal Deleted", `Deal ${dealId} has been deleted.`);
  };

  const handleApproveRejectDeal = (dealId: string, newStatus: 'active' | 'rejected') => {
    setDeals(prev => prev.map(deal => (deal.id === dealId ? { ...deal, status: newStatus, updatedAt: new Date() } : deal)));
    handleShowFeedback("Deal Status Updated", `Deal ${dealId} has been ${newStatus}.`);
  };

  const handleToggleFeatured = (dealId: string) => {
    setDeals(prev => prev.map(deal => (deal.id === dealId ? { ...deal, isFeatured: !deal.isFeatured, updatedAt: new Date() } : deal)));
    handleShowFeedback("Deal Featured Status", `Deal ${dealId} featured status toggled.`);
  };

  const handleViewDealDetails = (deal: Deal) => {
    setCurrentViewDeal(deal);
    setShowViewDealModal(true);
  };

  const getStatusBadgeVariant = (status: Deal['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_approval': return 'secondary';
      case 'rejected': return 'destructive';
      case 'draft': return 'outline';
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSector} onValueChange={setFilterSector}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {initialSectors.map(sector => (
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
                <TableHead>Price</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No deals found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.title}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(deal.status)}>{deal.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>£{deal.price.toFixed(2)}</TableCell>
                    <TableCell>{initialSectors.find(s => s.id === deal.sectorId)?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {deal.isFeatured ? <Star className="h-4 w-4 text-yellow-500" /> : '-'}
                    </TableCell>
                    <TableCell>{deal.submittedByBusinessId || 'Admin'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDealDetails(deal)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddEditDeal(deal)}><Edit className="h-4 w-4" /></Button>
                        {deal.status === 'pending_approval' && (
                          <>
                            <Button variant="success" size="sm" onClick={() => handleApproveRejectDeal(deal.id, 'active')}><CheckCircle className="h-4 w-4" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => handleApproveRejectDeal(deal.id, 'rejected')}><XCircle className="h-4 w-4" /></Button>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>B2B Exchange Activities Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section will provide tools and reports for monitoring B2B exchange activities. (Future Enhancement)</p>
          <Button variant="outline" className="mt-4">View B2B Reports</Button>
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