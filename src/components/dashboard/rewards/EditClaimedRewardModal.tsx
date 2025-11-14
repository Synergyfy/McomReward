
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import Image from 'next/image';
import DateTimePicker from '@/components/dashboard/campaigns/datePicker';
import { Reward } from '@/app/dashboard/rewards/page';

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
  const [expiry, setExpiry] = useState(new Date());
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isCoBranded = userPlan === 'co-branded';
  const isWhiteLabel = userPlan === 'white-label';

  useEffect(() => {
    if (rewardTemplate) {
      setName(rewardTemplate.name);
      setDescription(rewardTemplate.description);
      setValue(rewardTemplate.value);
      setPointsRequired(rewardTemplate.pointsRequired);
      setExpiry(new Date(rewardTemplate.expiry));
      setImagePreviewUrl(rewardTemplate.image || null);
    }
  }, [rewardTemplate]);

  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleSubmit = () => {
    if (!rewardTemplate) return;

    const newReward: Reward = {
      ...rewardTemplate,
      id: new Date().toISOString(), // New ID for the claimed reward
      name,
      description,
      value: Number(value),
      pointsRequired: Number(pointsRequired),
      expiry,
      image: imagePreviewUrl,
      status: 'active',
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
            <label className="block text-sm font-medium mb-2">Reward Type</label>
            <Select value={rewardTemplate.type} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rewardTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                value={pointsRequired}
                onChange={(e) => setPointsRequired(e.target.value)}
                disabled={!isWhiteLabel}
              />
              {!isWhiteLabel && <p className="text-xs text-gray-500 mt-1">Upgrade to White-Label to edit.</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expiry Date</label>
            <DateTimePicker date={expiry} setDate={setExpiry} disabled={!isWhiteLabel} />
            {!isWhiteLabel && <p className="text-xs text-gray-500 mt-1">Upgrade to White-Label to edit.</p>}
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
          <Button onClick={handleSubmit}>Add to My Rewards</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
