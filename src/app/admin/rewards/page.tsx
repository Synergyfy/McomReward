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
  const [limit] = useState(5);
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Rewards</h1>
          <p className="text-muted-foreground">Create, edit, and delete rewards for your platform.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Reward</CardTitle>
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
                  </div>
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium mb-1">
                      Image
                    </label>
                    <CloudinaryUpload onUpload={setImage} />
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
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRewards ? (
                  <p>Loading rewards...</p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rewardsData?.data && rewardsData.data.map((reward) => (
                          <TableRow key={reward.id}>
                            <TableCell className="font-medium">{reward.title}</TableCell>
                            <TableCell>{reward.pointsRequired}</TableCell>
                            <TableCell>${reward.value}</TableCell>
                            <TableCell>
                              <Button onClick={() => handleEditClick(reward)} variant="outline" size="sm" className="mr-2">Edit</Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">Delete</Button>
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
                    <div className="flex justify-center items-center mt-6 space-x-4 p-4 border-t">
                      <Button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        variant="outline"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {rewardsData?.currentPage} of {rewardsData?.totalPages}
                      </span>
                      <Button
                        onClick={() => setPage(page + 1)}
                        disabled={!rewardsData || page === rewardsData.totalPages}
                        variant="outline"
                      >
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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
