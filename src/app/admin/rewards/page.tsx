'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateReward, useGetRewards, useUpdateReward, useDeleteReward } from '@/services/rewards/hook';
import { CreateRewardRequest, RewardResponse } from '@/services/rewards/types';
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
import EditRewardDialog from '@/components/admin/rewards/EditRewardDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { mutate: deleteReward } = useDeleteReward();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardResponse | null>(null);

  const handleEditClick = (reward: RewardResponse) => {
    setSelectedReward(reward);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (rewardId: string) => {
    deleteReward(rewardId, {
      onSuccess: () => {
        alert('Reward deleted successfully!');
      },
      onError: (error) => {
        alert(`Error deleting reward: ${error.message}`);
      },
    });
  };

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
    <TooltipProvider>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Free Coffee"
                      required
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The name of the reward that customers will see.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div>
                <label
                  htmlFor="pointsRequired"
                  className="block text-sm font-medium mb-1"
                >
                  Points Required
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="pointsRequired"
                      type="number"
                      value={pointsRequired}
                      onChange={(e) => setPointsRequired(Number(e.target.value))}
                      placeholder="e.g. 100"
                      required
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How many points a customer needs to redeem this reward.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div>
                <label htmlFor="value" className="block text-sm font-medium mb-1">
                  Value
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="value"
                      type="number"
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      placeholder="e.g. 5.00"
                      required
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The monetary value of the reward, if applicable (e.g., for a $5 discount, enter 5).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. A free coffee of your choice"
                      required
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>A short, clear description of the reward.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium mb-1">
                  Image
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CloudinaryUpload onUpload={setImage} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload a visually appealing image for the reward.</p>
                  </TooltipContent>
                </Tooltip>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      placeholder="e.g. 100"
                      required
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The total number of this reward available for redemption.</p>
                  </TooltipContent>
                </Tooltip>
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
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <Button onClick={() => handleEditClick(reward)} className="mr-2">Edit</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the reward.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteClick(reward.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
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
                disabled={!rewardsData || page === rewardsData.totalPages}
              >
                Next
              </Button>
            </div>
          </Card>
        )}
        {selectedReward && (
          <EditRewardDialog
            reward={selectedReward}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
