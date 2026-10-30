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
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Reward, RewardFulfilmentInput } from '@/services/business-reward/types';
import { useGetMallCatalog, useGetBusinessMallTemplates } from '@/services/business-reward/hooks';
import { Checkbox } from '@/components/ui/checkbox';
import { useUploadToCloudinary } from '@/services/upload/hook';
import { useGetBusinessProfile } from '@/services/business/hook';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react';
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

const MALL_REWARD_TYPES = ['Voucher', 'gift card', 'coupon'] as const;

const deriveMallRewardType = (
  rewardType?: string,
): 'VOUCHER' | 'GIFT_CARD' | 'COUPON' => {
  if (rewardType === 'gift card') return 'GIFT_CARD';
  if (rewardType === 'coupon') return 'COUPON';
  return 'VOUCHER';
};

const deriveMallFulfilmentKind = (
  mallRewardType: string,
): 'MALL_GIFT_CARD' | 'MALL_VOUCHER' | 'MALL_COUPON' => {
  if (mallRewardType === 'GIFT_CARD') return 'MALL_GIFT_CARD';
  if (mallRewardType === 'COUPON') return 'MALL_COUPON';
  return 'MALL_VOUCHER';
};

/** Read the flattened fulfilment columns from a reward (camelCase or snake_case). */
const getStoredFulfilment = (reward?: Reward | null) => {
  const anyReward = reward as any;
  const config = anyReward?.fulfilmentConfig ?? anyReward?.fulfilment_config ?? null;
  return {
    provider: anyReward?.fulfilmentProvider ?? anyReward?.fulfilment_provider ?? null,
    kind: anyReward?.fulfilmentKind ?? anyReward?.fulfilment_kind ?? null,
    config,
    templateId:
      anyReward?.fulfilmentTemplateId ?? anyReward?.fulfilment_template_id ?? '',
    businessRef:
      anyReward?.fulfilmentBusinessRef ?? anyReward?.fulfilment_business_ref ?? '',
  };
};

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

  // ─── Form state ────────────────────────────────────────────────────────────
  const storedFulfilment = useMemo(() => getStoredFulfilment(reward), [reward]);

  // Step 1: Details
  const [name, setName] = useState(reward?.title || '');
  const [description, setDescription] = useState(reward?.description || '');
  const [pointsRequired, setPointsRequired] = useState<number | string>(reward?.pointsRequired || 0);
  const [stampsRequired, setStampsRequired] = useState<number | string>(reward?.stampsRequired || 0);
  const [rewardType, setRewardType] = useState<string>(
    reward?.reward_type ?? reward?.rewardType ?? 'Voucher',
  );
  const [maxPoints, setMaxPoints] = useState<number | string>(reward?.maxPoints || 0);
  const [mallRewardType, setMallRewardType] = useState<string>(
    reward?.mall_reward_type ??
      reward?.mallRewardType ??
      deriveMallRewardType(reward?.reward_type ?? reward?.rewardType),
  );
  const [mallRewardValue, setMallRewardValue] = useState<number | string>(
    reward?.mall_reward_value ?? reward?.mallRewardValue ?? 0,
  );
  // Mall discount targeting (rewardType === 'MallDiscount')
  const [mallTargetScope, setMallTargetScope] = useState<'SPECIFIC' | 'ALL'>(
    reward?.mall_target_scope ?? reward?.mallTargetScope ?? 'ALL',
  );
  const [mallProductIds, setMallProductIds] = useState<string[]>(
    storedFulfilment.config?.scope?.productIds ??
      reward?.mall_target_product_ids ??
      reward?.mallTargetProductIds ??
      [],
  );
  const [mallServiceIds, setMallServiceIds] = useState<string[]>(
    storedFulfilment.config?.scope?.serviceIds ??
      reward?.mall_target_service_ids ??
      reward?.mallTargetServiceIds ??
      [],
  );
  const [mallDiscountType, setMallDiscountType] = useState<'percentage' | 'fixed'>(
    reward?.mall_discount_type ?? reward?.mallDiscountType ?? 'percentage',
  );
  const [mallDiscountValue, setMallDiscountValue] = useState<number | string>(
    storedFulfilment.config?.value?.discountValue ??
      reward?.mall_discount_value ??
      reward?.mallDiscountValue ??
      0,
  );
  const [mallMaxDiscount, setMallMaxDiscount] = useState<number | string>(
    storedFulfilment.config?.value?.maxDiscount ??
      reward?.mall_max_discount ??
      reward?.mallMaxDiscount ??
      '',
  );
  const [mallMinSpend, setMallMinSpend] = useState<number | string>(
    storedFulfilment.config?.value?.minSpend ??
      reward?.mall_min_spend ??
      reward?.mallMinSpend ??
      '',
  );
  // Ecosystem fulfilment (Mall template + scope)
  const [fulfilmentTemplateId, setFulfilmentTemplateId] = useState<string>(
    storedFulfilment.templateId || '',
  );
  const [fulfilmentScopeMode, setFulfilmentScopeMode] = useState<'ALL' | 'ITEMS'>(
    storedFulfilment.config?.scope?.mode === 'ITEMS' ? 'ITEMS' : 'ALL',
  );
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

  const isMallDiscount = useMemo(() => rewardType === 'MallDiscount', [rewardType]);

  const toggleProduct = (id: string) =>
    setMallProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleService = (id: string) =>
    setMallServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

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
    return (MALL_REWARD_TYPES as readonly string[]).includes(rewardType);
  }, [rewardType]);

  const mallTemplateKind = useMemo<'gift-cards' | 'vouchers' | 'coupons'>(() => {
    if (mallRewardType === 'GIFT_CARD') return 'gift-cards';
    if (mallRewardType === 'COUPON') return 'coupons';
    return 'vouchers';
  }, [mallRewardType]);

  const {
    data: mallCatalog,
    isLoading: isMallCatalogLoading,
    isError: isMallCatalogError,
  } = useGetMallCatalog(isMallDiscount || isVoucherType);

  const { data: mallTemplates, isLoading: isMallTemplatesLoading } =
    useGetBusinessMallTemplates(mallTemplateKind, isVoucherType);

  const isPointsExceedingMax = useMemo(() => {
    const points = Number(pointsRequired);
    const max = Number(maxPoints);
    return points > max && max > 0;
  }, [pointsRequired, maxPoints]);

  const resetForm = () => {
    const stored = getStoredFulfilment(reward);
    const storedScope = stored.config?.scope;
    const storedValue = stored.config?.value;

    setStep(1);
    setName(reward?.title || '');
    setDescription(reward?.description || '');
    setPointsRequired(reward?.pointsRequired ?? 0);
    setStampsRequired(reward?.stampsRequired ?? 0);
    setRewardType(reward?.reward_type ?? reward?.rewardType ?? 'Voucher');
    setMaxPoints(reward?.maxPoints || 0);
    setMallRewardType(
      reward?.mall_reward_type ??
        reward?.mallRewardType ??
        deriveMallRewardType(reward?.reward_type ?? reward?.rewardType),
    );
    setMallRewardValue(reward?.mall_reward_value ?? reward?.mallRewardValue ?? 0);
    setMallTargetScope(
      reward?.mall_target_scope ?? reward?.mallTargetScope ?? 'ALL',
    );
    setMallProductIds(
      storedScope?.productIds ??
        reward?.mall_target_product_ids ??
        reward?.mallTargetProductIds ??
        [],
    );
    setMallServiceIds(
      storedScope?.serviceIds ??
        reward?.mall_target_service_ids ??
        reward?.mallTargetServiceIds ??
        [],
    );
    setMallDiscountType(
      reward?.mall_discount_type ?? reward?.mallDiscountType ?? 'percentage',
    );
    setMallDiscountValue(
      storedValue?.discountValue ??
        reward?.mall_discount_value ??
        reward?.mallDiscountValue ??
        0,
    );
    setMallMaxDiscount(
      storedValue?.maxDiscount ??
        reward?.mall_max_discount ??
        reward?.mallMaxDiscount ??
        '',
    );
    setMallMinSpend(
      storedValue?.minSpend ??
        reward?.mall_min_spend ??
        reward?.mallMinSpend ??
        '',
    );
    setFulfilmentTemplateId(stored.templateId || '');
    setFulfilmentScopeMode(storedScope?.mode === 'ITEMS' ? 'ITEMS' : 'ALL');
    setSelectedFile(null);
    setImagePreviewUrl(reward?.image || null);
    setGalleryFiles([]);
    setGalleryPreviewUrls(reward?.gallery || []);
    setQuantity(reward?.quantity ?? 0);
    setDisabled(reward?.disabled ?? false);
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
      const points = Number(pointsRequired);
      if (!Number.isFinite(points) || points <= 0) {
        newErrors.points = 'Points Required must be greater than 0.';
      } else if (!Number.isInteger(points)) {
        newErrors.points = 'Points Required must be a whole number.';
      }
      if (isPointsExceedingMax) newErrors.points = `Points cannot exceed the maximum of ${maxPoints} points.`;
    }

    if (isStampsEnabled) {
      const stamps = Number(stampsRequired);
      if (!Number.isFinite(stamps) || stamps <= 0) {
        newErrors.stamps = 'Stamps Required must be greater than 0.';
      } else if (!Number.isInteger(stamps)) {
        newErrors.stamps = 'Stamps Required must be a whole number.';
      }
    }

    if (!isPointsEnabled && !isStampsEnabled) {
      newErrors.redemptionType = 'At least one redemption method (Points or Stamps) must be enabled.';
    }

    if (quantity !== '' && (!Number.isFinite(Number(quantity)) || Number(quantity) < 0)) {
      newErrors.quantity = 'Quantity must be 0 or greater (0 means unlimited).';
    } else if (quantity !== '' && !Number.isInteger(Number(quantity))) {
      newErrors.quantity = 'Quantity must be a whole number.';
    }

    if (isVoucherType) {
      const value = Number(mallRewardValue);
      if (!Number.isFinite(value) || value <= 0) {
        newErrors.mallRewardValue = 'Reward Value is required for Vouchers, Gift Cards, and Coupons.';
      }
    }

    if (isMallDiscount) {
      const discountValue = Number(mallDiscountValue);
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        newErrors.mallDiscountValue = 'Discount value must be greater than 0.';
      } else if (mallDiscountType === 'percentage' && discountValue > 100) {
        newErrors.mallDiscountValue = 'Percentage discount cannot exceed 100%.';
      }

      if (
        mallMaxDiscount !== '' &&
        (!Number.isFinite(Number(mallMaxDiscount)) || Number(mallMaxDiscount) < 0)
      ) {
        newErrors.mallMaxDiscount = 'Max discount must be 0 or greater.';
      }

      if (
        mallMinSpend !== '' &&
        (!Number.isFinite(Number(mallMinSpend)) || Number(mallMinSpend) < 0)
      ) {
        newErrors.mallMinSpend = 'Minimum spend must be 0 or greater.';
      }

      if (
        mallTargetScope === 'SPECIFIC' &&
        mallProductIds.length === 0 &&
        mallServiceIds.length === 0
      ) {
        newErrors.mallTargets = 'Select at least one product or service.';
      }
    }

    if (
      isVoucherType &&
      fulfilmentScopeMode === 'ITEMS' &&
      mallProductIds.length === 0 &&
      mallServiceIds.length === 0
    ) {
      newErrors.fulfilmentScope =
        'Select at least one product or service for this reward.';
    }

    if (!readonlyImage && !isEditMode && !selectedFile && !imagePreviewUrl) newErrors.image = 'Image is required.';

    setErrors(newErrors);
  }, [name, description, pointsRequired, stampsRequired, quantity, maxPoints, selectedFile, imagePreviewUrl, isEditMode, isPointsExceedingMax, isPointsEnabled, isStampsEnabled, isVoucherType, mallRewardValue, readonlyImage, isMallDiscount, mallDiscountType, mallDiscountValue, mallMaxDiscount, mallMinSpend, mallTargetScope, mallProductIds, mallServiceIds, fulfilmentScopeMode]);

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
        setTouched({
          name: true,
          description: true,
          points: true,
          stamps: true,
          image: true,
          quantity: true,
          mallRewardValue: true,
          mallDiscountValue: true,
          mallMaxDiscount: true,
          mallMinSpend: true,
          mallTargets: true,
          fulfilmentScope: true,
        });

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
    // Re-validate before saving: the review step must never submit stale or
    // incomplete values.
    if (!isStep1Valid) {
      setShowAllErrors(true);
      setStep(1);
      setTimeout(() => {
        scrollToFirstError();
      }, 100);
      toast.error('Please fix the highlighted fields before saving');
      return;
    }
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

      const numericQuantity = Number(quantity);
      const finalQuantity =
        quantity === '' || !Number.isFinite(numericQuantity) || numericQuantity < 0
          ? 0
          : Math.trunc(numericQuantity);

      const scopeMode: 'ALL' | 'ITEMS' =
        isMallDiscount
          ? mallTargetScope === 'SPECIFIC'
            ? 'ITEMS'
            : 'ALL'
          : fulfilmentScopeMode;

      const scopedProductIds = scopeMode === 'ITEMS' ? mallProductIds : [];
      const scopedServiceIds = scopeMode === 'ITEMS' ? mallServiceIds : [];

      const fulfilment: RewardFulfilmentInput | undefined = isMallDiscount
        ? {
            provider: 'MALL',
            kind: 'MALL_DISCOUNT',
            delivery: 'CHECKOUT_APPLY',
            businessId: mallCatalog?.business?.id ?? storedFulfilment.businessRef ?? null,
            businessName: mallCatalog?.business?.name ?? storedFulfilment.config?.businessName ?? null,
            scope: {
              mode: scopeMode,
              ...(scopeMode === 'ITEMS'
                ? { productIds: scopedProductIds, serviceIds: scopedServiceIds }
                : {}),
            },
            value: {
              discountType: mallDiscountType,
              discountValue: Number(mallDiscountValue),
              ...(mallMaxDiscount === '' ? {} : { maxDiscount: Number(mallMaxDiscount) }),
              ...(mallMinSpend === '' ? {} : { minSpend: Number(mallMinSpend) }),
            },
          }
        : isVoucherType
          ? {
              provider: 'MALL',
              kind: deriveMallFulfilmentKind(mallRewardType),
              delivery: 'CODE',
              businessId: mallCatalog?.business?.id ?? storedFulfilment.businessRef ?? null,
              businessName: mallCatalog?.business?.name ?? storedFulfilment.config?.businessName ?? null,
              templateRef: fulfilmentTemplateId
                ? { system: 'MALL', id: fulfilmentTemplateId }
                : undefined,
              value: { amount: Number(mallRewardValue), currency: 'GBP' },
              scope: {
                mode: scopeMode,
                ...(scopeMode === 'ITEMS'
                  ? { productIds: scopedProductIds, serviceIds: scopedServiceIds }
                  : {}),
              },
            }
          : undefined;

      const rewardData: any = {
        title: name,
        description,
        points_required: isPointsEnabled ? Number(pointsRequired) : 0,
        stamps_required: isStampsEnabled ? Number(stampsRequired) : 0,
        image: imageUrl,
        gallery: finalGalleryUrls,
        quantity: finalQuantity,
        is_points_enabled: isPointsEnabled,
        is_stamps_enabled: isStampsEnabled,
        // Canonical field consumed by the API; `rewardType` is kept for
        // backwards compatibility with older callers.
        reward_type: rewardType,
        rewardType,
        disabled,
        is_mall_integrated: isVoucherType
          ? Number(mallRewardValue) > 0
          : isMallDiscount,
        mall_reward_type: isVoucherType
          ? (mallRewardType as 'VOUCHER' | 'GIFT_CARD' | 'COUPON')
          : null,
        mall_reward_value: isVoucherType ? Number(mallRewardValue) : 0,
        // Keep the legacy targeting columns in sync with the fulfilment scope
        // so both the mall-discount issuance path and admin reporting agree.
        mall_target_scope:
          scopeMode === 'ITEMS' ? 'SPECIFIC' : 'ALL',
        mall_target_product_ids: scopedProductIds,
        mall_target_service_ids: scopedServiceIds,
        mall_discount_type: isMallDiscount ? mallDiscountType : undefined,
        mall_discount_value: isMallDiscount ? Number(mallDiscountValue) : undefined,
        mall_max_discount:
          isMallDiscount && mallMaxDiscount !== ''
            ? Number(mallMaxDiscount)
            : undefined,
        mall_min_spend:
          isMallDiscount && mallMinSpend !== ''
            ? Number(mallMinSpend)
            : undefined,
        stamp_emoji: finalStampEmoji,
        emoji: customEmoji,
        fulfilment,
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
                      <SelectItem value="MallDiscount">Mall Discount</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Select the category of your reward.</p>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium mb-1">Total Quantity</label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0 = unlimited"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className={shouldShowError('quantity') ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">Units available (0 for unlimited).</p>
                  {shouldShowError('quantity') && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.quantity}
                    </p>
                  )}
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

              {/* Ecosystem fulfilment: Mall template + scope */}
              {isVoucherType && (
                <div className="space-y-4 rounded-lg border bg-gray-50/60 p-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mall template (optional)
                    </label>
                    <Select
                      value={fulfilmentTemplateId || 'none'}
                      onValueChange={(val) =>
                        setFulfilmentTemplateId(val === 'none' ? '' : val)
                      }
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue
                          placeholder={
                            isMallTemplatesLoading
                              ? 'Loading templates…'
                              : 'Default Mall template'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          Default (no template)
                        </SelectItem>
                        {(mallTemplates?.templates ?? []).map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name ||
                              template.title ||
                              `Template ${template.id.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-gray-500">
                      Choose a gift card, voucher, or coupon template from your
                      MCOM Mall catalogue.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Where can this reward be used?
                    </label>
                    <Select
                      value={fulfilmentScopeMode}
                      onValueChange={(val: any) =>
                        setFulfilmentScopeMode(val)
                      }
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">
                          All of my products and services
                        </SelectItem>
                        <SelectItem value="ITEMS">
                          Only selected products/services
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {fulfilmentScopeMode === 'ITEMS' && (
                    <div className="space-y-3">
                      {isMallCatalogLoading && (
                        <p className="text-xs text-gray-500">
                          Loading Mall catalogue…
                        </p>
                      )}
                      {mallCatalog?.products?.length ? (
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                            Products
                          </p>
                          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                            {mallCatalog.products.map((product) => (
                              <label
                                key={product.id}
                                className="flex items-center gap-2 rounded p-1.5 text-sm hover:bg-white/60"
                              >
                                <Checkbox
                                  checked={mallProductIds.includes(product.id)}
                                  onCheckedChange={() =>
                                    toggleProduct(product.id)
                                  }
                                />
                                <span className="flex-1">{product.title}</span>
                                <span className="text-xs text-gray-500">
                                  £
                                  {Number(
                                    product.salePrice ?? product.price,
                                  ).toFixed(2)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {mallCatalog?.services?.length ? (
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                            Services
                          </p>
                          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                            {mallCatalog.services.map((service) => (
                              <label
                                key={service.id}
                                className="flex items-center gap-2 rounded p-1.5 text-sm hover:bg-white/60"
                              >
                                <Checkbox
                                  checked={mallServiceIds.includes(service.id)}
                                  onCheckedChange={() =>
                                    toggleService(service.id)
                                  }
                                />
                                <span className="flex-1">{service.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {mallCatalog &&
                        mallCatalog.products.length === 0 &&
                        mallCatalog.services.length === 0 && (
                          <p className="text-xs text-gray-500">
                            No products or services found.
                          </p>
                        )}
                      {mallProductIds.length === 0 &&
                        mallServiceIds.length === 0 && (
                          <p className="text-xs text-red-500">
                            {errors.fulfilmentScope ||
                              'Select at least one product or service.'}
                          </p>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Mall Discount Targeting */}
              {isMallDiscount && (
                <div className="border p-4 rounded-lg space-y-4 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mall Targets</label>
                    <Select value={mallTargetScope} onValueChange={(val: any) => setMallTargetScope(val)}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select targets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Whole business</SelectItem>
                        <SelectItem value="SPECIFIC">Specific products/services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {mallTargetScope === 'SPECIFIC' && (
                    <div className="space-y-4">
                      {isMallCatalogLoading && (
                        <p className="text-xs text-gray-500">Loading mall catalogue…</p>
                      )}
                      {isMallCatalogError && (
                        <p className="text-xs text-red-500">Could not load your mall catalogue.</p>
                      )}
                      {mallCatalog && (
                        <>
                          {mallCatalog.products.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Products</p>
                              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                                {mallCatalog.products.map((p) => (
                                  <label key={p.id} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-white/60">
                                    <Checkbox
                                      checked={mallProductIds.includes(p.id)}
                                      onCheckedChange={() => toggleProduct(p.id)}
                                    />
                                    <span className="flex-1">{p.title}</span>
                                    <span className="text-xs text-gray-500">£{Number(p.salePrice ?? p.price).toFixed(2)}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {mallCatalog.services.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Services</p>
                              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                                {mallCatalog.services.map((s) => (
                                  <label key={s.id} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-white/60">
                                    <Checkbox
                                      checked={mallServiceIds.includes(s.id)}
                                      onCheckedChange={() => toggleService(s.id)}
                                    />
                                    <span className="flex-1">{s.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {s.fixedPrice != null ? `£${Number(s.fixedPrice).toFixed(2)}` : s.basePrice != null ? `from £${Number(s.basePrice).toFixed(2)}` : ''}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {mallCatalog.products.length === 0 && mallCatalog.services.length === 0 && (
                            <p className="text-xs text-gray-500">No products or services found in mall.</p>
                          )}
                        </>
                      )}
                      {shouldShowError('mallTargets') && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.mallTargets}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Discount Type</label>
                      <Select value={mallDiscountType} onValueChange={(val: any) => setMallDiscountType(val)}>
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Value <span className="text-red-500">*</span></label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={mallDiscountValue}
                        onChange={(e) => {
                          setMallDiscountValue(e.target.value);
                          setTouched(prev => ({ ...prev, mallDiscountValue: true }));
                        }}
                        className={shouldShowError('mallDiscountValue') ? 'border-red-500' : ''}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Max Discount (£)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={mallMaxDiscount}
                        onChange={(e) => {
                          setMallMaxDiscount(e.target.value);
                          setTouched(prev => ({ ...prev, mallMaxDiscount: true }));
                        }}
                        className={shouldShowError('mallMaxDiscount') ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Min Spend (£)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={mallMinSpend}
                      onChange={(e) => {
                        setMallMinSpend(e.target.value);
                        setTouched(prev => ({ ...prev, mallMinSpend: true }));
                      }}
                      className={shouldShowError('mallMinSpend') ? 'border-red-500' : ''}
                    />
                  </div>

                  {shouldShowError('mallDiscountValue') && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.mallDiscountValue}
                    </p>
                  )}
                  {shouldShowError('mallMaxDiscount') && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.mallMaxDiscount}
                    </p>
                  )}
                  {shouldShowError('mallMinSpend') && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.mallMinSpend}
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
                              <Image src={profile.profileImage} alt="Business Logo" layout="fill" objectFit="cover" sizes="96px" />
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
                                        <Image src={asset.imageUrl} alt={asset.name} layout="fill" objectFit="cover" sizes="96px" />
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
                          <Image src={imagePreviewUrl} alt="Reward" layout="fill" objectFit="cover" sizes="(max-width: 768px) 100vw, 50vw" />
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
                            <Image src={imagePreviewUrl} alt="Preview" layout="fill" objectFit="cover" sizes="(max-width: 768px) 100vw, 400px" />
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
                              <Image src={url} alt={`Gallery ${index + 1}`} layout="fill" objectFit="cover" sizes="96px" />
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
                              sizes="(max-width: 768px) 100vw, 400px"
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
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Monetary Value:</span>
                          <span className="text-green-600 font-semibold">£{mallRewardValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Mall reward type:</span>
                          <span>{mallRewardType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Mall template:</span>
                          <span>
                            {fulfilmentTemplateId
                              ? mallTemplates?.templates?.find(
                                  (t) => t.id === fulfilmentTemplateId,
                                )?.name ||
                                mallTemplates?.templates?.find(
                                  (t) => t.id === fulfilmentTemplateId,
                                )?.title ||
                                'Selected template'
                              : 'Default Mall template'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Valid for:</span>
                          <span>
                            {fulfilmentScopeMode === 'ITEMS'
                              ? `${mallProductIds.length} product(s), ${mallServiceIds.length} service(s)`
                              : 'All products and services'}
                          </span>
                        </div>
                      </>
                    )}
                    {isMallDiscount && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Discount:</span>
                          <span className="text-green-600 font-semibold">
                            {mallDiscountType === 'percentage'
                              ? `${mallDiscountValue}%`
                              : `£${mallDiscountValue}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Applies to:</span>
                          <span>
                            {mallTargetScope === 'SPECIFIC'
                              ? `${mallProductIds.length} product(s), ${mallServiceIds.length} service(s)`
                              : 'Whole business'}
                          </span>
                        </div>
                      </>
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
