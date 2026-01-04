'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Gift,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  Stamp,
  Coins,
  RefreshCw,
  Users,
  BarChart3
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/ui/Loading';
import AdminUnifiedRewardCard from '@/components/admin/rewards/AdminUnifiedRewardCard';
import AdminRewardTypeSelectionDialog from '@/components/admin/rewards/AdminRewardTypeSelectionDialog';
import UnifiedRewardWizardModal, { RewardType } from '@/components/admin/rewards/UnifiedRewardWizardModal';
import { useGetRewards, useDeleteReward } from '@/services/rewards/hook';
import { RewardResponse } from '@/services/rewards/types';

type ViewMode = 'grid' | 'list';

export default function AdminRewardsPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRewardType, setFilterRewardType] = useState<string>('all'); // 'Voucher', 'Gift Card', etc.
  const [filterRedemption, setFilterRedemption] = useState<string>('all'); // 'point', 'stamp', 'hybrid', 'all'
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modal State
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [selectedReward, setSelectedReward] = useState<RewardResponse | null>(null);
  const [initialRewardTypes, setInitialRewardTypes] = useState<RewardType[]>([]);

  // Deletion State
  const [rewardToDelete, setRewardToDelete] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Query Params Construction
  const queryOptions = useMemo(() => {
    const options: any = {};
    if (filterStatus !== 'all') options.status = filterStatus;

    // Reward Category Filter (Voucher, etc)
    if (filterRewardType !== 'all') options.reward_type = filterRewardType;

    // Redemption Type Filter (Point vs Stamp)
    // NOTE: Backend filtering proved unreliable/inconsistent for complex stamp/point/hybrid logic.
    // We will intentionally NOT filter by redemption type at the API level to ensure we receive ALL relevant items,
    // then apply the robust visualization logic client-side to filter them accurately.
    // This tradeoff means we filter only the fetched page, but guarantees accuracy for what is shown.

    /* 
    if (filterRedemption === 'point') {
      options.min_points = 1;
      options.max_stamps = 0;
    } else if (filterRedemption === 'stamp') {
      options.min_stamps = 1;
      options.max_points = 0;
    } else if (filterRedemption === 'hybrid') {
      options.min_points = 1;
      options.min_stamps = 1;
    }
    */

    if (searchTerm) options.search = searchTerm;
    return options;
  }, [filterStatus, filterRewardType, /* filterRedemption intentinally omitted from deps to avoid refetch if only filtering client side */ searchTerm]);

  // API Hooks
  const { data, isLoading, isError, refetch } = useGetRewards(page, limit, queryOptions);
  const { mutate: deleteReward, isPending: isDeleting } = useDeleteReward();

  const rewards = data?.data || [];
  const totalRewards = data?.count || 0;

  // Client-side filtering as fallback or refinement
  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      const matchesSearch =
        reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter (logic duplicated client-side for immediate feedback if API doesn't handle)
      const matchesStatus = filterStatus === 'all' || reward.status === filterStatus;

      // Reward Type filter (Voucher etc)
      let matchesRewardType = filterRewardType === 'all' || reward.rewardType === filterRewardType || reward.type === filterRewardType || (reward as any).reward_type === filterRewardType;

      // Redemption filter
      let matchesRedemption = true;

      // Use the EXACT same robust logic as AdminUnifiedRewardCard to ensure filter matches visual reality
      const getMaxStamps = () => {
        return reward.max_stamps_required ||
          (reward as any).maxStampsRequired ||
          (reward as any).maxStamps ||
          0;
      };
      const maxStamps = getMaxStamps();

      // Defensive check: explicitly check for true, or if max_stamps > 0 assume enabled as fallback
      // We strictly check logic: if maxStamps > 0, it MUST be a stamp reward or hybrid, regardless of the flag
      const isPoints = reward.is_points_enabled === true || (reward.is_points_enabled !== false && (!!reward.pointRequired || !!reward.maxPoints));
      const isStamps = reward.is_stamps_enabled === true || (reward.is_stamps_enabled !== false && maxStamps > 0) || maxStamps > 0;
      const isHybrid = isPoints && isStamps;

      if (filterRedemption === 'point') {
        matchesRedemption = isPoints && !isStamps;
      } else if (filterRedemption === 'stamp') {
        matchesRedemption = isStamps && !isPoints;
      } else if (filterRedemption === 'hybrid') {
        matchesRedemption = isHybrid; // Hybrid implies both are true
      }

      return matchesSearch && matchesStatus && matchesRewardType && matchesRedemption;
    });
  }, [rewards, searchTerm, filterStatus, filterRewardType, filterRedemption]);

  // Statistics (Computed from current page or all if possible - simplified for now)
  const stats = useMemo(() => {
    const active = rewards.filter(r => r.status === 'active').length;
    const draft = rewards.filter(r => r.status === 'draft').length;
    // Mock data for aggregation for now as API doesn't return agg stats object, but we can simulate based on loaded
    const totalRedemptions = rewards.reduce((sum, r) => sum + (r.quantity - r.remainingQuantity), 0);
    return { active, draft, totalRedemptions };
  }, [rewards]);

  // Handlers
  const handleCreateClick = () => {
    setWizardMode('create');
    setSelectedReward(null);
    setIsSelectionModalOpen(true);
  };

  const handleTypeSelection = (types: RewardType[]) => {
    setInitialRewardTypes(types);
    setIsSelectionModalOpen(false);
    setIsWizardOpen(true);
  };

  const handleEdit = (id: string) => {
    const reward = rewards.find(r => r.id === id);
    if (reward) {
      setWizardMode('edit');
      setSelectedReward(reward);
      setInitialRewardTypes([]);
      setIsWizardOpen(true);
    }
  };

  const handleDuplicate = (id: string) => {
    const reward = rewards.find(r => r.id === id);
    if (reward) {
      setWizardMode('duplicate');
      setSelectedReward(reward);
      setInitialRewardTypes([]);
      setIsWizardOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setRewardToDelete(id);
  };

  const confirmDelete = () => {
    if (rewardToDelete) {
      deleteReward(rewardToDelete, {
        onSuccess: () => {
          setRewardToDelete(null);
          refetch();
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading rewards.</p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 rounded-2xl shadow-lg shadow-purple-500/25">
                  <Gift className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                    Rewards Management
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Create and manage point, stamp, and hybrid rewards
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleCreateClick}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Plus className="h-5 w-5" />
              Create New Reward
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                  <Gift className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                  <p className="text-xs text-gray-500">Active Rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
                  <p className="text-xs text-gray-500">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRedemptions}</p>
                  <p className="text-xs text-gray-500">Redemptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRewards}</p>
                  <p className="text-xs text-gray-500">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search rewards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={filterRewardType} onValueChange={setFilterRewardType}>
                  <SelectTrigger className="w-36 h-11 bg-gray-50 dark:bg-gray-800">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Voucher">Voucher</SelectItem>
                    <SelectItem value="Brand Gift Card">Gift Card</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Coupon">Coupon</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRedemption} onValueChange={setFilterRedemption}>
                  <SelectTrigger className="w-36 h-11 bg-gray-50 dark:bg-gray-800">
                    <Sparkles className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Redemption" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="point">Points Only</SelectItem>
                    <SelectItem value="stamp">Stamps Only</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 h-11 bg-gray-50 dark:bg-gray-800">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="icon"
                          className={`rounded-none h-11 w-11 ${viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          onClick={() => setViewMode('grid')}
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Grid view</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="icon"
                          className={`rounded-none h-11 w-11 ${viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          onClick={() => setViewMode('list')}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">List view</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {filteredRewards.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Gift className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No rewards found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || filterStatus !== 'all' || filterRewardType !== 'all' || filterRedemption !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first reward to get started.'}
              </p>
              {!searchTerm && filterStatus === 'all' && filterRewardType === 'all' && filterRedemption === 'all' && (
                <Button onClick={handleCreateClick} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Create Your First Reward
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
            }`}>
            {filteredRewards.map((reward) => (
              <AdminUnifiedRewardCard
                key={reward.id}
                reward={reward}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination info */}
        {filteredRewards.length > 0 && (
          <div className="mt-8 flex justify-center">
            <p className="text-sm text-gray-500">
              Showing {filteredRewards.length} of {totalRewards} rewards
            </p>
          </div>
        )}
      </div>

      {/* Selection Dialog */}
      <AdminRewardTypeSelectionDialog
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onContinue={handleTypeSelection}
      />

      {/* Creation Wizard */}
      <UnifiedRewardWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        mode={wizardMode}
        reward={selectedReward}
        initialRewardTypes={initialRewardTypes}
        onSuccess={() => refetch()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!rewardToDelete} onOpenChange={() => setRewardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-red-500" />
              Delete Reward?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the reward
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
