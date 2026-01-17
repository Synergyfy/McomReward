'use client';

import React, { useState } from 'react';
import { useGetCashbackRules, useDeleteCashbackRule, useUpdateCashbackRule } from '@/services/cashback/hook';
import { CashbackRule } from '@/services/cashback/types';
import CashbackRuleDialog from '@/components/admin/cashback/CashbackRuleDialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CashbackRulesPage() {
  const { data: rules, isLoading, refetch } = useGetCashbackRules();
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteCashbackRule();
  const { mutate: updateRule } = useUpdateCashbackRule(); // For quick toggle

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<CashbackRule | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<CashbackRule | null>(null);

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
        // refetch is automatic via hook onSuccess, but good to be sure
      },
      onError: (err) => {
        toast.error(`Failed to update status: ${err.message}`);
      }
    });
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-blue-900">Cashback Rules</h1>
           <p className="text-muted-foreground">Configure cashback rewards for platform events.</p>
        </div>
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
                  <TableCell>{rule.eventType}</TableCell>
                  <TableCell>
                    {rule.rewardType === 'PERCENTAGE' ? `${rule.rewardValue}%` : `£${Number(rule.rewardValue).toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
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
