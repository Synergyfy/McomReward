'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import CreateRewardWizardModal from '@/components/admin/rewards/CreateRewardWizardModal';
import { MoreVertical, Edit, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define the type for a reward
export type Reward = {
  id: string;
  name: string;
  type: string;
  value: number;
  pointsRequired: number;
  expiry: Date;
  image: string;
  description: string;
  status: 'active' | 'expired' | 'draft';
  sector: string;
  category: string;
  subCategory: string;
  rewardSource: 'mcom' | 'partner';
  audience: 'all_businesses' | 'specific_sectors' | 'specific_tiers';
  badgeLevel?: string;
};


// Mock data for prototype
const mockRewards: Reward[] = [
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
    sector: 'sec-2',
    category: 'cat-2-1',
    subCategory: 'sub-2-1-1',
    rewardSource: 'mcom',
    audience: 'all_businesses',
    badgeLevel: 'GOLD'
  },
  {
    id: '2',
    name: 'Gift Card',
    type: 'gift_card',
    value: 100,
    pointsRequired: 2000,
    expiry: new Date('2024-12-31'),
    image: 'https://images.unsplash.com/photo-1577538205243-a71bf516c5b2?w=150&h=150&fit=crop&q=80',
    description: 'Universal gift card for any restaurant.',
    status: 'active',
    sector: 'sec-1',
    category: 'cat-1-1',
    subCategory: 'sub-1-1-1',
    rewardSource: 'partner',
    audience: 'specific_tiers',
    badgeLevel: 'PLATINUM'
  },
  {
    id: '3',
    name: 'Discount Coupon',
    type: 'coupon',
    value: 20,
    pointsRequired: 500,
    expiry: new Date('2024-06-30'),
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=150&h=150&fit=crop&q=80',
    description: '20% off any purchase in fashion stores.',
    status: 'expired',
    sector: 'sec-2',
    category: 'cat-2-1',
    subCategory: 'sub-2-1-2',
    rewardSource: 'mcom',
    audience: 'all_businesses',
  },
  {
    id: '4',
    name: 'Points Boost',
    type: 'points_offer',
    value: 0,
    pointsRequired: 0,
    expiry: new Date('2024-10-31'),
    image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=150&h=150&fit=crop&q=80',
    description: 'Double points for a week at any wellness center.',
    status: 'active',
    sector: 'sec-3',
    category: '',
    subCategory: '',
    rewardSource: 'mcom',
    audience: 'specific_sectors',
  },
  {
    id: '5',
    name: 'Free Product',
    type: 'physical_product',
    value: 75,
    pointsRequired: 1500,
    expiry: new Date('2024-09-30'),
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&h=150&fit=crop&q=80',
    description: 'Free branded t-shirt for our loyal customers.',
    status: 'draft',
    sector: 'sec-2',
    category: 'cat-2-1',
    subCategory: 'sub-2-1-2',
    rewardSource: 'partner',
    audience: 'specific_tiers',
    badgeLevel: 'SILVER'
  },
  {
    id: '6',
    name: 'Exclusive Deal',
    type: 'coupon',
    value: 30,
    pointsRequired: 800,
    expiry: new Date('2024-07-15'),
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&h=150&fit=crop&q=80',
    description: '30% off exclusive items at our partner cafes.',
    status: 'active',
    sector: 'sec-1',
    category: 'cat-1-2',
    subCategory: '',
    rewardSource: 'partner',
    audience: 'all_businesses',
  },
  {
    id: '7',
    name: 'Holiday Voucher',
    type: 'voucher',
    value: 100,
    pointsRequired: 2500,
    expiry: new Date('2024-12-25'),
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&h=150&fit=crop&q=80',
    description: 'A special holiday season voucher for fine dining.',
    status: 'draft',
    sector: 'sec-1',
    category: 'cat-1-1',
    subCategory: 'sub-1-1-1',
    rewardSource: 'mcom',
    audience: 'specific_tiers',
    badgeLevel: 'GOLD'
  },
  {
    id: '8',
    name: 'Loyalty Gift',
    type: 'gift_card',
    value: 50,
    pointsRequired: 1200,
    expiry: new Date('2024-11-30'),
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=150&h=150&fit=crop&q=80',
    description: 'A thank you gift card for our wellness members.',
    status: 'active',
    sector: 'sec-3',
    category: '',
    subCategory: '',
    rewardSource: 'mcom',
    audience: 'specific_sectors',
  },
];

const typeLabels: { [key: string]: string } = {
  voucher: 'Vouchers',
  gift_card: 'Gift Cards',
  coupon: 'Coupons',
  points_offer: 'Points Offers',
  physical_product: 'Physical Products',
};

const audienceLabels: { [key: string]: string } = {
  all_businesses: 'All Businesses',
  specific_sectors: 'Specific Sectors',
  specific_tiers: 'Specific Tiers',
};

const sectorLabels: { [key: string]: string } = {
    'sec-1': 'Food & Dining',
    'sec-2': 'Fashion & Beauty',
    'sec-3': 'Health & Wellness',
}

export default function AdminRewardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);


  const groupedAndFilteredRewards = useMemo(() => {
    const filtered = mockRewards.filter((reward) => {
      const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reward.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || reward.type === filterType;
      const matchesStatus = filterStatus === 'all' || reward.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });

    // Group by type
    return filtered.reduce((acc, reward) => {
      const group = typeLabels[reward.type] || 'Other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(reward);
      return acc;
    }, {} as { [key: string]: typeof mockRewards });
  }, [searchTerm, filterType, filterStatus]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedReward(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rewardId: string) => {
    const reward = mockRewards.find(r => r.id === rewardId);
    if (reward) {
      setModalMode('edit');
      setSelectedReward(reward);
      setIsModalOpen(true);
    }
  };

  const handleDuplicate = (rewardId: string) => {
    const reward = mockRewards.find(r => r.id === rewardId);
    if (reward) {
      setModalMode('duplicate');
      setSelectedReward(reward);
      setIsModalOpen(true);
    }
  };

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
            {Object.entries(groupedAndFilteredRewards).map(([groupName, rewards]) => (
              <div key={groupName}>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">{groupName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewards.map((reward) => (
                    <Card key={reward.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                              <Image
                                src={reward.image}
                                alt={reward.name}
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{reward.name}</CardTitle>
                              <Badge variant={reward.status === 'active' ? 'default' : 'secondary'}>
                                {reward.status}
                              </Badge>
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
                            <span>{reward.pointsRequired}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-500">Expires:</span>
                            <span>{reward.expiry.toLocaleDateString()}</span>
                          </div>
                           <div className="flex justify-between">
                            <span className="font-medium text-gray-500">Sector:</span>
                            <span>{sectorLabels[reward.sector] || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-500">Audience:</span>
                            <span className="capitalize">{audienceLabels[reward.audience] || 'N/A'}</span>
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
        />
      </div>
    </div>
  );
}