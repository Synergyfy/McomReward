'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Package, Plus, Search, Trash2, Edit3, Copy, Layers, FolderOpen,
  Coins, Stamp, X, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SectorTemplate, TemplateReward } from '@/services/loyalty-setup/types';
import type { RewardResponse } from '@/services/rewards/types';

// ─── SECTORS ────────────────────────────────────────────────────────────────

const SECTORS: { key: string; label: string }[] = [
  { key: 'restaurant', label: 'Restaurant & Hospitality' },
  { key: 'cafe', label: 'Café & Coffee Shop' },
  { key: 'retail', label: 'Retail Business' },
  { key: 'salon', label: 'Salon & Beauty' },
  { key: 'service', label: 'Service Business' },
  { key: 'gym', label: 'Gym & Fitness' },
  { key: 'custom', label: 'Custom' },
];

const REDEMPTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'point', label: 'Points' },
  { value: 'stamp', label: 'Stamps' },
  { value: 'hybrid', label: 'Hybrid' },
];

function sectorLabel(key: string): string {
  return SECTORS.find(s => s.key === key)?.label ?? key;
}

// ─── LOCAL STORAGE ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'mcom-admin-reward-templates';

function loadTemplates(): SectorTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

const BUILT_IN_IDS = [
  'tpl-restaurant', 'tpl-cafe', 'tpl-retail', 'tpl-salon',
  'tpl-service', 'tpl-gym', 'tpl-custom',
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

let _nextId = 1000;
function genId(): string {
  _nextId += 1;
  return `tpl-custom-${_nextId}`;
}

function mapRewardToTemplate(r: RewardResponse): TemplateReward {
  return {
    id: r.id,
    key: r.id,
    name: r.title,
    description: r.description,
    rewardType: r.rewardType || r.type || 'Voucher',
    pointsRequired: r.maxPoints || r.pointRequired || 0,
    stampsRequired: r.max_stamps_required || 0,
    image: r.image || '🎁',
  };
}

function cloneTemplate(t: SectorTemplate): SectorTemplate {
  return {
    ...t,
    id: genId(),
    name: `${t.name} (Copy)`,
    rewards: t.rewards.map(r => ({ ...r, id: genId().replace('tpl', 'rw'), key: genId().replace('tpl', 'rw') })),
    campaigns: t.campaigns ? t.campaigns.map(c => ({ ...c, id: genId().replace('tpl', 'camp'), key: genId().replace('tpl', 'camp') })) : [],
  };
}

// ─── REDEMPTION TYPE DETECTION ──────────────────────────────────────────────

function getRedemptionType(r: RewardResponse): 'point' | 'stamp' | 'hybrid' | 'none' {
  const isPoints = r.is_points_enabled || (r.maxPoints > 0 || r.pointRequired > 0);
  const isStamps = r.is_stamps_enabled || (r.max_stamps_required && r.max_stamps_required > 0) || false;
  if (isPoints && isStamps) return 'hybrid';
  if (isPoints) return 'point';
  if (isStamps) return 'stamp';
  return 'none';
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function AdminRewardTemplatesPage() {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [templates, setTemplates] = useState<SectorTemplate[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  useEffect(() => { setTemplates(loadTemplates()); }, []);

  function save(data: SectorTemplate[]) {
    setTemplates(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  const allTemplates = useMemo(() => [...templates], [templates]);

  const filtered = useMemo(() => {
    return allTemplates.filter(t => {
      const matchSearch = !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchSector = sectorFilter === 'all' || t.sectorKey === sectorFilter;
      return matchSearch && matchSector;
    });
  }, [allTemplates, search, sectorFilter]);

  function handleCreate(t: SectorTemplate) {
    save([...templates, t]);
    toast.success(`Template "${t.name}" created`);
    setShowCreate(false);
  }

  function handleUpdate(idx: number, t: SectorTemplate) {
    const next = [...templates];
    next[idx] = t;
    save(next);
    toast.success(`Template "${t.name}" updated`);
    setEditingIdx(null);
  }

  function handleDelete() {
    if (deleteIdx === null) return;
    const t = templates[deleteIdx];
    if (BUILT_IN_IDS.includes(t.id)) {
      toast.error('Cannot delete built-in templates');
      setDeleteIdx(null);
      return;
    }
    const next = templates.filter((_, i) => i !== deleteIdx);
    save(next);
    toast.success(`Template "${t.name}" deleted`);
    setDeleteIdx(null);
  }

  function handleDuplicate(idx: number) {
    const cloned = cloneTemplate(templates[idx]);
    save([...templates, cloned]);
    toast.success(`Template duplicated as "${cloned.name}"`);
  }

  const currentTemplate = editingIdx !== null ? templates[editingIdx] : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reward Templates</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage reward templates used during business loyalty setup
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create Template
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates by name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {SECTORS.map(s => (
                <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
            {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          </span>
          {sectorFilter !== 'all' && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSectorFilter('all')}>
              {sectorLabel(sectorFilter)} ×
            </Badge>
          )}
        </div>

        {/* Template Grid */}
        {filtered.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FolderOpen className="w-12 h-12 mb-3" />
              <p className="text-lg font-medium">No templates found</p>
              <p className="text-sm">Try adjusting your search or create a new template</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const globalIdx = templates.indexOf(t);
              const isBuiltIn = BUILT_IN_IDS.includes(t.id);
              return (
                <Card key={t.id} className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-blue-100 flex-shrink-0">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">{t.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] mt-0.5 bg-blue-50 text-blue-700 border-blue-200">
                            {sectorLabel(t.sectorKey)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{t.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {t.rewards.length} reward{t.rewards.length !== 1 ? 's' : ''}
                      </Badge>
                      {t.campaigns && t.campaigns.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {t.campaigns.length} campaign{t.campaigns.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {isBuiltIn && <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">Built-in</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {t.rewards.slice(0, 4).map(r => (
                        <span key={r.id} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                          {r.image} {r.name}
                        </span>
                      ))}
                      {t.rewards.length > 4 && (
                        <span className="text-xs text-gray-400">+{t.rewards.length - 4} more</span>
                      )}
                    </div>
                    {t.benefits && t.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {t.benefits.slice(0, 2).map((b, i) => (
                          <span key={i} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200 truncate max-w-[140px]">
                            {b}
                          </span>
                        ))}
                        {t.benefits.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{t.benefits.length - 2} more</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setEditingIdx(globalIdx)}>
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleDuplicate(globalIdx)}>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Duplicate
                      </Button>
                      {!isBuiltIn && (
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-red-500 hover:text-red-600 ml-auto" onClick={() => setDeleteIdx(globalIdx)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editingIdx !== null) && (
        <TemplateFormModal
          template={currentTemplate}
          onSave={(t) => {
            if (editingIdx !== null) handleUpdate(editingIdx, t);
            else handleCreate(t);
          }}
          onClose={() => { setShowCreate(false); setEditingIdx(null); }}
        />
      )}

      {/* Delete Confirm */}
      <AlertDialog open={deleteIdx !== null} onOpenChange={() => setDeleteIdx(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              &ldquo;{deleteIdx !== null ? templates[deleteIdx]?.name : ''}&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── TEMPLATE FORM MODAL ────────────────────────────────────────────────────

function TemplateFormModal({
  template,
  onSave,
  onClose,
}: {
  template: SectorTemplate | null;
  onSave: (t: SectorTemplate) => void;
  onClose: () => void;
}) {
  const isEdit = template !== null;
  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [sectorKey, setSectorKey] = useState(template?.sectorKey ?? 'retail');
  const [rewards, setRewards] = useState<TemplateReward[]>(template?.rewards ?? []);
  const [benefits, setBenefits] = useState<string[]>(template?.benefits ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPicker, setShowPicker] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Template name is required';
    if (!description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      id: template?.id ?? genId(),
      name: name.trim(),
      description: description.trim(),
      sectorKey,
      rewards,
      campaigns: template?.campaigns ?? [],
      benefits: benefits.filter(b => b.trim()),
    });
  }

  function addBenefit() {
    setBenefits(prev => [...prev, '']);
  }

  function updateBenefit(idx: number, value: string) {
    setBenefits(prev => prev.map((b, i) => i === idx ? value : b));
  }

  function removeBenefit(idx: number) {
    setBenefits(prev => prev.filter((_, i) => i !== idx));
  }

  function removeReward(id: string) {
    setRewards(prev => prev.filter(r => r.id !== id));
  }

  function onRewardsSelected(selected: RewardResponse[]) {
    const existingIds = new Set(rewards.map(r => r.id));
    const newRewards = selected
      .filter(r => !existingIds.has(r.id))
      .map(mapRewardToTemplate);
    if (newRewards.length === 0) {
      toast.info('Selected rewards are already in the template');
      return;
    }
    setRewards(prev => [...prev, ...newRewards]);
    setShowPicker(false);
    toast.success(`${newRewards.length} reward${newRewards.length > 1 ? 's' : ''} added`);
  }

  return (
    <>
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <p className="text-xs text-gray-400 mb-2">Give your template a clear, recognisable name that describes its purpose.</p>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Premium Rewards Pack"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-xs text-gray-400 mb-2">Explain what this template includes and which type of business it is best suited for.</p>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what this template offers"
                rows={2}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <p className="text-xs text-gray-400 mb-2">Select the business sector this template is designed for. This determines which businesses see this template during setup.</p>
              <Select value={sectorKey} onValueChange={setSectorKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map(s => (
                    <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Benefits</label>
                <Button variant="outline" size="sm" onClick={addBenefit} className="h-7 text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Benefit
                </Button>
              </div>
              <p className="text-xs text-gray-400 mb-3">List the key benefits a business gets from using this template. These will be highlighted when businesses browse templates during setup.</p>
              {benefits.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-3 text-center border rounded-lg bg-gray-50">
                  No benefits added yet. Click "Add Benefit" to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <Input
                        value={b}
                        onChange={e => updateBenefit(i, e.target.value)}
                        placeholder="e.g. Increase repeat visits by up to 35%"
                        className="text-sm flex-1"
                      />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 flex-shrink-0" onClick={() => removeBenefit(i)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rewards */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Rewards</label>
                <Button variant="outline" size="sm" onClick={() => setShowPicker(true)} className="h-7 text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Rewards
                </Button>
              </div>
              <p className="text-xs text-gray-400 mb-3">Select existing rewards to include in this template. Click "Add Rewards" to browse and pick from rewards you have already created.</p>
              {rewards.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-3 text-center border rounded-lg bg-gray-50">
                  No rewards added yet. Click "Add Rewards" above to get started.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {rewards.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg flex-shrink-0">{r.image}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {r.rewardType}
                            {r.pointsRequired > 0 && ` · ${r.pointsRequired} pts`}
                            {r.stampsRequired > 0 && ` · ${r.stampsRequired} stamps`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 flex-shrink-0" onClick={() => removeReward(r.id)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>
              {isEdit ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reward Picker Modal */}
      {showPicker && (
        <RewardPickerModal
          selectedIds={new Set(rewards.map(r => r.id))}
          onConfirm={onRewardsSelected}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

// ─── REWARD PICKER MODAL ────────────────────────────────────────────────────

// ─── MOCK REWARDS ────────────────────────────────────────────────────────────

const MOCK_REWARDS: RewardResponse[] = [
  { id: 'rw-mock-1', title: 'Free Coffee', description: 'Any size coffee, completely free', rewardType: 'Voucher', type: 'Voucher', status: 'active', image: '☕', pointRequired: 100, maxPoints: 100, max_stamps_required: 0, value: 3.50, quantity: 999, remainingQuantity: 450, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: true, is_stamps_enabled: false, audience: 'all' },
  { id: 'rw-mock-2', title: 'Free Pastry', description: 'Complimentary pastry with any drink purchase', rewardType: 'Voucher', type: 'Voucher', status: 'active', image: '🥐', pointRequired: 75, maxPoints: 75, max_stamps_required: 0, value: 2.50, quantity: 999, remainingQuantity: 320, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: true, is_stamps_enabled: false, audience: 'all' },
  { id: 'rw-mock-3', title: 'Free Dessert', description: 'Free dessert on your next visit', rewardType: 'Voucher', type: 'Voucher', status: 'active', image: '🍰', pointRequired: 200, maxPoints: 200, max_stamps_required: 0, value: 6.00, quantity: 500, remainingQuantity: 210, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: true, is_stamps_enabled: false, audience: 'all' },
  { id: 'rw-mock-4', title: 'Buy 5 Get 1 Free', description: 'Buy 5 coffees and get the 6th free', rewardType: 'Stamp Card', type: 'Stamp Card', status: 'active', image: '🔄', pointRequired: 0, maxPoints: 0, max_stamps_required: 5, value: 3.50, quantity: 999, remainingQuantity: 180, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: false, is_stamps_enabled: true, stamp_emoji: '☕', audience: 'all' },
  { id: 'rw-mock-5', title: '£5 Off Voucher', description: '£5 discount on any purchase over £25', rewardType: 'Voucher', type: 'Voucher', status: 'active', image: '💷', pointRequired: 250, maxPoints: 250, max_stamps_required: 0, value: 5.00, quantity: 1000, remainingQuantity: 620, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: true, is_stamps_enabled: false, audience: 'all' },
  { id: 'rw-mock-6', title: 'Birthday Treat', description: 'Free item of your choice on your birthday', rewardType: 'Voucher', type: 'Voucher', status: 'active', image: '🎂', pointRequired: 0, maxPoints: 0, max_stamps_required: 0, value: 5.00, quantity: 999, remainingQuantity: 890, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: false, is_stamps_enabled: false, audience: 'all' },
  { id: 'rw-mock-7', title: 'Points + Stamp Hybrid', description: 'Earn 50 points AND get a stamp towards your next free item', rewardType: 'Hybrid', type: 'Hybrid', status: 'active', image: '⭐', pointRequired: 50, maxPoints: 50, max_stamps_required: 1, value: 2.00, quantity: 999, remainingQuantity: 340, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: true, is_stamps_enabled: true, stamp_emoji: '⭐', audience: 'all' },
  { id: 'rw-mock-8', title: '10% Off Entire Bill', description: '10% discount on your total bill', rewardType: 'Coupon', type: 'Coupon', status: 'active', image: '🏷️', pointRequired: 300, maxPoints: 300, max_stamps_required: 0, value: 10.00, quantity: 500, remainingQuantity: 150, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: true, is_stamps_enabled: false, audience: 'all' },
  { id: 'rw-mock-9', title: 'Stamp Card - 10 Visits', description: 'Visit 10 times and receive a free month upgrade', rewardType: 'Stamp Card', type: 'Stamp Card', status: 'active', image: '🏅', pointRequired: 0, maxPoints: 0, max_stamps_required: 10, value: 25.00, quantity: 999, remainingQuantity: 75, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: false, is_stamps_enabled: true, stamp_emoji: '✅', audience: 'all' },
  { id: 'rw-mock-10', title: 'Referral Reward', description: 'Refer a friend and both get £5 credit', rewardType: 'Voucher', type: 'Voucher', status: 'active', image: '👥', pointRequired: 0, maxPoints: 0, max_stamps_required: 0, value: 5.00, quantity: 999, remainingQuantity: 410, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: false, is_stamps_enabled: false, audience: 'all' },
  { id: 'rw-mock-11', title: 'Free Smoothie', description: 'Free smoothie with any meal purchase', rewardType: 'Voucher', type: 'Voucher', status: 'active', image: '🥤', pointRequired: 150, maxPoints: 150, max_stamps_required: 0, value: 4.50, quantity: 500, remainingQuantity: 290, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: true, is_stamps_enabled: false, audience: 'all' },
  { id: 'rw-mock-12', title: '20% Off First Visit', description: '20% discount for new customers on their first booking', rewardType: 'Coupon', type: 'Coupon', status: 'active', image: '🎉', pointRequired: 0, maxPoints: 0, max_stamps_required: 0, value: 20.00, quantity: 999, remainingQuantity: 550, disabled: false, expiry: '', createdAt: '', updatedAt: '', badgeLevel: '', is_points_enabled: false, is_stamps_enabled: false, audience: 'new' },
];

// ─── REWARD PICKER MODAL ────────────────────────────────────────────────────

function RewardPickerModal({
  selectedIds,
  onConfirm,
  onClose,
}: {
  selectedIds: Set<string>;
  onConfirm: (rewards: RewardResponse[]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [redemptionFilter, setRedemptionFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allRewards = MOCK_REWARDS;

  const filtered = useMemo(() => {
    return allRewards.filter(r => {
      if (r.status && r.status !== 'active') return false;
      const matchSearch = !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      const type = getRedemptionType(r);
      const matchRedemption = redemptionFilter === 'all' || type === redemptionFilter;
      return matchSearch && matchRedemption;
    });
  }, [allRewards, search, redemptionFilter]);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    const picked = allRewards.filter(r => selected.has(r.id));
    onConfirm(picked);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Rewards</DialogTitle>
        </DialogHeader>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search rewards by name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 text-sm h-9"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 self-start">
            {REDEMPTION_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setRedemptionFilter(t.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  redemptionFilter === t.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[400px] space-y-1.5">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No rewards match your search criteria.</p>
          ) : (
            filtered.map(r => {
              const type = getRedemptionType(r);
              const isChecked = selected.has(r.id) || selectedIds.has(r.id);
              const isDisabled = selectedIds.has(r.id);
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                    isDisabled
                      ? 'bg-gray-50 border-gray-100 opacity-60'
                      : isChecked
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-100 hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={() => !isDisabled && toggle(r.id)}
                >
                  <Checkbox
                    checked={isChecked}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && toggle(r.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                      <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-500 border-gray-200">
                        {r.rewardType || r.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{r.description}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {type === 'point' || type === 'hybrid' ? (
                      <Badge variant="secondary" className="text-[10px] gap-0.5">
                        <Coins className="w-3 h-3" />{r.maxPoints || r.pointRequired}
                      </Badge>
                    ) : null}
                    {type === 'stamp' || type === 'hybrid' ? (
                      <Badge variant="secondary" className="text-[10px] gap-0.5">
                        <Stamp className="w-3 h-3" />{r.max_stamps_required}
                      </Badge>
                    ) : null}
                  </div>
                  {isDisabled && (
                    <span className="text-[10px] text-gray-400 flex-shrink-0">Added</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-3">
          <p className="text-xs text-gray-500">
            {selected.size} reward{selected.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleConfirm} disabled={selected.size === 0}>
              Add Selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
