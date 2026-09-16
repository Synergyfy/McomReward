'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, Shield, Loader2 } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddEditRoleModal } from '@/components/admin/security/AddEditRoleModal';
import { Role } from '@/services/security/types';
import {
  useGetRoles,
  useGetPermissions,
  useDeleteRole,
  useGetAuditLogs,
} from '@/services/security/hook';

export default function SecurityPage() {
  const { data: roles = [], isLoading: isLoadingRoles } = useGetRoles();
  const { data: permissions = [] } = useGetPermissions();
  const { data: auditLogsData, isLoading: isLoadingAuditLogs } = useGetAuditLogs({ page: 1, limit: 100 });
  const deleteRoleMutation = useDeleteRole();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

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

  // State for Add/Edit Role Modal
  const [showAddEditRoleModal, setShowAddEditRoleModal] = useState(false);
  const [currentEditRole, setCurrentEditRole] = useState<Role | undefined>(undefined);

  const handleAddEditRole = (role?: Role) => {
    setCurrentEditRole(role);
    setShowAddEditRoleModal(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteRoleMutation.mutate(roleId, {
        onSuccess: () => {
          handleShowFeedback("Role Deleted", `Role ${roleId} has been deleted.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to delete role.");
        },
      });
    }
  };

  const auditLogs = auditLogsData?.data ?? [];

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));

  const permissionName = (id: string) => permissions.find(p => p.id === id)?.name || id;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" /> Security, Permissions & Audit Trails
        </h1>
        <p className="text-muted-foreground">Protect platform integrity and ensure accountability.</p>
      </div>

      <Tabs defaultValue="role-management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="role-management">Role Management</TabsTrigger>
          <TabsTrigger value="audit-trails">Audit Trails</TabsTrigger>
        </TabsList>

        {/* Role Management Tab */}
        <TabsContent value="role-management">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Roles</CardTitle>
                <Button onClick={() => handleAddEditRole()}><PlusCircle className="mr-2 h-4 w-4" /> Create New Role</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRoles ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No roles found.
                        </TableCell>
                      </TableRow>
                    )}
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map(permId => (
                              <Badge key={permId} variant="secondary">{permissionName(permId)}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleAddEditRole(role)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteRole(role.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trails Tab */}
        <TabsContent value="audit-trails">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <CardTitle>Audit Trails</CardTitle>
                <div className="flex gap-4 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full max-w-sm"
                    />
                  </div>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {uniqueActions.map(action => (
                        <SelectItem key={action} value={action}>{action}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAuditLogs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No audit logs found.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredAuditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.userName} ({log.userId})</TableCell>
                        <TableCell><Badge>{log.action}</Badge></TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>GDPR & Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This section will provide tools for GDPR and compliance controls, such as data consent and anonymization. (Future Enhancement)</p>
            <Button variant="outline" className="mt-4">Manage Compliance</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Export Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This section will provide logs of all data exports and downloads from the platform. (Future Enhancement)</p>
            <Button variant="outline" className="mt-4">View Export Logs</Button>
          </CardContent>
        </Card>
      </div>

      <AddEditRoleModal
        isOpen={showAddEditRoleModal}
        onClose={() => setShowAddEditRoleModal(false)}
        initialData={currentEditRole}
        onShowFeedback={handleShowFeedback}
      />

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}