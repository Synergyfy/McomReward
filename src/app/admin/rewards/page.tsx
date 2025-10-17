'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateReward } from '@/hooks/useCreateReward';
import { CreateRewardRequest } from '@/types/rewards';
import { useGetRewards } from '@/hooks/useGetRewards';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function RewardsPage() {
  const [title, setTitle] = useState('');
  const [pointsRequired, setPointsRequired] = useState(0);
  const [value, setValue] = useState(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(0);
  const createRewardMutation = useCreateReward();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data: rewardsData, isLoading: isLoadingRewards } = useGetRewards(
    page,
    limit
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rewardData: CreateRewardRequest = {
      title,
      points_required: pointsRequired,
      value,
      description,
      image,
      quantity,
    };
    createRewardMutation.mutate(rewardData, {
      onSuccess: () => {
        alert('Reward created successfully!');
        setTitle('');
        setPointsRequired(0);
        setValue(0);
        setDescription('');
        setImage('');
        setQuantity(0);
      },
      onError: (error) => {
        alert(`Error creating reward: ${error.message}`);
      },
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5 text-primary">Rewards</h1>
      <p className="mb-5">Manage rewards for the loyalty platform.</p>

      <Card className="max-w-md mb-10">
        <CardHeader>
          <CardTitle>Create New Reward</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter reward title"
                required
              />
            </div>
            <div>
              <label
                htmlFor="pointsRequired"
                className="block text-sm font-medium mb-1"
              >
                Points Required
              </label>
              <Input
                id="pointsRequired"
                type="number"
                value={pointsRequired}
                onChange={(e) => setPointsRequired(Number(e.target.value))}
                placeholder="Enter points required"
                required
              />
            </div>
            <div>
              <label htmlFor="value" className="block text-sm font-medium mb-1">
                Value
              </label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder="Enter reward value"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter reward description"
                required
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <Input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Enter image URL"
                required
              />
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium mb-1"
              >
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter reward quantity"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={createRewardMutation.isPending}
              className="w-full"
            >
              {createRewardMutation.isPending ? 'Creating...' : 'Create Reward'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-5">All Rewards</h2>

      {isLoadingRewards ? (
        <p>Loading rewards...</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Points Required</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewardsData?.rewards && rewardsData.rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>{reward.title}</TableCell>
                  <TableCell>{reward.points_required}</TableCell>
                  <TableCell>{reward.value}</TableCell>
                  <TableCell>{reward.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center p-4">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>
              Page {rewardsData?.currentPage} of {rewardsData?.totalPages}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === rewardsData?.totalPages}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
