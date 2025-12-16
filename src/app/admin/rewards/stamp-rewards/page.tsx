'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Stamp,
    Plus,
    Search,
    Filter,
    LayoutGrid,
    List,
    Sparkles,
    Gift,
    Users,
    RefreshCw
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
import StampRewardCard from '@/components/admin/rewards/StampRewardCard';
import CreateStampRewardWizardModal from '@/components/admin/rewards/CreateStampRewardWizardModal';
import StampRewardPreviewModal from '@/components/admin/rewards/StampRewardPreviewModal';
import {
    useGetStampRewards,
    useDeleteStampReward,
    usePublishStampReward,
    useArchiveStampReward,
} from '@/services/stamp-rewards/hook';
import {
    StampRewardResponse,
    StampRewardStatus,
} from '@/services/stamp-rewards/types';

type ViewMode = 'grid' | 'list';

export default function AdminStampRewardsPage() {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<StampRewardStatus | 'all'>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
    const [selectedStampReward, setSelectedStampReward] = useState<StampRewardResponse | null>(null);
    const [previewStampReward, setPreviewStampReward] = useState<StampRewardResponse | null>(null);
    const [stampRewardToDelete, setStampRewardToDelete] = useState<string | null>(null);
    const [page] = useState(1);
    const limit = 20;

    // API hooks - now using mock service
    const { data, isLoading, isError, refetch } = useGetStampRewards(page, limit);
    const { mutate: deleteStampReward, isPending: isDeleting } = useDeleteStampReward();
    const { mutate: publishStampReward } = usePublishStampReward();
    const { mutate: archiveStampReward } = useArchiveStampReward();

    // Get stamp rewards from API response
    const stampRewards = data?.data || [];

    // Filter and search
    const filteredStampRewards = useMemo(() => {
        return stampRewards.filter((reward) => {
            const matchesSearch =
                reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reward.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || reward.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [stampRewards, searchTerm, filterStatus]);

    // Statistics
    const stats = useMemo(() => {
        const active = stampRewards.filter(r => r.status === 'active').length;
        const draft = stampRewards.filter(r => r.status === 'draft').length;
        const totalBusinesses = stampRewards.reduce((sum, r) => sum + r.businessesActivated, 0);
        const totalCompletions = stampRewards.reduce((sum, r) => sum + r.totalCompletions, 0);
        return { active, draft, totalBusinesses, totalCompletions };
    }, [stampRewards]);

    // Handlers
    const handleCreate = () => {
        setModalMode('create');
        setSelectedStampReward(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (id: string) => {
        const reward = stampRewards.find(r => r.id === id);
        if (reward) {
            setModalMode('edit');
            setSelectedStampReward(reward);
            setIsCreateModalOpen(true);
        }
    };

    const handleDuplicate = (id: string) => {
        const reward = stampRewards.find(r => r.id === id);
        if (reward) {
            setModalMode('duplicate');
            setSelectedStampReward(reward);
            setIsCreateModalOpen(true);
        }
    };

    const handlePreview = (id: string) => {
        const reward = stampRewards.find(r => r.id === id);
        if (reward) {
            setPreviewStampReward(reward);
        }
    };

    const handleDelete = (id: string) => {
        setStampRewardToDelete(id);
    };

    const confirmDelete = () => {
        if (stampRewardToDelete) {
            deleteStampReward(stampRewardToDelete, {
                onSuccess: () => {
                    setStampRewardToDelete(null);
                },
            });
        }
    };

    const handlePublish = (id: string) => {
        publishStampReward(id);
    };

    const handleArchive = (id: string) => {
        archiveStampReward(id);
    };

    const handleModalClose = () => {
        setIsCreateModalOpen(false);
        setSelectedStampReward(null);
    };

    const handleModalSuccess = () => {
        refetch();
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
                    <p className="text-red-500 mb-4">Error loading stamp rewards.</p>
                    <Button onClick={() => refetch()} className="bg-orange-600 hover:bg-orange-700">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 dark:from-gray-900 dark:to-gray-950">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25">
                                    <Stamp className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                                        Stamp Reward Templates
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                        Create and manage loyalty stamp cards for businesses
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={handleCreate}
                            className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Create Stamp Reward
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                                    <Stamp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                                    <p className="text-xs text-gray-500">Active Templates</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                                    <Sparkles className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
                                    <p className="text-xs text-gray-500">Draft Templates</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBusinesses}</p>
                                    <p className="text-xs text-gray-500">Businesses Using</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-100 dark:bg-green-900/50 rounded-xl">
                                    <Gift className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCompletions}</p>
                                    <p className="text-xs text-gray-500">Total Completions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Search */}
                <Card className="mb-6 border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search stamp rewards..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as StampRewardStatus | 'all')}>
                                    <SelectTrigger className="w-40 h-11 bg-gray-50 dark:bg-gray-800">
                                        <Filter className="h-4 w-4 mr-2 text-gray-400" />
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999]">
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
                                                    className={`rounded-none h-11 w-11 ${viewMode === 'grid' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                                                    onClick={() => setViewMode('grid')}
                                                >
                                                    <LayoutGrid className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="z-[9999]">Grid view</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                                    size="icon"
                                                    className={`rounded-none h-11 w-11 ${viewMode === 'list' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                                                    onClick={() => setViewMode('list')}
                                                >
                                                    <List className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="z-[9999]">List view</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content */}
                {filteredStampRewards.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-16 text-center">
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Stamp className="h-8 w-8 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No stamp rewards found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Try adjusting your search or filters.'
                                    : 'Create your first stamp reward template to get started.'}
                            </p>
                            {!searchTerm && filterStatus === 'all' && (
                                <Button onClick={handleCreate} className="gap-2 bg-orange-600 hover:bg-orange-700">
                                    <Plus className="h-4 w-4" />
                                    Create Your First Template
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1'
                        }`}>
                        {filteredStampRewards.map((reward) => (
                            <StampRewardCard
                                key={reward.id}
                                stampReward={reward}
                                onEdit={handleEdit}
                                onDuplicate={handleDuplicate}
                                onDelete={handleDelete}
                                onPreview={handlePreview}
                                onPublish={reward.status === 'draft' ? handlePublish : undefined}
                                onArchive={reward.status === 'active' ? handleArchive : undefined}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination info */}
                {filteredStampRewards.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <p className="text-sm text-gray-500">
                            Showing {filteredStampRewards.length} of {stampRewards.length} templates
                        </p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <CreateStampRewardWizardModal
                isOpen={isCreateModalOpen}
                onClose={handleModalClose}
                mode={modalMode}
                stampReward={selectedStampReward}
                onSuccess={handleModalSuccess}
            />

            {/* Preview Modal */}
            <StampRewardPreviewModal
                isOpen={!!previewStampReward}
                onClose={() => setPreviewStampReward(null)}
                stampReward={previewStampReward}
                onEdit={(id) => {
                    setPreviewStampReward(null);
                    handleEdit(id);
                }}
                onDuplicate={(id) => {
                    setPreviewStampReward(null);
                    handleDuplicate(id);
                }}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!stampRewardToDelete} onOpenChange={() => setStampRewardToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Stamp className="h-5 w-5 text-red-500" />
                            Delete Stamp Reward Template?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the stamp reward
                            template and all associated data. Businesses that have activated this template
                            will no longer be able to use it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Template'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
