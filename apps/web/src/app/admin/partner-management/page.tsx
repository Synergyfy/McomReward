'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Handshake, Edit, Trash2, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { AddEditPartnerModal } from '@/components/admin/partner-management/AddEditPartnerModal';
import { ViewPartnerDetailsModal } from '@/components/admin/partner-management/ViewPartnerDetailsModal';
import { Partner, CreatePartnerDto } from '@/services/partners/types';
import {
  useGetAdminPartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  useTogglePartnerStatus,
} from '@/services/partners/hook';

export default function PartnerManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: partnersData, isLoading } = useGetAdminPartners({
    page,
    limit,
    search: searchTerm || undefined,
    type: filterType === 'all' ? undefined : (filterType as Partner['type']),
    status: filterStatus === 'all' ? undefined : (filterStatus as Partner['status']),
  });
  const totalPages = Math.max(1, Math.ceil((partnersData?.total ?? 0) / limit));
  const createPartnerMutation = useCreatePartner();
  const updatePartnerMutation = useUpdatePartner();
  const deletePartnerMutation = useDeletePartner();
  const togglePartnerStatusMutation = useTogglePartnerStatus();

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

  // State for Add/Edit Partner Modal
  const [showAddEditPartnerModal, setShowAddEditPartnerModal] = useState(false);
  const [currentEditPartner, setCurrentEditPartner] = useState<Partner | undefined>(undefined);

  // State for View Partner Details Modal
  const [showViewPartnerModal, setShowViewPartnerModal] = useState(false);
  const [currentViewPartner, setCurrentViewPartner] = useState<Partner | undefined>(undefined);

  const partners = partnersData?.data ?? [];

  const handleAddEditPartner = (partner?: Partner) => {
    setCurrentEditPartner(partner);
    setShowAddEditPartnerModal(true);
  };

  const handleSavePartner = (dto: CreatePartnerDto) => {
    if (currentEditPartner) {
      updatePartnerMutation.mutate(
        { id: currentEditPartner.id, ...dto },
        {
          onSuccess: () => {
            handleShowFeedback("Partner Updated", `Partner "${dto.name}" has been updated.`);
          },
          onError: (error: any) => {
            handleShowFeedback("Error", error?.response?.data?.message || "Failed to update partner.");
          },
        }
      );
    } else {
      createPartnerMutation.mutate(dto, {
        onSuccess: () => {
          handleShowFeedback("Partner Added", `Partner "${dto.name}" has been added.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to create partner.");
        },
      });
    }
    setShowAddEditPartnerModal(false);
  };

  const handleDeletePartner = (partnerId: string) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      deletePartnerMutation.mutate(partnerId, {
        onSuccess: () => {
          handleShowFeedback("Partner Deleted", `Partner ${partnerId} has been deleted.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to delete partner.");
        },
      });
    }
  };

  const handleToggleStatus = (partner: Partner) => {
    const nextStatus = partner.status === 'active' ? 'inactive' : 'active';
    togglePartnerStatusMutation.mutate(
      { id: partner.id, status: nextStatus },
      {
        onSuccess: () => {
          handleShowFeedback("Partner Status Toggled", `Partner "${partner.name}" status has been changed to ${nextStatus}.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to update partner status.");
        },
      }
    );
  };

  const handleViewPartnerDetails = (partner: Partner) => {
    setCurrentViewPartner(partner);
    setShowViewPartnerModal(true);
  };

  const getStatusBadgeVariant = (status: Partner['status']) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partner Management</h1>
        <p className="text-muted-foreground">Oversee branded and partner-specific platforms connected to MCOM Rewards.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <CardTitle>All Partners</CardTitle>
            <div className="flex gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full max-w-sm"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Co-Brand">Co-Brand</SelectItem>
                  <SelectItem value="White-Label">White-Label</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => handleAddEditPartner()}><PlusCircle className="mr-2 h-4 w-4" /> Create New Partner</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Revenue Share</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No partners found.
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.type}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(partner.status)}>{partner.status}</Badge>
                      </TableCell>
                      <TableCell>{partner.subdomain}</TableCell>
                      <TableCell>{partner.revenueSharing}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewPartnerDetails(partner)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddEditPartner(partner)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(partner)}>
                            {partner.status === 'active' ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePartner(partner.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {(partnersData?.total ?? 0) > limit && (
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddEditPartnerModal
        isOpen={showAddEditPartnerModal}
        onClose={() => setShowAddEditPartnerModal(false)}
        initialData={currentEditPartner}
        onSave={handleSavePartner}
        onShowFeedback={handleShowFeedback}
      />

      <ViewPartnerDetailsModal
        isOpen={showViewPartnerModal}
        onClose={() => setShowViewPartnerModal(false)}
        partner={currentViewPartner}
      />

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}