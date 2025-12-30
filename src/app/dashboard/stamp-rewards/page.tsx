'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Stamp,
    Search,
    Gift,
    Users,
    BarChart3,
    Award,
    Plus,
    RefreshCw,
    Library,
    Zap,
    Star,
    Filter
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import LoadingSpinner from '@/components/ui/Loading';
import StampTemplateCard from '@/components/dashboard/stamp-rewards/StampTemplateCard';
import ActiveStampRewardCard from '@/components/dashboard/stamp-rewards/ActiveStampRewardCard';
import PointRewardCard from '@/components/dashboard/rewards/PointRewardCard';
import ActivateTemplateModal from '@/components/dashboard/stamp-rewards/ActivateTemplateModal';
import AwardStampModal from '@/components/dashboard/stamp-rewards/AwardStampModal';
import ViewCustomersModal from '@/components/dashboard/stamp-rewards/ViewCustomersModal';
import ClaimRewardModal from '@/components/dashboard/rewards/ClaimRewardModal';
import RewardTypeSelectionDialog from '@/components/dashboard/rewards/RewardTypeSelectionDialog';
import CreateRewardWizardModal from '@/components/dashboard/rewards/CreateRewardWizardModal';
import CreateStampRewardWizardModal from '@/components/admin/rewards/CreateStampRewardWizardModal';
import UpgradePlanModal from '@/components/dashboard/rewards/UpgradePlanModal';
import TierLimitModal from '@/components/dashboard/campaigns/TierLimitModal';
import {
    useGetAvailableTemplates,
    useGetBusinessStampRewards,
    useGetStampRewardStats,
    usePauseStampReward,
    useResumeStampReward,
    useDeactivateStampReward,
} from '@/services/business-stamp-rewards/hook';
import {
    useCreateBusinessReward,
    useGetBusinessRewards,
    useUpdateBusinessReward,
    useRemoveBusinessReward
} from '@/services/business-reward/hooks';
import { useGetBusinessTierUsage } from '@/services/business/hook';
import { StampRewardResponse } from '@/services/stamp-rewards/types';
import { BusinessStampReward } from '@/services/business-stamp-rewards/types';
import { Reward, BusinessReward, CreateBusinessRewardDto, RewardStatus } from '@/services/business-reward/types';
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
import { toast } from 'sonner';
import { AxiosError } from 'axios';

const currentUser = {
    plan: 'white-label', // 'starter', 'co-branded', 'white-label'
};

type ActiveRewardFilter = 'all' | 'stamps' | 'points';

