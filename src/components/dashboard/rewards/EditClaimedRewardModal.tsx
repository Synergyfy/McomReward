
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import Image from 'next/image';
import { Reward } from '@/services/business-reward/types';

interface EditClaimedRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardTemplate: Reward | null;
  onSave: (rewardData: Reward) => void;
  userPlan: 'starter' | 'co-branded' | 'white-label';
}

const rewardTypes = [
  { value: 'voucher', label: 'Voucher', icon: '🎟️' },
  { value: 'gift_card', label: 'Gift Card', icon: '🎁' },
  { value: 'coupon', label: 'Coupon', icon: '🏷️' },
  { value: 'points_offer', label: 'Points Offer', icon: '⭐' },
  { value: 'physical_product', label: 'Physical Product', icon: '📦' },
];

export default function EditClaimedRewardModal({
  isOpen,
  onClose,
  rewardTemplate,
  onSave,
  userPlan,
}: EditClaimedRewardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number | string>(0);
  const [pointsRequired, setPointsRequired] = useState<number | string>(0);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isCoBranded = userPlan === 'co-branded';
  const isWhiteLabel = userPlan === 'white-label';

  // Validation: Check if pointsRequired exceeds maxPoints
  const isPointsExceedingMax = useMemo(() => {
    if (!rewardTemplate) return false;
    const points = Number(pointsRequired);
    return points > rewardTemplate.maxPoints;
  }, [pointsRequired, rewardTemplate]);

  useEffect(() => {
    if (rewardTemplate) {
      setName(rewardTemplate.title);
      setDescription(rewardTemplate.description);
      setValue(rewardTemplate.value);
      setPointsRequired(rewardTemplate.pointsRequired);
      setImagePreviewUrl(rewardTemplate.image || null);
    }
  }, [rewardTemplate]);

  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty string for user to clear the field
    if (inputValue === '') {
      setPointsRequired('');
      return;
    }

    const numValue = Number(inputValue);

    // Only update if the value is valid and within range
    if (!isNaN(numValue) && numValue >= 0) {
      // Allow the input but the validation will show error if exceeds max
      setPointsRequired(inputValue);
    }
  };

  const handleSubmit = () => {
    if (!rewardTemplate) return;

    const newReward: Reward = {
      ...rewardTemplate,
      id: new Date().toISOString(), // New ID for the claimed reward
      title: name,
      description,
      value: Number(value),
      pointsRequired: Number(pointsRequired),
      image: imagePreviewUrl || '',
    };

    onSave(newReward);
    onClose();
  };

  if (!rewardTemplate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Reward</DialogTitle>
          <DialogDescription>
            Edit the details of your selected reward. Your plan is{' '}
            <span className="font-bold">{userPlan}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isCoBranded && !isWhiteLabel}
            />
            {!isCoBranded && !isWhiteLabel && <p className="text-xs text-gray-500 mt-1">Upgrade to Co-Branded to edit.</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isCoBranded && !isWhiteLabel}
            />
            {!isCoBranded && !isWhiteLabel && <p className="text-xs text-gray-500 mt-1">Upgrade to Co-Branded to edit.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="value" className="block text-sm font-medium mb-1">Value (£)</label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isWhiteLabel}
              />
              {!isWhiteLabel && <p className="text-xs text-gray-500 mt-1">Upgrade to White-Label to edit.</p>}
            </div>
            <div>
              <label htmlFor="points" className="block text-sm font-medium mb-1">Points Required</label>
              <Input
                id="points"
                type="number"
                min="0"
                max={rewardTemplate?.maxPoints}
                value={pointsRequired}
                onChange={handlePointsChange}
                disabled={!isWhiteLabel}
                className={isPointsExceedingMax ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {!isWhiteLabel && <p className="text-xs text-gray-500 mt-1">Upgrade to White-Label to edit.</p>}
              {isWhiteLabel && isPointsExceedingMax && (
                <p className="text-xs text-red-500 mt-1">
                  Points cannot exceed the maximum of {rewardTemplate?.maxPoints} points set by admin.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reward Image</label>
            <CloudinaryUpload onFileSelect={handleFileSelect} disabled={!isWhiteLabel} />
            {imagePreviewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium">Image Preview:</p>
                <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                  <Image src={imagePreviewUrl} alt="Preview" layout="fill" objectFit="cover" />
                </div>
              </div>
            )}
            {!isWhiteLabel && <p className="text-xs text-gray-500 mt-1">Upgrade to White-Label to edit.</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isPointsExceedingMax}>Add to My Rewards</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
