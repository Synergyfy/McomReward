'use client';

import React, { useState } from 'react';
import { useGetCreditsRules, useDeleteCreditsRule, useUpdateCreditsRule, useGetAdminCreditsHistory } from '@/services/cashback/hook';
import { CreditsRule } from '@/services/cashback/types';
import CreditsRuleDialog from '@/components/admin/cashback/CashbackRuleDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, History as HistoryIcon, Zap, Wallet, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CreditsRulesPage() {
  // --- Rules State ---
  const { data: rules, isLoading: isRulesLoading, refetch } = useGetCreditsRules();
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteCreditsRule();
  const { mutate: updateRule } = useUpdateCreditsRule();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<CreditsRule | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<CreditsRule | null>(null);

  // --- History State ---
  const [historyPage, setHistoryPage] = useState(1);
  const [historyEmail, setHistoryEmail] = useState('');
  const [debouncedEmail, setDebouncedEmail] = useState('');
  const { data: historyData, isLoading: isHistoryLoading } = useGetAdminCreditsHistory(historyPage, 10, debouncedEmail || undefined);

  // --- Rules Handlers ---
  const handleCreate = () => {
    setRuleToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (rule: CreditsRule) => {
    setRuleToEdit(rule);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (rule: CreditsRule) => {
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

  const toggleActive = (rule: CreditsRule, checked: boolean) => {
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
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Credits Engine</h1>
          <p className="text-slate-500 font-medium">Manage global credit rules and audit platform-wide reward conversions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="font-bold h-10 border-slate-200" onClick={() => window.open('/admin/cashback/monitoring', '_blank')}>
            <HistoryIcon className="mr-2 h-4 w-4 text-indigo-500" /> Live Audit Feed
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard title="Total Credits Issued" value="42,850 CR" subtext="All platform events" icon={<Zap className="w-5 h-5 text-amber-500" />} />
        <MetricCard title="Matching Value" value="£28,400.00" subtext="Real money contributed" icon={<Wallet className="w-5 h-5 text-emerald-500" />} />
        <MetricCard title="Active Reward Pool" value="£12,400.00" subtext="Unspent claiming potential" icon={<TrendingUp className="w-5 h-5 text-indigo-500" />} />
        <MetricCard title="Active Rules" value={String(rules?.filter(r => r.isActive).length || 0)} subtext="Live earning triggers" icon={<HistoryIcon className="w-5 h-5 text-slate-500" />} />
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl h-11 border border-slate-200">
          <TabsTrigger value="rules" className="rounded-lg font-bold text-xs px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">RULES CONFIGURATION</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg font-bold text-xs px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">PLATFORM HISTORY</TabsTrigger>
        </TabsList>

        {/* --- Rules Tab --- */}
        <TabsContent value="rules" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 font-bold h-10 px-6 shadow-lg shadow-indigo-100">
              <Plus className="mr-2 h-4 w-4" /> Create New Rule
            </Button>
          </div>

          <div className="border border-slate-100 rounded-2xl shadow-2xl bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-6">Platform</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Level</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Event Type</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Reward Rate</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Created</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules && rules.length > 0 ? (
                  rules.map((rule) => (
                    <TableRow key={rule.id} className="group hover:bg-slate-50 transition-colors border-slate-50">
                      <TableCell className="font-black text-sm text-slate-900 px-6">{rule.platform === 'MCOM_LOYALTY' ? 'Loyalty Engine' : 'Mall Platform'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold border-slate-200">Level {rule.level || 1}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-slate-600">{(rule.eventType || '').replace(/_/g, ' ')}</TableCell>
                      <TableCell className="font-black text-indigo-600">
                        {rule.rewardType === 'PERCENTAGE' ? `${rule.rewardValue}%` : `${Number(rule.rewardValue)} CR`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Switch
                            id={`switch-${rule.id}`}
                            checked={rule.isActive}
                            onCheckedChange={(c) => toggleActive(rule, c)}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                          <Badge variant={rule.isActive ? 'default' : 'secondary'} className={rule.isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : ''}>
                            {rule.isActive ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 font-bold text-[11px]">
                        {rule.createdAt ? format(new Date(rule.createdAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)} className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(rule)} className="h-8 w-8 hover:bg-red-50 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold">
                      No rules configured in the credits engine.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* --- History Tab --- */}
        <TabsContent value="history" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800">Global Ledger</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  placeholder="Filter by user email..."
                  className="pl-10 w-[280px] h-10 border-slate-200 focus-visible:ring-indigo-500 font-medium"
                  value={historyEmail}
                  onChange={(e) => setHistoryEmail(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" className="font-bold px-6 border-slate-200">Filter</Button>
            </form>
          </div>

          <div className="border border-slate-100 rounded-2xl shadow-2xl bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-6">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Participant</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Activity</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Source</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400 px-6">Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isHistoryLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="animate-spin h-8 w-8 mx-auto text-indigo-600 opacity-20" />
                    </TableCell>
                  </TableRow>
                ) : historyItems.length > 0 ? (
                  historyItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50 transition-colors border-slate-50">
                      <TableCell className="text-[11px] font-black text-slate-400 px-6 whitespace-nowrap">
                        {item.createdAt ? format(new Date(item.createdAt), 'MMM d, HH:mm') : '-'}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">
                        {item.wallet?.user?.email || 'System Operation'}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-600">{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-slate-200 text-slate-500">
                          {item.sourcePlatform === 'MCOM_LOYALTY' ? 'Loyalty Engine' : 'Global Hub'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-black px-6 ${Number(item.amount ?? 0) >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {Number(item.amount ?? 0) >= 0 ? '+' : ''}{item.unit === 'GBP' ? '£' : ''}{Math.abs(Number(item.amount ?? 0)).toFixed(2)}{item.unit === 'CREDITS' ? ' CR' : ''}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-bold">
                      No matching records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!isHistoryLoading && historyItems.length > 0 && (
            <div className="flex items-center justify-end space-x-4 py-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Page {historyPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 font-bold border-slate-200 bg-white"
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 font-bold border-slate-200 bg-white"
                  onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                  disabled={historyPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreditsRuleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ruleToEdit={ruleToEdit}
        onSuccess={refetch}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Archive Rule?</DialogTitle>
            <DialogDescription className="font-medium">
              Are you sure you want to remove this credit rule? Historical data will remain but no new credits will be issued.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1 font-bold h-11 border-slate-200" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" className="flex-1 font-bold h-11 bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ title, value, subtext, icon }: any) {
  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
            {icon}
          </div>
          <Badge variant="outline" className="text-[9px] font-black border-slate-100 text-slate-400 uppercase tracking-tighter">System Stat</Badge>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
        <p className="text-[10px] text-slate-500 font-bold italic mt-2 opacity-70 leading-none">{subtext}</p>
      </CardContent>
    </Card>
  );
}