export default function BusinessStampRewardsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('active');
    const [activeRewardFilter, setActiveRewardFilter] = useState<ActiveRewardFilter>('all');
    const [selectedTemplate, setSelectedTemplate] = useState<StampRewardResponse | null>(null);
    const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
    const [rewardToDeactivate, setRewardToDeactivate] = useState<string | null>(null);

    // New modal states for stamp rewards
    const [selectedReward, setSelectedReward] = useState<BusinessStampReward | null>(null);
    const [isAwardStampModalOpen, setIsAwardStampModalOpen] = useState(false);
    const [isViewCustomersModalOpen, setIsViewCustomersModalOpen] = useState(false);

    // New modal states for merged rewards functionality
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isRewardTypeSelectionOpen, setIsRewardTypeSelectionOpen] = useState(false);
    const [isCreatePointRewardModalOpen, setIsCreatePointRewardModalOpen] = useState(false);
    const [isCreateStampRewardModalOpen, setIsCreateStampRewardModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isTierLimitModalOpen, setIsTierLimitModalOpen] = useState(false);
    const [tierLimitMessage, setTierLimitMessage] = useState('');
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [editingBusinessRewardId, setEditingBusinessRewardId] = useState<string | null>(null);

    // Delete confirmation for point rewards
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pointRewardToDelete, setPointRewardToDelete] = useState<BusinessReward | null>(null);

    // API hooks
    const { data: availableTemplates = [], isLoading: isLoadingTemplates, refetch: refetchTemplates } = useGetAvailableTemplates();
    const { data: businessRewardsData, isLoading: isLoadingRewards, refetch: refetchRewards } = useGetBusinessStampRewards(1, 20);
    const { data: stats, isLoading: isLoadingStats } = useGetStampRewardStats();
    const { mutate: pauseReward, isPending: isPausing } = usePauseStampReward();
    const { mutate: resumeReward, isPending: isResuming } = useResumeStampReward();
    const { mutate: deactivateReward, isPending: isDeactivating } = useDeactivateStampReward();

    // Point rewards hooks
    const { data: pointRewardsData, isLoading: isLoadingPointRewards, refetch: refetchPointRewards } = useGetBusinessRewards(1, 50);
    const { mutateAsync: createBusinessReward } = useCreateBusinessReward();
    const { mutate: updateBusinessReward } = useUpdateBusinessReward();
    const { mutate: removeBusinessReward, isPending: isDeletingReward } = useRemoveBusinessReward();
    const { data: tierUsageData } = useGetBusinessTierUsage();

    const businessRewards = businessRewardsData?.data || [];
    const pointRewards = pointRewardsData?.data || [];

    // Combine counts for stats
    const totalActiveRewards = businessRewards.length + pointRewards.filter(r => !r.disabled).length;

    // Filter templates
    const filteredTemplates = useMemo(() => {
        if (!searchTerm) return availableTemplates;
        return availableTemplates.filter(t =>
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableTemplates, searchTerm]);

    // Filter active stamp rewards
    const filteredStampRewards = useMemo(() => {
        if (!searchTerm) return businessRewards;
        return businessRewards.filter(r =>
            r.template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.template.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [businessRewards, searchTerm]);

    // Filter point rewards
    const filteredPointRewards = useMemo(() => {
        if (!searchTerm) return pointRewards;
        return pointRewards.filter(r =>
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pointRewards, searchTerm]);

    // Handlers for stamp rewards
    const handlePreviewTemplate = (template: StampRewardResponse) => {
        setSelectedTemplate(template);
        setIsActivateModalOpen(true);
    };

    const handleActivateTemplate = (template: StampRewardResponse) => {
        setSelectedTemplate(template);
        setIsActivateModalOpen(true);
    };

    const handleActivateFromModal = (template: StampRewardResponse) => {
        setSelectedTemplate(template);
        setIsActivateModalOpen(true);
    };

    const handleViewReward = (reward: BusinessStampReward) => {
        setSelectedReward(reward);
        setIsViewCustomersModalOpen(true);
    };

    const handleAwardStamp = (reward: BusinessStampReward) => {
        setSelectedReward(reward);
        setIsAwardStampModalOpen(true);
    };

    const handlePause = (id: string) => {
        pauseReward(id);
    };

    const handleResume = (id: string) => {
        resumeReward(id);
    };

    const handleDeactivate = (id: string) => {
        setRewardToDeactivate(id);
    };

    const confirmDeactivate = () => {
        if (rewardToDeactivate) {
            deactivateReward(rewardToDeactivate, {
                onSuccess: () => {
                    setRewardToDeactivate(null);
                },
            });
        }
    };

    const handleActivationSuccess = () => {
        refetchTemplates();
        refetchRewards();
    };

    // Handlers for point rewards
    const handleEditPointReward = useCallback((businessReward: BusinessReward) => {
        setEditingBusinessRewardId(businessReward.id);
        const mergedReward: Reward = {
            ...businessReward.reward,
            title: businessReward.title,
            description: businessReward.description,
            image: businessReward.image,
            gallery: businessReward.gallery,
            value: businessReward.value,
            disabled: businessReward.disabled,
            pointsRequired: businessReward.pointRequired,
            quantity: businessReward.quantity || 0,
        };
        setEditingReward(mergedReward);
        setIsCreatePointRewardModalOpen(true);
    }, []);

    const handleDeletePointReward = useCallback((businessReward: BusinessReward) => {
        setPointRewardToDelete(businessReward);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDeletePointReward = useCallback(() => {
        if (!pointRewardToDelete) return;

        removeBusinessReward(pointRewardToDelete.id, {
            onSuccess: () => {
                toast.success('Reward deleted successfully');
                setDeleteDialogOpen(false);
                setPointRewardToDelete(null);
            },
            onError: (error: Error) => {
                const axiosError = error as AxiosError<{ message: string }>;
                const errorMessage = axiosError?.response?.data?.message || 'Failed to delete reward';
                toast.error(errorMessage);
            },
        });
    }, [pointRewardToDelete, removeBusinessReward]);

    // Handlers for merged rewards functionality
    const handleOpenClaimModal = useCallback(() => {
        setIsClaimModalOpen(true);
    }, []);

    const handleCreateFromScratch = useCallback(() => {
        setIsClaimModalOpen(false);
        if (currentUser.plan === 'white-label') {
            setIsRewardTypeSelectionOpen(true);
        } else {
            setIsUpgradeModalOpen(true);
        }
    }, []);

    const handleSelectPointReward = useCallback(() => {
        setIsRewardTypeSelectionOpen(false);
        setEditingReward(null);
        setEditingBusinessRewardId(null);
        setIsCreatePointRewardModalOpen(true);
    }, []);

    const handleSelectStampReward = useCallback(() => {
        setIsRewardTypeSelectionOpen(false);
        setIsCreateStampRewardModalOpen(true);
    }, []);

    const handleSelectTemplate = useCallback((reward: Reward) => {
        setIsClaimModalOpen(false);
        setEditingReward(reward);
        setEditingBusinessRewardId(null); // Not editing an existing one, but creating from template
        setIsCreatePointRewardModalOpen(true);
    }, []);

    const handleSavePointReward = useCallback(async (rewardData: Reward): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (editingBusinessRewardId) {
                // Update existing reward
                updateBusinessReward({
                    rewardId: editingBusinessRewardId,
                    payload: {
                        title: rewardData.title,
                        description: rewardData.description,
                        points_required: rewardData.pointsRequired,
                        image: rewardData.image,
                        gallery: rewardData.gallery,
                        quantity: rewardData.quantity,
                        disabled: rewardData.disabled,
                    },
                }, {
                    onSuccess: () => {
                        toast.success('Reward updated successfully');
                        setIsCreatePointRewardModalOpen(false);
                        setEditingBusinessRewardId(null);
                        setEditingReward(null);
                        refetchPointRewards();
                        resolve();
                    },
                    onError: (error: Error) => {
                        const axiosError = error as AxiosError<{ message: string }>;
                        const errorMessage = axiosError?.response?.data?.message || 'Failed to update reward';

                        if (errorMessage.includes("Points required cannot exceed the maximum points set by admin")) {
                            setTierLimitMessage(errorMessage);
                            setIsTierLimitModalOpen(true);
                        } else {
                            toast.error(errorMessage);
                        }
                        reject(error);
                    }
                });
            } else {
                // Create new reward
                const payload: CreateBusinessRewardDto = {
                    title: rewardData.title,
                    description: rewardData.description,
                    points_required: rewardData.pointsRequired,
                    image: rewardData.image,
                    gallery: rewardData.gallery,
                    quantity: rewardData.quantity,
                    disabled: rewardData.disabled,
                    reward_type: 'Voucher',
                    status: RewardStatus.ACTIVE,
                };

                createBusinessReward(payload).then(() => {
                    toast.success('Reward created successfully');
                    setIsCreatePointRewardModalOpen(false);
                    refetchPointRewards();
                    resolve();
                }).catch((error) => {
                    console.error("Error creating reward:", error);
                    const axiosError = error as AxiosError<{ message: string }>;
                    const errorMessage = axiosError?.response?.data?.message || 'Failed to create reward';

                    if (errorMessage.includes("Points required cannot exceed the maximum points set by admin")) {
                        setTierLimitMessage(errorMessage);
                        setIsTierLimitModalOpen(true);
                    } else {
                        toast.error(errorMessage);
                    }
                    reject(error);
                });
            }
        });
    }, [editingBusinessRewardId, updateBusinessReward, createBusinessReward, refetchPointRewards]);

    const handleStampRewardSuccess = useCallback(() => {
        refetchTemplates();
        refetchRewards();
    }, [refetchTemplates, refetchRewards]);

    const isLoading = isLoadingTemplates || isLoadingRewards || isLoadingStats || isLoadingPointRewards;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Determine what to show based on filter
    const showStampRewards = activeRewardFilter === 'all' || activeRewardFilter === 'stamps';
    const showPointRewards = activeRewardFilter === 'all' || activeRewardFilter === 'points';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 dark:from-gray-900 dark:to-gray-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25">
                                    <Award className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                                        All Rewards
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                        Manage your stamp cards and point rewards for customers
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleOpenClaimModal}
                                className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                            >
                                <Plus className="h-4 w-4" />
                                Add Reward
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                                    <Award className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalActiveRewards}</p>
                                    <p className="text-xs text-gray-500">Total Active</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCustomersEnrolled || 0}</p>
                                    <p className="text-xs text-gray-500">Enrolled</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                                    <BarChart3 className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalStampsAwarded || 0}</p>
                                    <p className="text-xs text-gray-500">Stamps</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                                    <Stamp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCompletions || 0}</p>
                                    <p className="text-xs text-gray-500">Completed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-100 dark:bg-green-900/50 rounded-xl">
                                    <Gift className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalRedemptions || 0}</p>
                                    <p className="text-xs text-gray-500">Redeemed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-lg">
                            <TabsTrigger value="active" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                <Zap className="h-4 w-4" />
                                Active Rewards
                                {totalActiveRewards > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                                        {totalActiveRewards}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="library" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                <Library className="h-4 w-4" />
                                Template Library
                                {availableTemplates.length > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                                        {availableTemplates.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Search */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-white dark:bg-gray-800 shadow-md border-0"
                            />
                        </div>
                    </div>

                    {/* Active Rewards Tab */}
                    <TabsContent value="active" className="mt-6 space-y-6">
                        {/* Sub-filter for reward types */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                                <Button
                                    variant={activeRewardFilter === 'all' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveRewardFilter('all')}
                                    className={`gap-1.5 text-sm ${activeRewardFilter === 'all' ? 'bg-gray-900 text-white' : ''}`}
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    All
                                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                        {filteredStampRewards.length + filteredPointRewards.length}
                                    </Badge>
                                </Button>
                                <Button
                                    variant={activeRewardFilter === 'stamps' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveRewardFilter('stamps')}
                                    className={`gap-1.5 text-sm ${activeRewardFilter === 'stamps' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
                                >
                                    <Stamp className="h-3.5 w-3.5" />
                                    Stamp Cards
                                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                        {filteredStampRewards.length}
                                    </Badge>
                                </Button>
                                <Button
                                    variant={activeRewardFilter === 'points' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveRewardFilter('points')}
                                    className={`gap-1.5 text-sm ${activeRewardFilter === 'points' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                                >
                                    <Gift className="h-3.5 w-3.5" />
                                    Point Rewards
                                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                        {filteredPointRewards.length}
                                    </Badge>
                                </Button>
                            </div>
                        </div>

                        {/* Empty state when no rewards at all */}
                        {filteredStampRewards.length === 0 && filteredPointRewards.length === 0 && (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="py-16 text-center">
                                    <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Award className="h-8 w-8 text-orange-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        No active rewards yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Start by adding a reward from the library or creating your own.
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <Button
                                            onClick={() => setActiveTab('library')}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Library className="h-4 w-4" />
                                            Browse Templates
                                        </Button>
                                        <Button
                                            onClick={handleOpenClaimModal}
                                            className="gap-2 bg-orange-600 hover:bg-orange-700"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Reward
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Stamp Rewards Section */}
                        {showStampRewards && filteredStampRewards.length > 0 && (
                            <div className="space-y-4">
                                {activeRewardFilter === 'all' && (
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                                            <Stamp className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Stamp Cards</h3>
                                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                                            {filteredStampRewards.length}
                                        </Badge>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredStampRewards.map((reward) => (
                                        <ActiveStampRewardCard
                                            key={reward.id}
                                            reward={reward}
                                            onView={handleViewReward}
                                            onPause={handlePause}
                                            onResume={handleResume}
                                            onDeactivate={handleDeactivate}
                                            onAwardStamp={handleAwardStamp}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Point Rewards Section */}
                        {showPointRewards && filteredPointRewards.length > 0 && (
                            <div className="space-y-4">
                                {activeRewardFilter === 'all' && (
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                            <Gift className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Point Rewards</h3>
                                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                                            {filteredPointRewards.length}
                                        </Badge>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPointRewards.map((reward) => (
                                        <PointRewardCard
                                            key={reward.id}
                                            reward={reward}
                                            onEdit={handleEditPointReward}
                                            onDelete={handleDeletePointReward}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show empty states for individual filters */}
                        {activeRewardFilter === 'stamps' && filteredStampRewards.length === 0 && (
                            <Card className="border-0 shadow-lg border-orange-100">
                                <CardContent className="py-12 text-center">
                                    <Stamp className="h-10 w-10 text-orange-300 mx-auto mb-3" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No stamp cards</h3>
                                    <p className="text-sm text-gray-500">Browse the template library to activate stamp rewards.</p>
                                </CardContent>
                            </Card>
                        )}

                        {activeRewardFilter === 'points' && filteredPointRewards.length === 0 && (
                            <Card className="border-0 shadow-lg border-blue-100">
                                <CardContent className="py-12 text-center">
                                    <Gift className="h-10 w-10 text-blue-300 mx-auto mb-3" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No point rewards</h3>
                                    <p className="text-sm text-gray-500">Add point rewards for customers to redeem.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Template Library Tab */}
                    <TabsContent value="library" className="mt-6">
                        {filteredTemplates.length === 0 ? (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="py-16 text-center">
                                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Library className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {searchTerm ? 'No templates found' : 'No templates available'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {searchTerm
                                            ? 'Try adjusting your search term.'
                                            : 'Check back later for new stamp reward templates.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTemplates.map((template) => (
                                    <StampTemplateCard
                                        key={template.id}
                                        template={template}
                                        onPreview={handlePreviewTemplate}
                                        onActivate={handleActivateTemplate}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Activate Template Modal */}
            <ActivateTemplateModal
                isOpen={isActivateModalOpen}
                onClose={() => {
                    setIsActivateModalOpen(false);
                    setSelectedTemplate(null);
                }}
                template={selectedTemplate}
                onSuccess={handleActivationSuccess}
            />

            {/* Deactivate Stamp Confirmation Dialog */}
            <AlertDialog open={!!rewardToDeactivate} onOpenChange={() => setRewardToDeactivate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Stamp className="h-5 w-5 text-red-500" />
                            Deactivate Stamp Reward?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the stamp reward from your business. Customers who have started
                            collecting stamps will no longer be able to earn new stamps or redeem rewards.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeactivate}
                            disabled={isDeactivating}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeactivating ? 'Deactivating...' : 'Deactivate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Point Reward Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-red-500" />
                            Delete Reward?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{pointRewardToDelete?.title}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingReward}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeletePointReward}
                            disabled={isDeletingReward}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeletingReward ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Award Stamp Modal */}
            <AwardStampModal
                isOpen={isAwardStampModalOpen}
                onClose={() => {
                    setIsAwardStampModalOpen(false);
                    setSelectedReward(null);
                }}
                reward={selectedReward}
            />

            {/* View Customers Modal */}
            <ViewCustomersModal
                isOpen={isViewCustomersModalOpen}
                onClose={() => {
                    setIsViewCustomersModalOpen(false);
                    setSelectedReward(null);
                }}
                reward={selectedReward}
                onAwardStamp={() => {
                    setIsViewCustomersModalOpen(false);
                    setIsAwardStampModalOpen(true);
                }}
            />

            {/* Claim Reward Modal (Enhanced with filter tabs) */}
            <ClaimRewardModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                onCreateFromScratch={handleCreateFromScratch}
                onActivateStampReward={handleActivateFromModal}
                onSelectTemplate={handleSelectTemplate}
            />

            {/* Reward Type Selection Dialog */}
            <RewardTypeSelectionDialog
                isOpen={isRewardTypeSelectionOpen}
                onClose={() => setIsRewardTypeSelectionOpen(false)}
                onSelectPointReward={handleSelectPointReward}
                onSelectStampReward={handleSelectStampReward}
            />

            {/* Create Point Reward Modal */}
            <CreateRewardWizardModal
                isOpen={isCreatePointRewardModalOpen}
                onClose={() => {
                    setIsCreatePointRewardModalOpen(false);
                    setEditingReward(null);
                    setEditingBusinessRewardId(null);
                }}
                reward={editingReward}
                onSave={handleSavePointReward}
            />

            {/* Create Stamp Reward Modal */}
            <CreateStampRewardWizardModal
                isOpen={isCreateStampRewardModalOpen}
                onClose={() => setIsCreateStampRewardModalOpen(false)}
                mode="create"
                onSuccess={handleStampRewardSuccess}
            />

            {/* Upgrade Plan Modal */}
            <UpgradePlanModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
            />

            {/* Tier Limit Modal */}
            <TierLimitModal
                isOpen={isTierLimitModalOpen}
                onClose={() => setIsTierLimitModalOpen(false)}
                message={tierLimitMessage}
            />
        </div>
    );
}
