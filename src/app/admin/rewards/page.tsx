'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import CreateRewardWizardModal from '@/components/admin/rewards/CreateRewardWizardModal';
import { MoreVertical, Edit, Copy, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetRewards, useDeleteReward } from '@/services/rewards/hook';
import { RewardResponse } from '@/services/rewards/types';
import LoadingSpinner from '@/components/ui/Loading';
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


const typeLabels: { [key: string]: string } = {
  'Voucher': 'Voucher',
  'gift card': 'Gift Card',
  'coupon': 'Coupon',
  'point offer': 'Point Offer',
  'physical product': 'Physical Product',
};

const audienceLabels: { [key: string]: string } = {
  'all business': 'All Businesses',
  'specific sectors': 'Specific Sectors',
  'specific tiers': 'Specific Tiers',
};

const sectorLabels: { [key: string]: string } = {
  'sec-1': 'Food & Dining',
  'sec-2': 'Fashion & Beauty',
  'sec-3': 'Health & Wellness',
}

interface DisplayStatus {
  text: string;
  variant: 'default' | 'secondary' | 'destructive';
}

const getRewardDisplayStatus = (reward: RewardResponse): DisplayStatus => {
  const now = new Date();
  const expiryDate = new Date(reward.expiry);

  if (expiryDate < now) {
    return { text: 'Expired', variant: 'destructive' };
  }

  if (reward.status === 'active') {
    return { text: 'Active', variant: 'default' };
  } else if (reward.status === 'draft') {
    return { text: 'Draft', variant: 'secondary' };
  }
  return { text: 'Unknown', variant: 'secondary' }; // Fallback
};

export default function AdminRewardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [selectedReward, setSelectedReward] = useState<RewardResponse | null>(null);
  const [rewardToDelete, setRewardToDelete] = useState<string | null>(null);
  const [startTour, setStartTour] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // You can adjust the limit as needed

  const { data, isLoading, isError } = useGetRewards(page, limit);
  const { mutate: deleteReward, isPending: isDeleting } = useDeleteReward();
  const rewards = data?.data || [];

  const groupedAndFilteredRewards = useMemo(() => {
    const filtered = rewards.filter((reward) => {
      const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || reward.rewardType === filterType;
      const matchesStatus = filterStatus === 'all' || reward.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });

    // Group by type
    return filtered.reduce((acc, reward) => {
      const group = typeLabels[reward.rewardType] || 'Other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(reward);
      return acc;
    }, {} as { [key: string]: RewardResponse[] });
  }, [searchTerm, filterType, filterStatus, rewards]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedReward(null);
    setStartTour(true);
    setIsModalOpen(true);
  };

  const handleEdit = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward) {
      setModalMode('edit');
      setSelectedReward(reward);
      setIsModalOpen(true);
    }
  };

  const handleDuplicate = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward) {
      setModalMode('duplicate');
      setSelectedReward(reward);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (rewardId: string) => {
    setRewardToDelete(rewardId);
  };

  const confirmDelete = () => {
    if (rewardToDelete) {
      deleteReward(rewardToDelete, {
        onSuccess: () => {
          setRewardToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div>Error fetching rewards.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Rewards</h1>
            <p className="text-gray-600">Create, group, and manage all rewards available on the platform.</p>
          </div>
          <Button onClick={handleCreate}>Create New Reward</Button>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search rewards by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Rewards Grid */}
        {Object.keys(groupedAndFilteredRewards).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">No rewards match your criteria.</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAndFilteredRewards).map(([groupName, groupRewards]) => (
              <div key={groupName}>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">{groupName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupRewards.map((reward) => (
                    <Card key={reward.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                              {reward.image && (
                                <Image
                                  src={reward.image}
                                  alt={reward.title}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{reward.title}</CardTitle>
                              {(() => {
                                const { text, variant } = getRewardDisplayStatus(reward);
                                return <Badge variant={variant}>{text}</Badge>;
                              })()}
                            </div>
                          </div>
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(reward.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(reward.id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  <span>Duplicate</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(reward.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3 h-10">{reward.description}</p>
                        <div className="space-y-2 text-sm border-t pt-3 mt-3">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-500">Value:</span>
                            <span>£{reward.value}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-500">Points:</span>
                            <span>{reward.pointRequired}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-500">Created:</span>
                            <span>{new Date(reward.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <CreateRewardWizardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          reward={selectedReward}
          startTour={startTour}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!rewardToDelete} onOpenChange={() => setRewardToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the reward
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}