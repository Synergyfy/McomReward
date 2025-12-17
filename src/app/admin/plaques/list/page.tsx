'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2, QrCode, Share2, Ban, Printer } from 'lucide-react';
import { mockPlaqueGroups } from '@/lib/mock-data/plaque-groups';
import { mockBusinessUsers } from '@/lib/mock-data/users';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TransferPlaqueModal } from '@/components/admin/plaques/TransferPlaqueModal';
import { RetirePlaqueModal } from '@/components/admin/plaques/RetirePlaqueModal';
import { AddEditPlaqueModal } from '@/components/admin/plaques/AddEditPlaqueModal';
import { useGetAdminQrPlaques, useDeleteAdminQrPlaque, useUpdateAdminQrPlaque } from '@/services/qr-plaques/hook';
import { QrPlaque } from '@/services/qr-plaques/types';

export default function PlaqueListPage() {
  const router = useRouter();

  // API Hooks
  const { data: plaquesData, isLoading } = useGetAdminQrPlaques();
  const { mutate: deletePlaque } = useDeleteAdminQrPlaque();
  const { mutate: updatePlaque, isPending: isUpdating } = useUpdateAdminQrPlaque();

  const plaques = plaquesData || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{ title: string; description: React.ReactNode; actionText: string }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  // State for Add/Edit Plaque Modal
  const [showAddEditPlaqueModal, setShowAddEditPlaqueModal] = useState(false);
  const [currentPlaqueForEdit, setCurrentPlaqueForEdit] = useState<QrPlaque | undefined>(undefined);

  // State for Transfer Plaque Modal
  const [showTransferPlaqueModal, setShowTransferPlaqueModal] = useState(false);
  const [currentPlaqueForTransfer, setCurrentPlaqueForTransfer] = useState<QrPlaque | undefined>(undefined);

  // State for Retire Plaque Modal
  const [showRetirePlaqueModal, setShowRetirePlaqueModal] = useState(false);
  const [currentPlaqueForRetire, setCurrentPlaqueForRetire] = useState<QrPlaque | undefined>(undefined);

  const filteredPlaques = useMemo(() => {
    return plaques.filter(plaque => {
      const matchesSearch = plaque.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            plaque.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            plaque.id.toLowerCase().includes(searchTerm.toLowerCase());
      // const matchesGroup = filterGroup === 'all' || plaque.groupId === filterGroup; // Group not in API yet
      const matchesOwner = filterOwner === 'all' || plaque.assignedBusinessId === filterOwner;
      const matchesStatus = filterStatus === 'all' || plaque.status === filterStatus;
      return matchesSearch && matchesOwner && matchesStatus;
    });
  }, [plaques, searchTerm, filterGroup, filterOwner, filterStatus]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'SOLD': return 'success';
      case 'RETIRED': return 'secondary';
      case 'LOST': return 'destructive';
      case 'INACTIVE': return 'outline';
      default: return 'outline';
    }
  };

  const handleDeletePlaque = (plaqueId: string) => {
    if (confirm('Are you sure you want to delete this plaque?')) {
        deletePlaque(plaqueId);
    }
  };

  const handleOpenEditPlaqueModal = (plaque: QrPlaque) => {
    setCurrentPlaqueForEdit(plaque);
    setShowAddEditPlaqueModal(true);
  };

  // Refactored to handle mutation here
  const handleSavePlaque = (plaqueData: any) => {
     if (currentPlaqueForEdit) {
         updatePlaque({
             id: currentPlaqueForEdit.id,
             data: {
                 name: plaqueData.name,
                 description: plaqueData.description,
                 assignedBusinessId: plaqueData.assignedBusinessId,
                 status: plaqueData.status,
                 qrCodeUrl: plaqueData.qrCodeUrl
             }
         }, {
             onSuccess: () => {
                 handleShowFeedback("Plaque Updated", `Plaque "${plaqueData.name}" has been updated.`);
                 setShowAddEditPlaqueModal(false);
             }
         });
     }
  };

  const handleOpenTransferPlaqueModal = (plaque: QrPlaque) => {
    setCurrentPlaqueForTransfer(plaque);
    setShowTransferPlaqueModal(true);
  };

  const handleTransferSuccess = () => {
      handleShowFeedback("Plaque Transferred", `Plaque successfully transferred.`);
  };

  const handleOpenRetirePlaqueModal = (plaque: QrPlaque) => {
    setCurrentPlaqueForRetire(plaque);
    setShowRetirePlaqueModal(true);
  };

  const handleRetireSuccess = () => {
    handleShowFeedback("Plaque Status Updated", `Plaque status updated.`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plaque List</h1>
        <p className="text-muted-foreground">Show all plaques with filters for group, owner, and status.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <CardTitle>All Plaques</CardTitle>
            <div className="flex gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, owner, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full max-w-sm"
                />
              </div>
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="all">All Groups</SelectItem>
                  {mockPlaqueGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterOwner} onValueChange={setFilterOwner}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by owner" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="all">All Owners</SelectItem>
                  {mockBusinessUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scans</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">Loading plaques...</TableCell>
                  </TableRow>
              ) : filteredPlaques.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No plaques found.
                  </TableCell>
                  </TableRow>
              ) : (
                filteredPlaques.map((plaque) => (
                  <TableRow key={plaque.id}>
                    <TableCell className="font-medium">{plaque.id}</TableCell>
                    <TableCell>{plaque.name}</TableCell>
                    <TableCell>{plaque.groupName || 'N/A'}</TableCell>
                    <TableCell>{plaque.ownerName || plaque.assignedBusinessId || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(plaque.status) as any}>{plaque.status}</Badge>
                    </TableCell>
                    <TableCell>{plaque.scans || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/plaques/${plaque.id}`}>
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditPlaqueModal(plaque)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenTransferPlaqueModal(plaque)}><Share2 className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenRetirePlaqueModal(plaque)}><Ban className="h-4 w-4" /></Button>
                        <Link href={`/admin/plaques/${plaque.id}/print`}>
                          <Button variant="outline" size="sm"><Printer className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePlaque(plaque.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddEditPlaqueModal
        isOpen={showAddEditPlaqueModal}
        onClose={() => setShowAddEditPlaqueModal(false)}
        initialData={currentPlaqueForEdit}
        onSave={handleSavePlaque}
        onShowFeedback={handleShowFeedback}
        isSaving={isUpdating}
      />

      <TransferPlaqueModal
        isOpen={showTransferPlaqueModal}
        onClose={() => setShowTransferPlaqueModal(false)}
        plaque={currentPlaqueForTransfer}
        onSuccess={handleTransferSuccess}
      />

      <RetirePlaqueModal
        isOpen={showRetirePlaqueModal}
        onClose={() => setShowRetirePlaqueModal(false)}
        plaque={currentPlaqueForRetire}
        onSuccess={handleRetireSuccess}
      />

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}
