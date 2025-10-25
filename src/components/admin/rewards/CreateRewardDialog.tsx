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
import React, { useState, useEffect, useMemo } from "react";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import Image from "next/image";

interface CreateRewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRewardDialog({ isOpen, onClose }: CreateRewardDialogProps) {
  const [title, setTitle] = useState('');
  const [pointsRequired, setPointsRequired] = useState(0);
  const [value, setValue] = useState(0);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createReward, isPending: isCreatingReward } = useCreateReward();

  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
  };

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (pointsRequired <= 0) newErrors.pointsRequired = 'Points Required must be greater than 0.';
    if (value <= 0) newErrors.value = 'Value must be greater than 0.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!selectedFile) newErrors.image = 'Image is required.';
    if (quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0.';
    setErrors(newErrors);
  }, [title, pointsRequired, value, description, selectedFile, quantity]);

  // Form is valid if no errors
  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

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
    if (!isFormValid) {
      return;
    }

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
        // Reset form
        setTitle('');
        setPointsRequired(0);
        setValue(0);
        setDescription('');
        setQuantity(0);
        setSelectedFile(null);
        setImagePreviewUrl(null);
        setErrors({});
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
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
            <Input id="title" placeholder="Title" value={title} onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: '' }); }} className={errors.title ? 'border-red-500' : ''} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="pointsRequired" className="block text-sm font-medium mb-1">Points Required</label>
            <Input id="pointsRequired" placeholder="Points Required" type="number" value={pointsRequired} onChange={(e) => { setPointsRequired(Number(e.target.value)); setErrors({ ...errors, pointsRequired: '' }); }} className={errors.pointsRequired ? 'border-red-500' : ''} />
            {errors.pointsRequired && <p className="text-red-500 text-xs mt-1">{errors.pointsRequired}</p>}
          </div>
          <div>
            <label htmlFor="value" className="block text-sm font-medium mb-1">Value</label>
            <Input id="value" placeholder="Value" type="number" value={value} onChange={(e) => { setValue(Number(e.target.value)); setErrors({ ...errors, value: '' }); }} className={errors.value ? 'border-red-500' : ''} />
            {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <Input id="description" placeholder="Description" value={description} onChange={(e) => { setDescription(e.target.value); setErrors({ ...errors, description: '' }); }} className={errors.description ? 'border-red-500' : ''} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
            <Input id="quantity" placeholder="Quantity" type="number" value={quantity} onChange={(e) => { setQuantity(Number(e.target.value)); setErrors({ ...errors, quantity: '' }); }} className={errors.quantity ? 'border-red-500' : ''} />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Reward Image</label>
            <CloudinaryUpload onFileSelect={handleFileSelect} />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            {imagePreviewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium">Image Preview:</p>
                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                  <Image
                    src={imagePreviewUrl}
                    alt="Image preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isUploadingImage || isCreatingReward || !isFormValid}>
          {isUploadingImage ? 'Uploading Image...' : isCreatingReward ? 'Creating Reward...' : 'Create Reward'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}