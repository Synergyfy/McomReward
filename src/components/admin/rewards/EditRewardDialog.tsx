'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateReward } from "@/services/rewards/hook";
import { RewardResponse, CreateRewardRequest } from "@/services/rewards/types";
import { useState } from "react";

interface EditRewardDialogProps {
  reward: RewardResponse;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditRewardDialog({ reward, isOpen, onClose }: EditRewardDialogProps) {
  const [title, setTitle] = useState(reward.title);
  const [pointsRequired, setPointsRequired] = useState(reward.pointsRequired);
  const [value, setValue] = useState(reward.value);
  const [description, setDescription] = useState(reward.description);
  const [image, setImage] = useState(reward.image);
  const [quantity, setQuantity] = useState(reward.quantity);
  const { mutate: updateReward, isPending: isUpdatingReward } = useUpdateReward();

  const handleSubmit = () => {
    const rewardData: Partial<CreateRewardRequest> = {
      title,
      points_required: pointsRequired,
      value,
      description,
      image,
      quantity,
    };
    updateReward({ rewardId: reward.id, ...rewardData }, {
      onSuccess: () => {
        alert('Reward updated successfully!');
        onClose();
      },
      onError: (error) => {
        alert(`Error updating reward: ${error.message}`);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Reward</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right col-span-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="pointsRequired" className="text-right col-span-1">
              Points
            </label>
            <Input
              id="pointsRequired"
              type="number"
              value={pointsRequired}
              onChange={(e) => setPointsRequired(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="value" className="text-right col-span-1">
              Value
            </label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right col-span-1">
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="quantity" className="text-right col-span-1">
              Quantity
            </label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isUpdatingReward}>
          {isUpdatingReward ? 'Updating...' : 'Update Reward'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
