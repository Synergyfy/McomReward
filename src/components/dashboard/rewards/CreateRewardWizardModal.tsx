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
import { useUploadToCloudinary } from '@/services/upload/hook';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface CreateRewardWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward?: Reward | null;
  onSave: (rewardData: Reward) => Promise<void> | void;
}

export default function CreateRewardWizardModal({ isOpen, onClose, reward, onSave }: CreateRewardWizardModalProps) {
  const router = useRouter();
  const { mutateAsync: uploadToCloudinary } = useUploadToCloudinary();
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Step 1: Details
  const [name, setName] = useState(reward?.title || '');
  const [description, setDescription] = useState(reward?.description || '');
  // const [value, setValue] = useState<number | string>(reward?.value || 0); // Removed Value
  const [pointsRequired, setPointsRequired] = useState<number | string>(reward?.pointsRequired || 0);
  const [maxPoints, setMaxPoints] = useState<number | string>(reward?.maxPoints || 0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(reward?.image || null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>(reward?.gallery || []);
  const [quantity, setQuantity] = useState<number | string>(reward?.quantity || 0);
  const [disabled, setDisabled] = useState<boolean>(reward?.disabled || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = useMemo(() => !!reward, [reward]);

  // Validation: Check if pointsRequired exceeds maxPoints
  const isPointsExceedingMax = useMemo(() => {
    const points = Number(pointsRequired);
    const max = Number(maxPoints);
    return points > max && max > 0;
  }, [pointsRequired, maxPoints]);

  const resetForm = () => {
    setStep(1);
    setName(reward?.title || '');
    setDescription(reward?.description || '');
    // setValue(reward?.value || 0);
    setPointsRequired(reward?.pointsRequired || 0);
    setMaxPoints(reward?.maxPoints || 0);
    setSelectedFile(null);
    setImagePreviewUrl(reward?.image || null);
    setGalleryFiles([]);
    setGalleryPreviewUrls(reward?.gallery || []);
    setQuantity(reward?.quantity || 0);
    setErrors({});
    setIsSubmitting(false);
    setShowConfirmation(false);
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

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + galleryFiles.length > 3) {
        toast.error("You can only upload up to 3 gallery images.");
        return;
      }
      const validFiles = files.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max size is 5MB.`);
          return false;
        }
        return true;
      });

      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setGalleryFiles(prev => [...prev, ...validFiles]);
      setGalleryPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviewUrls(prev => prev.filter((_, i) => i !== index));
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
      setPointsRequired(inputValue);
    }
  };

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    // if (Number(value) <= 0) newErrors.value = 'Value must be greater than 0.';
    if (Number(pointsRequired) <= 0) newErrors.pointsOrBadge = 'Points Required is required.';
    if (isPointsExceedingMax) newErrors.pointsExceedingMax = 'Points Required cannot exceed Max Points.';
    if (!isEditMode && !selectedFile) newErrors.image = 'Image is required.';
    setErrors(newErrors);
  }, [name, description, pointsRequired, maxPoints, selectedFile, isEditMode, isPointsExceedingMax]); // Removed value dependency

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
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    let imageUrl = imagePreviewUrl || '';
    const uploadedGalleryUrls: string[] = [];

    try {
      if (selectedFile) {
        const uploadResult = await uploadToCloudinary({ file: selectedFile, folder: 'rewards' });
        imageUrl = uploadResult.secure_url;
      }

      // Upload gallery images
      for (const file of galleryFiles) {
        try {
          const uploadResult = await uploadToCloudinary({ file, folder: 'rewards/' });
          uploadedGalleryUrls.push(uploadResult.secure_url);
        } catch (error) {
          console.error(`Failed to upload gallery image: ${file.name}`, error);
          toast.error(`Failed to upload gallery image: ${file.name}`);
        }
      }

      // Combine existing URLs (that are not blobs) with new uploaded URLs
      const finalGalleryUrls = [
        ...galleryPreviewUrls.filter(url => !url.startsWith('blob:')),
        ...uploadedGalleryUrls
      ];

      const rewardData: Reward = {
        id: reward?.id || new Date().toISOString(),
        title: name,
        description,
        value: 0, // Value removed from UI, defaulting to 0
        pointsRequired: Number(pointsRequired),
        maxPoints: Number(maxPoints) > 0 ? Number(maxPoints) : Number(pointsRequired),
        image: imageUrl,
        gallery: finalGalleryUrls,
        quantity: Number(quantity),
        disabled,
        createdAt: reward?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(rewardData);
      // The modal should ONLY close if onSave resolves successfully.
      // If onSave rejects (e.g. error in page.tsx), we catch it here and keep the modal open.
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error("Error creating/updating reward:", error);
      // We don't need to show another toast here if page.tsx already did, 
      // but keeping the specific error handling in page.tsx effectively stops the flow here.
      // If the error was allowed to propagate, we want to stop loading state but keep modal open.
      setShowConfirmation(false); // Close the confirmation dialog
    } finally {
      setIsSubmitting(false);
    }
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
                <p className="text-xs text-gray-500 mt-1">The name of the reward as it will appear to customers.</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <Textarea id="description" placeholder="Describe the reward" value={description} onChange={(e) => setDescription(e.target.value)} />
                <p className="text-xs text-gray-500 mt-1">A brief explanation of what the reward entails.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Removed Value Input */}
                <div>
                  <label htmlFor="points" className="block text-sm font-medium mb-1">Points Required</label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="0"
                    min="0"
                    max={Number(maxPoints) > 0 ? Number(maxPoints) : undefined}
                    value={pointsRequired}
                    onChange={handlePointsChange}
                    className={isPointsExceedingMax ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">The amount of points a customer would earn in a campaign to redeem the reward.</p>
                  {isPointsExceedingMax && (
                    <p className="text-xs text-red-500 mt-1">
                      Points cannot exceed the maximum of {maxPoints} points.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
                <Input id="quantity" type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} />
                <p className="text-xs text-gray-500 mt-1">The total number of units available for this reward.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reward Image</label>
                <CloudinaryUpload onFileSelect={handleFileSelect} />
                <p className="text-xs text-gray-500 mt-1">An image representing the reward.</p>
                {imagePreviewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Image Preview:</p>
                    <div className="relative h-24 w-24 rounded-full overflow-hidden">
                      <Image src={imagePreviewUrl} alt="Preview" layout="fill" objectFit="cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Gallery Images (Optional)</label>
                <p className="text-xs text-gray-500 mb-2">Upload up to 3 additional images (max 5MB each)</p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('gallery-upload-dashboard')?.click()}
                      disabled={galleryPreviewUrls.length >= 3}
                    >
                      Upload Gallery Images
                    </Button>
                    <input
                      id="gallery-upload-dashboard"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGallerySelect}
                      disabled={galleryPreviewUrls.length >= 3}
                    />
                    <span className="text-xs text-gray-500">{galleryPreviewUrls.length}/3 images</span>
                  </div>

                  {galleryPreviewUrls.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-2">
                      {galleryPreviewUrls.map((url, index) => (
                        <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border">
                          <Image src={url} alt={`Gallery ${index + 1}`} layout="fill" objectFit="cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 h-5 w-5 flex items-center justify-center text-xs"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                    {/* Removed Value Display */}
                    <div className="flex justify-between">
                      <span className="font-medium">Points Required:</span>
                      <span>{pointsRequired}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Quantity:</span>
                      <span>{quantity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || isSubmitting}>
              Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!isStep1Valid}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : (isEditMode ? 'Update Reward' : 'Create Reward')}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="z-[1100]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Each customer needs <strong>{pointsRequired}</strong> points to redeem a unit of this reward and you have <strong>{quantity}</strong> units of this reward, so <strong>{Number(pointsRequired) * Number(quantity)}</strong> points total would be spent on this redeeming this reward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => {
              e.preventDefault();
              handleConfirmSave();
            }} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
