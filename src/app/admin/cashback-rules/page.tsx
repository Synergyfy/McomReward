'use client';

import React, { useState } from 'react';
import { useGetCashbackRules, useDeleteCashbackRule, useUpdateCashbackRule, useGetAdminCashbackHistory } from '@/services/cashback/hook';
import { CashbackRule } from '@/services/cashback/types';
import CashbackRuleDialog from '@/components/admin/cashback/CashbackRuleDialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CashbackRulesPage() {
  // --- Rules State ---
  const { data: rules, isLoading: isRulesLoading, refetch } = useGetCashbackRules();
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteCashbackRule();
  const { mutate: updateRule } = useUpdateCashbackRule();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<CashbackRule | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<CashbackRule | null>(null);

  // --- History State ---
  const [historyPage, setHistoryPage] = useState(1);
  const [historyEmail, setHistoryEmail] = useState('');
  const [debouncedEmail, setDebouncedEmail] = useState(''); // Simple debounce could be added
  const { data: historyData, isLoading: isHistoryLoading } = useGetAdminCashbackHistory(historyPage, 10, debouncedEmail || undefined);

  // --- Rules Handlers ---
  const handleCreate = () => {
    setRuleToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (rule: CashbackRule) => {
    setRuleToEdit(rule);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (rule: CashbackRule) => {
    setRuleToDelete(rule);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (ruleToDelete) {
      deleteRule(ruleToDelete.id, {
        onSuccess: () => {
          toast.success('Rule deleted');
          setIsDeleteDialogOpen(false);
          setRuleToDelete(null);
        },
        onError: (err) => {
          toast.error(`Failed to delete: ${err.message}`);
        }
      });
    }
  };

  const toggleActive = (rule: CashbackRule, checked: boolean) => {
    updateRule({ id: rule.id, isActive: checked }, {
      onSuccess: () => {
        toast.success(`Rule ${checked ? 'enabled' : 'disabled'}`);
      },
      onError: (err) => {
        toast.error(`Failed to update status: ${err.message}`);
      }
    });
  };

  // --- History Handlers ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedEmail(historyEmail);
    setHistoryPage(1);
  };

  const historyItems = historyData?.data || [];
  const historyMeta = historyData?.meta;
  const totalPages = historyMeta?.totalPages || 1;

  if (isRulesLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-blue-900">Cashback Management</h1>
           <p className="text-muted-foreground">Manage cashback rules and view platform transaction history.</p>
        </div>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList>
          <TabsTrigger value="rules">Rules Configuration</TabsTrigger>
          <TabsTrigger value="history">Platform History</TabsTrigger>
        </TabsList>

        {/* --- Rules Tab --- */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Rule
            </Button>
          </div>

          <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules && rules.length > 0 ? (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.platform === 'MCOM_LOYALTY' ? 'Loyalty' : 'Mall'}</TableCell>
                      <TableCell>{(rule.eventType || '').replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        {rule.rewardType === 'PERCENTAGE' ? `${rule.rewardValue}%` : `£${Number(rule.rewardValue).toFixed(2)}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`switch-${rule.id}`}
                            checked={rule.isActive}
                            onCheckedChange={(c) => toggleActive(rule, c)}
                            aria-label="Toggle active status"
                          />
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {rule.createdAt ? format(new Date(rule.createdAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(rule)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No rules found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* --- History Tab --- */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Global Transactions</h2>
             <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input
                      placeholder="Filter by user email..."
                      className="pl-9 w-[250px]"
                      value={historyEmail}
                      onChange={(e) => setHistoryEmail(e.target.value)}
                   />
                </div>
                <Button type="submit" variant="secondary">Filter</Button>
             </form>
          </div>

          <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isHistoryLoading ? (
                   <TableRow>
                     <TableCell colSpan={6} className="h-24 text-center">
                       <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                     </TableCell>
                   </TableRow>
                ) : historyItems.length > 0 ? (
                  historyItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {item.wallet?.user?.email || 'Unknown User'}
                      </TableCell>
                      <TableCell className="text-sm">{item.eventType || item.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.sourcePlatform === 'MCOM_LOYALTY' ? 'Loyalty' : (item.sourcePlatform === 'MCOM_MALL' ? 'Mall' : item.sourcePlatform || '-')}
                      </TableCell>
                       <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate" title={item.referenceId}>
                        {item.referenceId || '-'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${Number(item.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(item.amount) >= 0 ? '+' : ''}£{Number(item.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isHistoryLoading && historyItems.length > 0 && (
             <div className="flex items-center justify-end space-x-2 py-2">
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Page {historyPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                    disabled={historyPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
              </div>
          )}
        </TabsContent>
      </Tabs>

      <CashbackRuleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ruleToEdit={ruleToEdit}
        onSuccess={refetch}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rule?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cashback rule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
