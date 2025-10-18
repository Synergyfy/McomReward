'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateReward, useGetRewards } from '@/services/rewards/hook';
import { CreateRewardRequest } from '@/services/rewards/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import Image from 'next/image';

export default function RewardsPage() {
  const [title, setTitle] = useState('');
  const [pointsRequired, setPointsRequired] = useState(0);
  const [value, setValue] = useState(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(0);
  const { mutate: createReward, isPending: isCreatingReward } = useCreateReward();
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
      pointsRequired: pointsRequired,
      value,
      description,
      image,
      quantity,
    };
    createReward(rewardData, {
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
                placeholder="e.g. Free Coffee"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">The name of the reward.</p>
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
                placeholder="e.g. 100"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">How many points a customer needs to redeem this reward.</p>
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
                placeholder="e.g. 5.00"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">The monetary value of the reward, if applicable.</p>
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
                placeholder="e.g. A free coffee of your choice"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">A short description of the reward.</p>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium mb-1">
                Image
              </label>
              <CloudinaryUpload onUpload={setImage} />
              <p className="text-sm text-muted-foreground mt-1">
                Upload an image for the reward.
              </p>
              {image && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Uploaded Image:</p>
                  <Image
                    src={image}
                    alt="Uploaded reward image"
                    width={100}
                    height={100}
                    className="rounded-md"
                  />
                </div>
              )}
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
                placeholder="e.g. 100"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">The total number of this reward available.</p>
            </div>
            <Button
              type="submit"
              disabled={isCreatingReward}
              className="w-full"
            >
              {isCreatingReward ? 'Creating...' : 'Create Reward'}
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
                <TableHead>Description</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Points Required</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewardsData?.data && rewardsData.data.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>{reward.title}</TableCell>
                  <TableCell>{reward.description}</TableCell>
                  <TableCell>
                    <Image
                      src={reward.image}
                      alt={reward.title}
                      width={50}
                      height={50}
                      className="rounded-md"
                    />
                  </TableCell>
                  <TableCell>{reward.pointsRequired}</TableCell>
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
              Page {page} of {rewardsData ? Math.ceil(rewardsData.total / limit) : 1}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={!rewardsData || page === Math.ceil(rewardsData.total / limit)}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
