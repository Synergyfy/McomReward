'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Reward } from '@/services/business-reward/types';

interface CreateRewardWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward?: Reward | null;
  onSave: (rewardData: Reward) => void;
}

export default function CreateRewardWizardModal({ isOpen, onClose, reward, onSave }: CreateRewardWizardModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Step 1: Details
  const [name, setName] = useState(reward?.title || '');
  const [description, setDescription] = useState(reward?.description || '');
  const [value, setValue] = useState<number | string>(reward?.value || 0);
  const [pointsRequired, setPointsRequired] = useState<number | string>(reward?.pointsRequired || 0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(reward?.image || null);
  const [quantity, setQuantity] = useState<number>(reward?.quantity || 0);
  const [disabled, setDisabled] = useState<boolean>(reward?.disabled || false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = useMemo(() => !!reward, [reward]);

  const resetForm = () => {
    setStep(1);
    setName(reward?.title || '');
    setDescription(reward?.description || '');
    setValue(reward?.value || 0);
    setPointsRequired(reward?.pointsRequired || 0);
    setSelectedFile(null);
    setImagePreviewUrl(reward?.image || null);
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, reward]);

  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
  };

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (Number(value) <= 0) newErrors.value = 'Value must be greater than 0.';
    if (Number(pointsRequired) <= 0) newErrors.pointsOrBadge = 'Points Required is required.';
    if (!isEditMode && !selectedFile) newErrors.image = 'Image is required.';
    setErrors(newErrors);
  }, [name, description, value, pointsRequired, selectedFile, isEditMode]);

  const isStep1Valid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const rewardData: Reward = {
      id: reward?.id || new Date().toISOString(),
      title: name,
      description,
      value: Number(value),
      pointsRequired: Number(pointsRequired),
      image: imagePreviewUrl || '',
      quantity,
      disabled,
      createdAt: reward?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(rewardData);
    onClose();
  };

  const progressValue = (step / totalSteps) * 100;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Reward' : 'Create New Reward'}</DialogTitle>
            <Progress value={progressValue} className="mt-2" />
          </DialogHeader>

          {step === 1 && (
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <Input id="name" placeholder="Reward Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <Textarea id="description" placeholder="Describe the reward" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="value" className="block text-sm font-medium mb-1">Value (£)</label>
                  <Input id="value" type="number" placeholder="0" value={value} onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div>
                  <label htmlFor="points" className="block text-sm font-medium mb-1">Points Required</label>
                  <Input id="points" type="number" placeholder="0" value={pointsRequired} onChange={(e) => setPointsRequired(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reward Image</label>
                <CloudinaryUpload onFileSelect={handleFileSelect} />
                {imagePreviewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Image Preview:</p>
                    <div className="relative h-24 w-24 rounded-full overflow-hidden">
                      <Image src={imagePreviewUrl} alt="Preview" layout="fill" objectFit="cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 py-4">
              <h3 className="text-lg font-semibold mb-4">Review Your Reward</h3>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        {imagePreviewUrl && (
                          <Image
                            src={imagePreviewUrl}
                            alt={name}
                            layout="fill"
                            objectFit="cover"
                          />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Value:</span>
                      <span>£{value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Points:</span>
                      <span>{pointsRequired}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!isStep1Valid}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                {isEditMode ? 'Update Reward' : 'Create Reward'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
