'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import CreateRewardWizardModal from '@/components/dashboard/rewards/CreateRewardWizardModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Reward {
  id: string;
  name: string;
  type: string;
  value: number | string;
  pointsRequired: number | string;
  expiry: Date;
  image?: string | null;
  description: string;
  status: 'active' | 'expired';
  deletedAt?: Date;
}

// Mock data for prototype
const initialRewards: Reward[] = [
  {
    id: '1',
    name: 'Summer Voucher',
    type: 'voucher',
    value: 50,
    pointsRequired: 1000,
    expiry: new Date('2024-08-31'),
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=150&h=150&fit=crop&q=80',
    description: 'Get 50% off on summer items',
    status: 'active',
  },
  {
    id: '2',
    name: 'Gift Card',
    type: 'gift_card',
    value: 100,
    pointsRequired: 2000,
    expiry: new Date('2024-12-31'),
    image: 'https://images.unsplash.com/photo-1577538205243-a71bf516c5b2?w=150&h=150&fit=crop&q=80',
    description: 'Universal gift card',
    status: 'active',
  },
  {
    id: '3',
    name: 'Discount Coupon',
    type: 'coupon',
    value: 20,
    pointsRequired: 500,
    expiry: new Date('2024-06-30'),
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=150&h=150&fit=crop&q=80',
    description: '20% off any purchase',
    status: 'expired',
  },
  {
    id: '4',
    name: 'Points Boost',
    type: 'points_offer',
    value: 0,
    pointsRequired: 0,
    expiry: new Date('2024-10-31'),
    image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=150&h=150&fit=crop&q=80',
    description: 'Double points for a week',
    status: 'active',
  },
  {
    id: '5',
    name: 'Free Product',
    type: 'physical_product',
    value: 75,
    pointsRequired: 1500,
    expiry: new Date('2024-09-30'),
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&h=150&fit=crop&q=80',
    description: 'Free branded t-shirt',
    status: 'active',
  },
  {
    id: '6',
    name: 'Exclusive Deal',
    type: 'coupon',
    value: 30,
    pointsRequired: 800,
    expiry: new Date('2024-07-15'),
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&h=150&fit=crop&q=80',
    description: '30% off exclusive items',
    status: 'active',
  },
  {
    id: '7',
    name: 'Holiday Voucher',
    type: 'voucher',
    value: 100,
    pointsRequired: 2500,
    expiry: new Date('2024-12-25'),
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&h=150&fit=crop&q=80',
    description: 'Holiday season voucher',
    status: 'active',
  },
  {
    id: '8',
    name: 'Loyalty Gift',
    type: 'gift_card',
    value: 50,
    pointsRequired: 1200,
    expiry: new Date('2024-11-30'),
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=150&h=150&fit=crop&q=80',
    description: 'Thank you gift card',
    status: 'active',
  },
];

const typeLabels: { [key: string]: string } = {
  voucher: 'Voucher',
  gift_card: 'Gift Card',
  coupon: 'Coupon',
  points_offer: 'Points Offer',
  physical_product: 'Physical Product',
};

// Mock user data
const currentUser = {
  plan: 'white-label', // 'starter', 'co-branded', 'white-label'
};

export default function BusinessRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [deletedRewards, setDeletedRewards] = useState<Reward[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const handleOpenModal = useCallback((reward: Reward | null = null) => {
    setEditingReward(reward);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((rewardId: string) => {
    setRewardToDelete(rewardId);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    const reward = rewards.find(r => r.id === rewardToDelete);
    if (reward) {
      setDeletedRewards(prev => [...prev, { ...reward, deletedAt: new Date() }]);
      setRewards(prev => prev.filter(r => r.id !== rewardToDelete));
    }
    setIsDeleteDialogOpen(false);
    setRewardToDelete(null);
  }, [rewardToDelete, rewards]);

  const handleSaveReward = useCallback((rewardData: Reward) => {
    setRewards(prev => {
      const exists = prev.some(r => r.id === rewardData.id);
      if (exists) {
        return prev.map(r => r.id === rewardData.id ? rewardData : r);
      }
      return [rewardData, ...prev];
    });
  }, []);

  const filteredRewards = useMemo(() => {
    const source = showDeleted ? deletedRewards : rewards;
    return source.filter((reward: Reward) => {
      if (showDeleted) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (reward.deletedAt && new Date(reward.deletedAt) < thirtyDaysAgo) {
          return false;
        }
      }
      const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reward.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || filterType === 'all' || reward.type === filterType;
      const matchesStatus = !filterStatus || filterStatus === 'all' || reward.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, filterType, filterStatus, rewards, deletedRewards, showDeleted]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Rewards</h1>
            <p className="text-gray-600">Manage and create rewards for your business campaigns.</p>
          </div>
          <Button onClick={() => handleOpenModal()}> Add Reward</Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search rewards..."
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
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Switch id="show-deleted" checked={showDeleted} onCheckedChange={setShowDeleted} />
            <Label htmlFor="show-deleted">Show Deleted</Label>
          </div>
        </div>

        {/* Rewards Grid */}
        {filteredRewards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{showDeleted ? 'No recently deleted rewards.' : 'No rewards found. Create your first reward!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward: Reward) => (
              <Card key={reward.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        {reward.image && (
                          <Image
                            src={reward.image}
                            alt={reward.name}
                            layout="fill"
                            objectFit="cover"
                          />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <Badge variant={reward.status === 'active' ? 'default' : 'secondary'}>
                          {reward.status === 'active' ? 'Active' : 'Expired'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span>{typeLabels[reward.type as keyof typeof typeLabels]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Value:</span>
                      <span>£{reward.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Points:</span>
                      <span>{reward.pointsRequired}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Expires:</span>
                      <span>{new Date(reward.expiry).toLocaleDateString()}</span>
                    </div>
                    {showDeleted && reward.deletedAt && (
                       <div className="flex justify-between text-red-600">
                         <span className="font-medium">Deleted:</span>
                         <span>{new Date(reward.deletedAt).toLocaleDateString()}</span>
                       </div>
                    )}
                  </div>
                </CardContent>
                {!showDeleted && (
                  <CardFooter className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(reward)}
                      disabled={currentUser.plan === 'starter'}
                      title={currentUser.plan === 'starter' ? 'Upgrade to edit rewards' : 'Edit'}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(reward.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <CreateRewardWizardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reward={editingReward}
          onSave={handleSaveReward}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the reward.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
