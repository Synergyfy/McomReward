'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateReward } from "@/services/rewards/hook";
import { CreateRewardRequest } from "@/services/rewards/types";
import React, { useState } from "react";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateRewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRewardDialog({ isOpen, onClose }: CreateRewardDialogProps) {
  const [title, setTitle] = useState('');
  const [pointsRequired, setPointsRequired] = useState(0);
  const [value, setValue] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const { mutate: createReward, isPending: isCreatingReward } = useCreateReward();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const paramsToSign = {
        timestamp: Math.round((new Date).getTime()/1000),
      };

      const signatureResponse = await fetch('/api/sign-cloudinary-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign }),
      });
      const { signature } = await signatureResponse.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('timestamp', paramsToSign.timestamp.toString());
      formData.append('signature', signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Cloudinary upload failed.');
      }

      const data = await response.json();
      return data.secure_url;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    let imageUrlToSubmit = '';

    if (selectedFile) {
      try {
        imageUrlToSubmit = await uploadImageToCloudinary(selectedFile);
      } catch (error) {
        alert(`Image upload failed: ${error}`);
        return; // Stop submission if image upload fails
      }
    }

    const rewardData: CreateRewardRequest = {
      title,
      points_required: pointsRequired,
      value,
      description,
      image: imageUrlToSubmit,
      quantity,
    };
    createReward(rewardData, {
      onSuccess: () => {
        alert('Reward created successfully!');
        onClose();
        // Reset form fields
        setTitle('');
        setPointsRequired(0);
        setValue(0);
        setDescription('');
        setSelectedFile(null);
        setImagePreviewUrl(null);
        setQuantity(0);
      },
      onError: (error) => {
        alert(`Error creating reward: ${error.message}`);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Reward</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right col-span-1">
              Title
            </label>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. Free Coffee"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>The name of the reward that customers will see.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="pointsRequired" className="text-right col-span-1">
              Points
            </label>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Input
                    id="pointsRequired"
                    type="number"
                    value={pointsRequired}
                    onChange={(e) => setPointsRequired(Number(e.target.value))}
                    className="col-span-3"
                    placeholder="e.g. 100"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>How many points a customer needs to redeem this reward.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="value" className="text-right col-span-1">
              Value
            </label>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Input
                    id="value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="col-span-3"
                    placeholder="e.g. 5.00"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>The monetary value of the reward, if applicable (e.g., for a $5 discount, enter 5).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right col-span-1">
              Description
            </label>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. A free coffee of your choice"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>A short, clear description of the reward.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="image" className="text-right col-span-1">
              Image
            </label>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <CloudinaryUpload onFileSelect={handleFileSelect} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload a visually appealing image for the reward.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {imagePreviewUrl && (
              <div className="col-span-4 mt-4">
                <p className="text-sm font-medium">Uploaded Image:</p>
                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                  <Image
                    src={imagePreviewUrl}
                    alt="Uploaded reward image"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="quantity" className="text-right col-span-1">
              Quantity
            </label>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="col-span-3"
                    placeholder="e.g. 100"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>The total number of this reward available for redemption.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isCreatingReward || isUploadingImage}>
          {isCreatingReward || isUploadingImage ? 'Processing...' : 'Create Reward'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
