'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Handshake, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { mockPartners, Partner } from '@/lib/mock-data/partners';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { AddEditPartnerModal } from '@/components/admin/partner-management/AddEditPartnerModal'; // Will create this
import { ViewPartnerDetailsModal } from '@/components/admin/partner-management/ViewPartnerDetailsModal'; // Will create this

export default function PartnerManagementPage() {
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            partner.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || partner.type === filterType;
      const matchesStatus = filterStatus === 'all' || partner.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [partners, searchTerm, filterType, filterStatus]);

  const handleAddEditPartner = (partner?: Partner) => {
    setCurrentEditPartner(partner);
    setShowAddEditPartnerModal(true);
  };

  const handleSavePartner = (savedPartner: Partner) => {
    setShowAddEditPartnerModal(false); // Close modal first
    setTimeout(() => {
      if (savedPartner.id.startsWith('new-')) {
        setPartners(prev => [...prev, { ...savedPartner, id: `partner-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() }]);
        handleShowFeedback("Partner Added", `Partner "${savedPartner.name}" has been added.`);
      } else {
        setPartners(prev => prev.map(partner => (partner.id === savedPartner.id ? { ...savedPartner, updatedAt: new Date() } : partner)));
        handleShowFeedback("Partner Updated", `Partner "${savedPartner.name}" has been updated.`);
      }
    }, 300);
  };

  const handleDeletePartner = (partnerId: string) => {
    // In a real app, this would trigger a confirmation dialog first
    setPartners(prev => prev.filter(partner => partner.id !== partnerId));
    handleShowFeedback("Partner Deleted", `Partner ${partnerId} has been deleted.`);
  };

  const handleToggleStatus = (partnerId: string) => {
    setPartners(prev => prev.map(partner => (
      partner.id === partnerId ? { ...partner, status: partner.status === 'active' ? 'inactive' : 'active', updatedAt: new Date() } : partner
    )));
    handleShowFeedback("Partner Status Toggled", `Partner ${partnerId} status has been changed.`);
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
              {filteredPartners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No partners found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPartners.map((partner) => (
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
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(partner.id)}>
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