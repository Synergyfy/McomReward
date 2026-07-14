'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Reward } from '@/services/business-reward/types';
import { useUploadToCloudinary } from '@/services/upload/hook';
import { useGetBusinessProfile } from '@/services/business/hook';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Star, Lock } from 'lucide-react';
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
import { ImageCropper } from '@/components/ui/image-cropper';

interface CreateRewardWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward?: Reward | null;
  onSave: (rewardData: Reward) => Promise<void> | void;
  enabledModes?: ('point' | 'stamp')[];
  // Keeping these for potential backward compatibility if any component uses them
  initialIsPointsEnabled?: boolean;
  initialIsStampsEnabled?: boolean;
  readonlyImage?: boolean;
}

export default function CreateRewardWizardModal({
  isOpen,
  onClose,
  reward,
  onSave,
  enabledModes,
  initialIsPointsEnabled,
  initialIsStampsEnabled,
  readonlyImage,
}: CreateRewardWizardModalProps) {
  const router = useRouter();
  const { mutateAsync: uploadToCloudinary } = useUploadToCloudinary();
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Derive modes from props (priority to enabledModes if provided)
  const finalEnabledModes = useMemo(() => {
    // If enabledModes is explicitly passed, use it.
    if (enabledModes) return enabledModes;

    // Fallback to initialIs... props for backward compatibility
    const modes: ('point' | 'stamp')[] = [];
    if (initialIsPointsEnabled !== false) modes.push('point'); // Default to true if undefined
    if (initialIsStampsEnabled === true) modes.push('stamp');
    return modes.length > 0 ? modes : ['point']; // Final fallback
  }, [enabledModes, initialIsPointsEnabled, initialIsStampsEnabled]);


  const isPointsEnabled = finalEnabledModes.includes('point');
  const isStampsEnabled = finalEnabledModes.includes('stamp');

  // Refs for scrolling to invalid fields
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const pointsRef = useRef<HTMLInputElement>(null);
  const stampsRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const mallValueRef = useRef<HTMLInputElement>(null);

  // Step 1: Details
  const [name, setName] = useState(reward?.title || '');
  const [description, setDescription] = useState(reward?.description || '');
  const [pointsRequired, setPointsRequired] = useState<number | string>(reward?.pointsRequired || 0);
  const [stampsRequired, setStampsRequired] = useState<number | string>(reward?.stampsRequired || 0);
  const [rewardType, setRewardType] = useState<string>(reward?.rewardType || 'Voucher');
  const [maxPoints, setMaxPoints] = useState<number | string>(reward?.maxPoints || 0);
  const [isMallIntegrated, setIsMallIntegrated] = useState<boolean>(reward?.is_mall_integrated ?? true); // Default ON
  const [mallRewardType, setMallRewardType] = useState<string>(reward?.mall_reward_type || 'VOUCHER');
  const [mallRewardValue, setMallRewardValue] = useState<number | string>(reward?.mall_reward_value || 0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(reward?.image || null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>(reward?.gallery || []);
  const [quantity, setQuantity] = useState<number | string>(reward?.quantity || 0);
  const [disabled, setDisabled] = useState<boolean>(reward?.disabled || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Stamp Icon Customization
  const [imageSourceType, setImageSourceType] = useState<'BUSINESS_LOGO' | 'LIBRARY_ASSET' | 'EMOJI' | 'CUSTOM_URL'>(reward?.image_source_type || 'EMOJI');
  const [stampEmoji, setStampEmoji] = useState(reward?.stamp_emoji || '☕');
  const [customEmoji, setCustomEmoji] = useState(reward?.emoji || '🚀');
  const [selectedStampFile, setSelectedStampFile] = useState<File | null>(null);
  const [stampImagePreviewUrl, setStampImagePreviewUrl] = useState<string | null>(null);
  const [mcomAssetType, setMcomAssetType] = useState<'sector' | 'category'>('sector');

  const { data: profile } = useGetBusinessProfile();

  const businessEmojis = ['☕', '🍔', '💰', '📦', '🚜', '🍕', '🛍️', '🎁', '🚀', '⭐'];

  // Track which fields have been touched/attempted
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Gallery Cropping State
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<File[]>([]);
  const [currentGalleryCropIndex, setCurrentGalleryCropIndex] = useState(-1);
  const [galleryCropImage, setGalleryCropImage] = useState<string | null>(null);

  const isEditMode = useMemo(() => !!reward, [reward]);

  // Logic from Dev: Identify types that require monetary value
  const isVoucherType = useMemo(() => {
    return ['Voucher', 'gift card', 'coupon'].includes(rewardType);
  }, [rewardType]);

  const isPointsExceedingMax = useMemo(() => {
    const points = Number(pointsRequired);
    const max = Number(maxPoints);
    return points > max && max > 0;
  }, [pointsRequired, maxPoints]);

  // Determine if Mall Category should be locked based on Reward Type
  const isMallCategoryLocked = useMemo(() => {
    return !['Voucher', 'gift card', 'coupon'].includes(rewardType);
  }, [rewardType]);

  const resetForm = () => {
    setStep(1);
    setName(reward?.title || '');
    setDescription(reward?.description || '');
    setPointsRequired(reward?.pointsRequired || 0);
    setStampsRequired(reward?.stampsRequired || 0);
    setRewardType(reward?.rewardType || 'Voucher');
    setMaxPoints(reward?.maxPoints || 0);
    setIsMallIntegrated(reward?.is_mall_integrated ?? true); // Default ON
    setMallRewardType(reward?.mall_reward_type || 'VOUCHER');
    setMallRewardValue(reward?.mall_reward_value || 0);
    setSelectedFile(null);
    setImagePreviewUrl(reward?.image || null);
    setGalleryFiles([]);
    setGalleryPreviewUrls(reward?.gallery || []);
    setQuantity(reward?.quantity || 0);
    setErrors({});
    setTouched({});
    setShowAllErrors(false);
    setIsSubmitting(false);
    setShowConfirmation(false);
    setImageSourceType(reward?.image_source_type || 'EMOJI');
    setStampEmoji(reward?.stamp_emoji || '☕');
    setCustomEmoji(reward?.emoji || '🚀');
    setSelectedStampFile(null);
    setStampImagePreviewUrl(reward?.image_source_type === 'BUSINESS_LOGO' ? reward?.stamp_emoji || null : null);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, reward]);

  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
    setTouched(prev => ({ ...prev, image: true }));
  };

  const handleStampImageSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedStampFile(file);
    setStampImagePreviewUrl(previewUrl);
    setTouched(prev => ({ ...prev, stampImage: true }));
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

      setPendingGalleryFiles(validFiles);
      if (validFiles.length > 0) {
        setCurrentGalleryCropIndex(0);
        setGalleryCropImage(URL.createObjectURL(validFiles[0]));
      }
      e.target.value = '';
    }
  };

  const handleGalleryCropComplete = async (croppedBlob: Blob) => {
    const currentFile = pendingGalleryFiles[currentGalleryCropIndex];
    const croppedFile = new File([croppedBlob], currentFile.name, { type: 'image/jpeg' });
    const url = URL.createObjectURL(croppedBlob);

    setGalleryFiles(prev => [...prev, croppedFile]);
    setGalleryPreviewUrls(prev => [...prev, url]);

    if (currentGalleryCropIndex < pendingGalleryFiles.length - 1) {
      const nextIndex = currentGalleryCropIndex + 1;
      setCurrentGalleryCropIndex(nextIndex);
      setGalleryCropImage(URL.createObjectURL(pendingGalleryFiles[nextIndex]));
    } else {
      setPendingGalleryFiles([]);
      setCurrentGalleryCropIndex(-1);
      setGalleryCropImage(null);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTouched(prev => ({ ...prev, points: true }));

    if (inputValue === '') {
      setPointsRequired('');
      return;
    }

    const numValue = Number(inputValue);
    if (!isNaN(numValue) && numValue >= 0) {
      setPointsRequired(inputValue);
    }
  };

  const handleStampsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTouched(prev => ({ ...prev, stamps: true }));

    if (inputValue === '') {
      setStampsRequired('');
      return;
    }

    const numValue = Number(inputValue);
    if (!isNaN(numValue) && numValue >= 0) {
      setStampsRequired(inputValue);
    }
  };

  // Compute errors (Integrated logic from HEAD and Dev)
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';

    if (isPointsEnabled) {
      if (Number(pointsRequired) <= 0) newErrors.points = 'Points Required must be greater than 0.';
      if (isPointsExceedingMax) newErrors.points = `Points cannot exceed the maximum of ${maxPoints} points.`;
    }

    if (isStampsEnabled) {
      if (Number(stampsRequired) <= 0) newErrors.stamps = 'Stamps Required must be greater than 0.';
    }

    if (!isPointsEnabled && !isStampsEnabled) {
      newErrors.redemptionType = 'At least one redemption method (Points or Stamps) must be enabled.';
    }

    if (isVoucherType && (Number(mallRewardValue) <= 0)) {
      newErrors.mallRewardValue = 'Reward Value is required for Vouchers, Gift Cards, and Coupons.';
    }

    if (!readonlyImage && !isEditMode && !selectedFile && !imagePreviewUrl) newErrors.image = 'Image is required.';

    setErrors(newErrors);
  }, [name, description, pointsRequired, stampsRequired, maxPoints, selectedFile, imagePreviewUrl, isEditMode, isPointsExceedingMax, isPointsEnabled, isStampsEnabled, isVoucherType, mallRewardValue, readonlyImage]);

  const isStep1Valid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // Scroll to first error and highlight
  const scrollToFirstError = () => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return null;

    const firstError = errorKeys[0];
    let ref: React.RefObject<any> | null = null;

    switch (firstError) {
      case 'name':
        ref = nameRef;
        break;
      case 'description':
        ref = descriptionRef;
        break;
      case 'points':
        ref = pointsRef;
        break;
      case 'stamps':
        ref = stampsRef;
        break;
      case 'image':
        ref = imageRef;
        break;
      case 'mallRewardValue':
        ref = mallValueRef;
        break;
    }

    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ref.current.focus?.();
    }

    return firstError;
  };

  const handleNext = () => {
    if (step === 1) {
      if (isStep1Valid) {
        setStep(2);
        setShowAllErrors(false);
      } else {
        // Show all errors and scroll to first one
        setShowAllErrors(true);
        setTouched({ name: true, description: true, points: true, stamps: true, image: true, mallRewardValue: true });

        // Small delay to allow state update before scrolling
        setTimeout(() => {
          scrollToFirstError();
        }, 100);

        toast.error('Please fill in all required fields', {
          description: 'Some fields need your attention before continuing.',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
      }
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

      let finalStampEmoji = stampEmoji;
      if (imageSourceType === 'BUSINESS_LOGO') {
        finalStampEmoji = profile?.profileImage || '';
      } else if (imageSourceType === 'LIBRARY_ASSET') {
        const asset = mcomAssetType === 'sector' ? profile?.sector : profile?.category;
        finalStampEmoji = asset?.imageUrl || '';
      } else if (imageSourceType === 'EMOJI') {
        finalStampEmoji = customEmoji;
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

      const finalGalleryUrls = [
        ...galleryPreviewUrls.filter(url => !url.startsWith('blob:')),
        ...uploadedGalleryUrls
      ];

      const rewardData: any = {
        title: name,
        description,
        points_required: isPointsEnabled ? Number(pointsRequired) : 0,
        stamps_required: isStampsEnabled ? Number(stampsRequired) : 0,
        image: imageUrl,
        gallery: finalGalleryUrls,
        quantity: Number(quantity),
        is_points_enabled: isPointsEnabled,
        is_stamps_enabled: isStampsEnabled,
        rewardType,
        disabled,
        is_mall_integrated: isMallIntegrated,
        mall_reward_type: mallRewardType as 'VOUCHER' | 'GIFT_CARD' | 'COUPON',
        mall_reward_value: Number(mallRewardValue),
        stamp_emoji: finalStampEmoji,
        status: 'active',
        expiry_datetime: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Default to 1 year from now
      };

      if (reward?.id) {
        rewardData.id = reward.id;
      }

      await onSave(rewardData as Reward);
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error("Error creating/updating reward:", error);
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = (step / totalSteps) * 100;

  // Helper to determine if field should show error
  const shouldShowError = (field: string) => {
    return (touched[field] || showAllErrors) && errors[field];
  };

  // Validation status indicator
  const ValidationIndicator = ({ field }: { field: string }) => {
    if (!touched[field] && !showAllErrors) return null;

    if (errors[field]) {
      return <AlertCircle className="h-4 w-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Reward' : 'Create New Reward'}</DialogTitle>
            <Progress value={progressValue} className="mt-2" />

            {/* Progress indicator with validation status */}
            <div className="flex items-center gap-2 mt-3">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${step === 1
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : isStep1Valid
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                {step > 1 && isStep1Valid && <CheckCircle2 className="h-3 w-3" />}
                1. Details
              </div>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${step === 2
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                2. Review
              </div>
            </div>
          </DialogHeader>

          {step === 1 && (
            <div className="grid gap-4 py-4">
              {/* Quantity and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rewardType" className="block text-sm font-medium mb-1">Reward Type</label>
                  <Select
                    value={rewardType}
                    onValueChange={(val) => {
                      setRewardType(val);
                      if (val === 'Voucher') setMallRewardType('VOUCHER');
                      if (val === 'gift card') setMallRewardType('GIFT_CARD');
                      if (val === 'coupon') setMallRewardType('COUPON');
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Voucher">Voucher</SelectItem>
                      <SelectItem value="gift card">Gift Card</SelectItem>
                      <SelectItem value="coupon">Coupon</SelectItem>
                      <SelectItem value="point offer">Point Offer</SelectItem>
                      <SelectItem value="physical product">Physical Product</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Select the category of your reward.</p>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium mb-1">Total Quantity</label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0 = unlimited"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Units available (0 for unlimited).</p>
                </div>
              </div>

              {/* Reward Value for Vouchers/Coupons (From Dev) */}
              {isVoucherType && (
                <div>
                  <label htmlFor="mallRewardValue" className="block text-sm font-medium mb-1">
                    Reward Value (£) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      ref={mallValueRef}
                      id="mallRewardValue"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={mallRewardValue}
                      onChange={(e) => {
                        setMallRewardValue(e.target.value);
                        setTouched(prev => ({ ...prev, mallRewardValue: true }));
                      }}
                      className={`pr-10 ${shouldShowError('mallRewardValue') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50' : ''}`}
                    />
                    <ValidationIndicator field="mallRewardValue" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">The monetary value of the {rewardType} (Required).</p>
                  {shouldShowError('mallRewardValue') && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.mallRewardValue}
                    </p>
                  )}
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    ref={nameRef}
                    id="name"
                    placeholder="Reward Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setTouched(prev => ({ ...prev, name: true }));
                    }}
                    className={`pr-10 ${shouldShowError('name') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50' : ''}`}
                  />
                  <ValidationIndicator field="name" />
                </div>
                <p className="text-xs text-gray-500 mt-1">The name of the reward as it will appear to customers.</p>
                {shouldShowError('name') && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Textarea
                    ref={descriptionRef}
                    id="description"
                    placeholder="Describe the reward"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setTouched(prev => ({ ...prev, description: true }));
                    }}
                    className={shouldShowError('description') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50' : ''}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">A brief explanation of what the reward entails.</p>
                {shouldShowError('description') && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Points/Stamps Fields */}
              <div className="grid grid-cols-1 gap-4">
                {isPointsEnabled && isStampsEnabled ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="points" className="block text-sm font-medium mb-1">
                        Points Required <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          ref={pointsRef}
                          id="points"
                          type="number"
                          placeholder="e.g. 100"
                          min="1"
                          max={Number(maxPoints) > 0 ? Number(maxPoints) : undefined}
                          value={pointsRequired}
                          onChange={handlePointsChange}
                          className={`pr-10 ${shouldShowError('points') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50' : ''}`}
                        />
                        <ValidationIndicator field="points" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Points needed to redeem.</p>
                      {shouldShowError('points') && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.points}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="stamps" className="block text-sm font-medium mb-1">
                        Stamps Required <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          ref={stampsRef}
                          id="stamps"
                          type="number"
                          placeholder="e.g. 10"
                          min="1"
                          value={stampsRequired}
                          onChange={handleStampsChange}
                          className={`pr-10 ${shouldShowError('stamps') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50' : ''}`}
                        />
                        <ValidationIndicator field="stamps" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Stamps needed to redeem.</p>
                      {shouldShowError('stamps') && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.stamps}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {isPointsEnabled && (
                      <div>
                        <label htmlFor="points" className="block text-sm font-medium mb-1">
                          Points Required <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            ref={pointsRef}
                            id="points"
                            type="number"
                            placeholder="e.g. 100"
                            min="1"
                            max={Number(maxPoints) > 0 ? Number(maxPoints) : undefined}
                            value={pointsRequired}
                            onChange={handlePointsChange}
                            className={`pr-10 ${shouldShowError('points') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50' : ''}`}
                          />
                          <ValidationIndicator field="points" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">The amount of points required to redeem this reward.</p>
                        {shouldShowError('points') && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.points}
                          </p>
                        )}
                      </div>
                    )}
                    {isStampsEnabled && (
                      <div>
                        <label htmlFor="stamps" className="block text-sm font-medium mb-1">
                          Stamps Required <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            ref={stampsRef}
                            id="stamps"
                            type="number"
                            placeholder="e.g. 10"
                            min="1"
                            value={stampsRequired}
                            onChange={handleStampsChange}
                            className={`pr-10 ${shouldShowError('stamps') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50' : ''}`}
                          />
                          <ValidationIndicator field="stamps" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">The number of stamps required to redeem this reward.</p>
                        {shouldShowError('stamps') && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.stamps}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
                {!isPointsEnabled && !isStampsEnabled && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center font-medium">
                    Please enable at least one redemption method (Points or Stamps).
                  </div>
                )}
              </div>

              {/* Stamp Customization (Visible only if stamps enabled) */}
              {isStampsEnabled && (
                <div className="p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-900/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 text-blue-500" />
                      Stamp Customization
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Stamp Icon Source</label>
                      <Select value={imageSourceType} onValueChange={(val: any) => setImageSourceType(val)}>
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select stamp source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BUSINESS_LOGO">Business Logo</SelectItem>
                          <SelectItem value="EMOJI">Emoji Stickers</SelectItem>
                          <SelectItem value="LIBRARY_ASSET">Mcom Assets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Source: BUSINESS_LOGO */}
                    {imageSourceType === 'BUSINESS_LOGO' && (
                      <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-dashed">
                        {profile?.profileImage ? (
                          <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-4 ring-blue-50 shadow-lg">
                            {(profile.profileImage.startsWith('http') || profile.profileImage.startsWith('/')) ? (
                              <Image src={profile.profileImage} alt="Business Logo" layout="fill" objectFit="cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-50">
                                {profile.profileImage}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-20 w-20 rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-dashed">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm font-medium">Auto-fetching logo...</p>
                          <p className="text-xs text-gray-500">Your profile logo will be used as the stamp icon.</p>
                        </div>
                      </div>
                    )}

                    {/* Source: EMOJI */}
                    {imageSourceType === 'EMOJI' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Select a Sticker</label>
                        <div className="grid grid-cols-5 gap-2">
                          {businessEmojis.map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => setCustomEmoji(e)}
                              className={`h-12 flex items-center justify-center text-2xl rounded-xl transition-all ${customEmoji === e
                                ? 'bg-blue-500 text-white scale-110 shadow-md ring-4 ring-blue-100'
                                : 'bg-white hover:bg-gray-50 border shadow-sm'
                                }`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Source: LIBRARY_ASSET (Mcom Assets) */}
                    {imageSourceType === 'LIBRARY_ASSET' && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={mcomAssetType === 'sector' ? 'default' : 'outline'}
                            className="flex-1 h-9"
                            onClick={() => setMcomAssetType('sector')}
                          >
                            Sector Asset
                          </Button>
                          <Button
                            type="button"
                            variant={mcomAssetType === 'category' ? 'default' : 'outline'}
                            className="flex-1 h-9"
                            onClick={() => setMcomAssetType('category')}
                          >
                            Category Asset
                          </Button>
                        </div>

                        {/* Mcom Asset Preview */}
                        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border">
                          {(() => {
                            const asset = mcomAssetType === 'sector' ? profile?.sector : profile?.category;

                            return (
                              <>
                                <div className="group relative">
                                  {asset?.imageUrl ? (
                                    <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-4 ring-orange-50 shadow-lg">
                                      {(asset.imageUrl.startsWith('http') || asset.imageUrl.startsWith('/')) ? (
                                        <Image src={asset.imageUrl} alt={asset.name} layout="fill" objectFit="cover" />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-50">
                                          {asset.imageUrl}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="h-20 w-20 rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-dashed">
                                      <CheckCircle2 className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                                    {asset?.name || 'Not Available'}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium capitalize">{mcomAssetType} Icon</p>
                                  <p className="text-xs text-gray-500">Previewing your business {mcomAssetType} asset.</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mall Integration - Default ON */}
              <div className="border p-4 rounded-lg space-y-4 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      Mall Integration
                      <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                        Recommended
                      </Badge>
                    </label>
                    <p className="text-xs text-gray-500">Integrate this reward with the Mcom Mall platform for wider reach.</p>
                  </div>
                  <Switch
                    checked={isMallIntegrated}
                    onCheckedChange={setIsMallIntegrated}
                  />
                </div>

                {isMallIntegrated && (
                  <div className={`pt-2 border-t border-orange-200/50 relative ${isMallCategoryLocked ? 'opacity-60' : ''}`}>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      Mall Category Type
                      {isMallCategoryLocked && <Lock className="h-3 w-3 text-gray-500" />}
                    </label>
                    <Select
                      value={mallRewardType}
                      onValueChange={(val) => {
                        setMallRewardType(val);
                        // Also sync reward type if not locked
                        if (!isMallCategoryLocked) {
                          if (val === 'VOUCHER') setRewardType('Voucher');
                          if (val === 'GIFT_CARD') setRewardType('gift card');
                          if (val === 'COUPON') setRewardType('coupon');
                        }
                      }}
                      disabled={isMallCategoryLocked}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select mall type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VOUCHER">Voucher</SelectItem>
                        <SelectItem value="GIFT_CARD">Gift Card</SelectItem>
                        <SelectItem value="COUPON">Coupon</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {isMallCategoryLocked
                        ? "Not applicable for this reward type."
                        : "Specify how this reward should be categorized within the mall platform."}
                    </p>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div ref={imageRef}>
                <label className="block text-sm font-medium mb-2">
                  Reward Image {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                {readonlyImage && imagePreviewUrl ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-gray-200">
                        {(imagePreviewUrl.startsWith('http') || imagePreviewUrl.startsWith('/') || imagePreviewUrl.startsWith('blob:') || imagePreviewUrl.startsWith('data:')) ? (
                          <Image src={imagePreviewUrl} alt="Reward" layout="fill" objectFit="cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-50">
                            {imagePreviewUrl}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Image set by template. Not editable during setup.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`rounded-lg ${shouldShowError('image') ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
                      <CloudinaryUpload onFileSelect={handleFileSelect} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">An image representing the reward.</p>
                    {shouldShowError('image') && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.image}
                      </p>
                    )}
                    {imagePreviewUrl && (
                      <div className="mt-4 flex items-center gap-3">
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-green-200">
                          {(imagePreviewUrl.startsWith('http') || imagePreviewUrl.startsWith('/') || imagePreviewUrl.startsWith('blob:') || imagePreviewUrl.startsWith('data:')) ? (
                            <Image src={imagePreviewUrl} alt="Preview" layout="fill" objectFit="cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-50">
                              {imagePreviewUrl}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Image uploaded
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!readonlyImage && (
                <>
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
                </>
              )}

              {/* Validation Summary */}
              {showAllErrors && Object.keys(errors).length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
                    <AlertCircle className="h-5 w-5" />
                    Please fix the following errors:
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 space-y-1">
                    {Object.values(errors).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">All details look good! Review and confirm.</span>
              </div>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        {imagePreviewUrl && (
                          (imagePreviewUrl.startsWith('http') || imagePreviewUrl.startsWith('/') || imagePreviewUrl.startsWith('blob:') || imagePreviewUrl.startsWith('data:')) ? (
                            <Image
                              src={imagePreviewUrl}
                              alt={name}
                              layout="fill"
                              objectFit="cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                              {imagePreviewUrl}
                            </div>
                          )
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <Badge variant="default" className="bg-green-500">Ready to Create</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{description}</p>
                  <div className="space-y-2 text-sm">
                    {isPointsEnabled && (
                      <div className="flex justify-between">
                        <span className="font-medium">Points Required:</span>
                        <span className="text-blue-600 font-semibold">{pointsRequired}</span>
                      </div>
                    )}
                    {isStampsEnabled && (
                      <div className="flex justify-between">
                        <span className="font-medium">Stamps Required:</span>
                        <span className="text-orange-600 font-semibold">{stampsRequired}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Quantity:</span>
                      <span>{quantity || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span>{rewardType}</span>
                    </div>
                    {isVoucherType && (
                      <div className="flex justify-between">
                        <span className="font-medium">Monetary Value:</span>
                        <span className="text-green-600 font-semibold">£{mallRewardValue}</span>
                      </div>
                    )}
                    {isMallIntegrated && (
                      <div className="mt-2 pt-2 border-t border-dashed">
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 mb-2">
                          Mall Integrated
                        </Badge>
                        <div className="flex justify-between">
                          <span className="font-medium">Mall Category:</span>
                          <span>{mallRewardType}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || isSubmitting}>
              Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? 'Creating...' : (isEditMode ? 'Update Reward' : 'Create Reward')}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="z-[1100]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Creation</AlertDialogTitle>
            <AlertDialogDescription>
              {isPointsEnabled && Number(pointsRequired) > 0 ? (
                <>
                  Each customer needs <strong>{pointsRequired}</strong> points to redeem this reward.
                  {Number(quantity) > 0 && (
                    <> You have <strong>{quantity}</strong> units available.</>
                  )}
                </>
              ) : (
                <>
                  Each customer needs <strong>{stampsRequired}</strong> stamps to redeem this reward.
                  {Number(quantity) > 0 && (
                    <> You have <strong>{quantity}</strong> units available.</>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => {
              e.preventDefault();
              handleConfirmSave();
            }} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {galleryCropImage && (
        <ImageCropper
          image={galleryCropImage}
          onCropComplete={handleGalleryCropComplete}
          onCancel={() => {
            // Skip current image
            if (currentGalleryCropIndex < pendingGalleryFiles.length - 1) {
              const nextIndex = currentGalleryCropIndex + 1;
              setCurrentGalleryCropIndex(nextIndex);
              setGalleryCropImage(URL.createObjectURL(pendingGalleryFiles[nextIndex]));
            } else {
              setPendingGalleryFiles([]);
              setCurrentGalleryCropIndex(-1);
              setGalleryCropImage(null);
            }
          }}
          aspect={1}
        />
      )
      }
    </>
  );
}
