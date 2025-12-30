'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    HelpCircle,
    Stamp,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Eye,
    QrCode,
    ShoppingCart,
    MapPin,
    Gift,
    Tag,
    Wand2,
    Star,
    Clock,
    Repeat,
    Info
} from 'lucide-react';
import {
    CreateStampRewardRequest,
    StampRewardResponse,
    StampTriggerMethod,
    RewardBenefitType,
    StampAudience,
    StampRewardStatus,
    HybridSettings,
    ExpirationRules,
    TRIGGER_METHOD_LABELS,
    TRIGGER_METHOD_DESCRIPTIONS,
    BENEFIT_TYPE_LABELS,
    BENEFIT_TYPE_ICONS,
} from '@/services/stamp-rewards/types';
import { useCreateStampReward, useUpdateStampReward } from '@/services/stamp-rewards/hook';
import { useGetSectors } from '@/services/sectors/hook';
import { useGetTiers } from '@/services/tiers/hook';
import toast from 'react-hot-toast';

interface CreateStampRewardWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit' | 'duplicate';
    stampReward?: StampRewardResponse | null;
    onSuccess?: () => void;
}

// Stamp icon options
const stampIconOptions = [
    { value: '⭐', label: 'Star' },
    { value: '❤️', label: 'Heart' },
    { value: '☕', label: 'Coffee' },
    { value: '🍕', label: 'Pizza' },
    { value: '🍔', label: 'Burger' },
    { value: '🎁', label: 'Gift' },
    { value: '💎', label: 'Diamond' },
    { value: '🌟', label: 'Sparkle' },
    { value: '🔥', label: 'Fire' },
    { value: '✅', label: 'Check' },
];

// Predefined stamp count options for quick selection
const stampCountOptions = [4, 5, 6, 8, 10, 12];

// Default values
const defaultHybridSettings: HybridSettings = {
    enabled: false,
    pointsPerStamp: 0,
    completionBonusPoints: 0,
    pointsFallbackEnabled: false,
};

const defaultExpirationRules: ExpirationRules = {
    stampValidityDays: null,
    rewardClaimDays: null,
};

export default function CreateStampRewardWizardModal({
    isOpen,
    onClose,
    mode = 'create',
    stampReward,
    onSuccess,
}: CreateStampRewardWizardModalProps) {
    const { mutate: createStampReward, isPending: isCreating } = useCreateStampReward();
    const { mutate: updateStampReward, isPending: isUpdating } = useUpdateStampReward();
    const { data: sectors = [] } = useGetSectors();
    const { data: tiers = [] } = useGetTiers();

    // Form state
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    // Step 1: Basic Info
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [stampsRequired, setStampsRequired] = useState<number>(5);
    const [customStampCount, setCustomStampCount] = useState<string>('');
    const [useCustomCount, setUseCustomCount] = useState(false);

    // Step 2: Reward Details
    const [rewardBenefitType, setRewardBenefitType] = useState<RewardBenefitType>('free_item');
    const [rewardBenefitValue, setRewardBenefitValue] = useState('');
    const [triggerMethod, setTriggerMethod] = useState<StampTriggerMethod>('qr_scan');
    const [stampIcon, setStampIcon] = useState('⭐');

    // Step 3: Settings & Visibility
    const [audience, setAudience] = useState<StampAudience>('all_businesses');
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
    const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
    const [expirationRules, setExpirationRules] = useState<ExpirationRules>(defaultExpirationRules);
    const [isRepeatable, setIsRepeatable] = useState(true);
    const [hybridSettings, setHybridSettings] = useState<HybridSettings>(defaultHybridSettings);

    // Step 4: Media & Review
    const [status, setStatus] = useState<StampRewardStatus>('draft');
    const [image, setImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [termsAndConditions, setTermsAndConditions] = useState('');

    // UI state
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    // Reset form
    const resetForm = () => {
        setStep(1);
        setTitle('');
        setDescription('');
        setStampsRequired(5);
        setCustomStampCount('');
        setUseCustomCount(false);
        setRewardBenefitType('free_item');
        setRewardBenefitValue('');
        setTriggerMethod('qr_scan');
        setStampIcon('⭐');
        setAudience('all_businesses');
        setSelectedSectors([]);
        setSelectedTiers([]);
        setExpirationRules(defaultExpirationRules);
        setIsRepeatable(true);
        setHybridSettings(defaultHybridSettings);
        setStatus('draft');
        setImage(null);
        setSelectedFile(null);
        setTermsAndConditions('');
    };

    // Load existing data for edit/duplicate
    useEffect(() => {
        if (isOpen) {
            if ((mode === 'edit' || mode === 'duplicate') && stampReward) {
                setTitle(mode === 'duplicate' ? `Copy of ${stampReward.title}` : stampReward.title);
                setDescription(stampReward.description);
                setStampsRequired(stampReward.stampsRequired);
                if (!stampCountOptions.includes(stampReward.stampsRequired)) {
                    setUseCustomCount(true);
                    setCustomStampCount(String(stampReward.stampsRequired));
                }
                setRewardBenefitType(stampReward.rewardBenefitType);
                setRewardBenefitValue(stampReward.rewardBenefitValue);
                setTriggerMethod(stampReward.triggerMethod);
                setStampIcon(stampReward.stampIcon || '⭐');
                setAudience(stampReward.audience);
                setSelectedSectors(stampReward.sectorIds || []);
                setSelectedTiers(stampReward.tierIds || []);
                setExpirationRules(stampReward.expirationRules || defaultExpirationRules);
                setIsRepeatable(stampReward.isRepeatable);
                setHybridSettings(stampReward.hybridSettings || defaultHybridSettings);
                setStatus(mode === 'duplicate' ? 'draft' : stampReward.status);
                setImage(stampReward.image);
                setTermsAndConditions(stampReward.termsAndConditions || '');
            } else {
                resetForm();
            }
        }
    }, [isOpen, mode, stampReward]);

    // Handle file upload
    const handleFileSelect = (file: File | null, previewUrl: string | null) => {
        setSelectedFile(file);
        setImage(previewUrl);
    };

    // Validation
    const step1Valid = useMemo(() => {
        const count = useCustomCount ? Number(customStampCount) : stampsRequired;
        return title.trim().length > 0 &&
            description.trim().length > 0 &&
            count >= 2 && count <= 20;
    }, [title, description, stampsRequired, customStampCount, useCustomCount]);

    const step2Valid = useMemo(() => {
        return rewardBenefitValue.trim().length > 0;
    }, [rewardBenefitValue]);

    const step3Valid = useMemo(() => {
        if (audience === 'specific_sectors' && selectedSectors.length === 0) {
            return false;
        }
        if (hybridSettings.enabled && hybridSettings.pointsPerStamp < 0) {
            return false;
        }
        return true;
    }, [audience, selectedSectors, hybridSettings]);

    const step4Valid = useMemo(() => {
        return !!image;
    }, [image]);

    // Memoized tier filtering - separate standard and seasonal tiers
    const standardTiers = useMemo(() => {
        return tiers.filter(tier => tier.type !== 'seasonal');
    }, [tiers]);

    const seasonalTiers = useMemo(() => {
        return tiers.filter(tier => tier.type === 'seasonal');
    }, [tiers]);

    const canProceed = () => {
        switch (step) {
            case 1: return step1Valid;
            case 2: return step2Valid;
            case 3: return step3Valid;
            case 4: return step4Valid;
            default: return false;
        }
    };

    // Navigation
    const handleNext = () => {
        if (step < totalSteps && canProceed()) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // Submit
    const handleSubmit = async () => {
        try {
            let finalImageUrl = image || '';

            // Upload image if new file selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadResponse = await fetch('/api/upload/rewards', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadResult = await uploadResponse.json();
                finalImageUrl = uploadResult.secure_url;
            }

            const finalStampCount = useCustomCount ? Number(customStampCount) : stampsRequired;

            const payload: CreateStampRewardRequest = {
                title,
                description,
                stampsRequired: finalStampCount,
                rewardBenefitType,
                rewardBenefitValue,
                triggerMethod,
                expirationRules,
                audience,
                sectorIds: audience === 'specific_sectors' ? selectedSectors : [],
                tierIds: selectedTiers,
                status,
                image: finalImageUrl,
                stampIcon,
                isRepeatable,
                hybridSettings,
                termsAndConditions,
            };

            if (mode === 'edit' && stampReward) {
                updateStampReward(
                    { id: stampReward.id, payload },
                    {
                        onSuccess: () => {
                            onClose();
                            setShowSuccessDialog(true);
                            onSuccess?.();
                        },
                    }
                );
            } else {
                createStampReward(payload, {
                    onSuccess: () => {
                        onClose();
                        setShowSuccessDialog(true);
                        onSuccess?.();
                    },
                });
            }
        } catch (error) {
            console.error('Error submitting stamp reward:', error);
            toast.error('Failed to save stamp reward template');
        }
    };

    const progressValue = (step / totalSteps) * 100;
    const modalTitle = mode === 'edit'
        ? 'Edit Stamp Reward Template'
        : mode === 'duplicate'
            ? 'Duplicate Stamp Reward Template'
            : 'Create Stamp Reward Template';

    const getTriggerIcon = (method: StampTriggerMethod) => {
        switch (method) {
            case 'qr_scan': return <QrCode className="h-5 w-5" />;
            case 'purchase': return <ShoppingCart className="h-5 w-5" />;
            case 'check_in': return <MapPin className="h-5 w-5" />;
        }
    };

    const getBenefitIcon = (type: RewardBenefitType) => {
        switch (type) {
            case 'free_item': return <Gift className="h-5 w-5" />;
            case 'discount': return <Tag className="h-5 w-5" />;
            case 'free_service': return <Wand2 className="h-5 w-5" />;
            case 'bonus_points': return <Star className="h-5 w-5" />;
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                                <Stamp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{modalTitle}</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Step {step} of {totalSteps}
                                </DialogDescription>
                            </div>
                        </div>
                        <Progress value={progressValue} className="mt-4 h-2" />
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4 px-1">
                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                                    <p className="text-sm text-gray-500">Define the core details of your stamp reward</p>
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="title" className="font-medium">Reward Title</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>A catchy, descriptive name for this stamp reward that customers will see</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Buy 5, Get 1 Free"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="h-11"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="description" className="font-medium">Description</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Explain how customers can earn stamps and what they&apos;ll receive upon completion</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Textarea
                                        id="description"
                                        placeholder="e.g., Collect 5 stamps with every coffee purchase and get your 6th coffee absolutely free!"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {/* Number of Stamps Required */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Number of Stamps Required</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>How many stamps must a customer collect before unlocking the reward? Choose between 2-20 stamps.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    {!useCustomCount && (
                                        <div className="grid grid-cols-6 gap-2">
                                            {stampCountOptions.map((count) => (
                                                <Button
                                                    key={count}
                                                    type="button"
                                                    variant={stampsRequired === count ? 'default' : 'outline'}
                                                    onClick={() => setStampsRequired(count)}
                                                    className={`h-12 text-lg font-semibold ${stampsRequired === count
                                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-0'
                                                        : ''
                                                        }`}
                                                >
                                                    {count}
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="customCount"
                                            checked={useCustomCount}
                                            onCheckedChange={(checked) => setUseCustomCount(checked as boolean)}
                                        />
                                        <Label htmlFor="customCount" className="text-sm cursor-pointer">
                                            Use custom stamp count
                                        </Label>
                                    </div>

                                    {useCustomCount && (
                                        <Input
                                            type="number"
                                            min={2}
                                            max={20}
                                            value={customStampCount}
                                            onChange={(e) => setCustomStampCount(e.target.value)}
                                            placeholder="Enter stamp count (2-20)"
                                            className="h-11"
                                        />
                                    )}

                                    {/* Visual preview of stamps */}
                                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Preview:</p>
                                        <div className="flex gap-2 flex-wrap justify-center">
                                            {Array.from({ length: Math.min(useCustomCount ? Number(customStampCount) || 5 : stampsRequired, 12) }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-10 h-10 rounded-lg border-2 border-dashed border-orange-300 dark:border-orange-700 flex items-center justify-center bg-white dark:bg-gray-800"
                                                >
                                                    <Stamp className="h-5 w-5 text-orange-400" />
                                                </div>
                                            ))}
                                            {(useCustomCount ? Number(customStampCount) : stampsRequired) > 12 && (
                                                <div className="w-10 h-10 rounded-lg border-2 border-dashed border-orange-300 dark:border-orange-700 flex items-center justify-center bg-white dark:bg-gray-800">
                                                    <span className="text-xs font-medium text-orange-500">
                                                        +{(useCustomCount ? Number(customStampCount) : stampsRequired) - 12}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Reward Details */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reward Details</h3>
                                    <p className="text-sm text-gray-500">Define what customers get and how they earn stamps</p>
                                </div>

                                {/* Reward Benefit Type */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Reward Benefit Type</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Select the type of reward customers will receive after completing all stamps</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(Object.keys(BENEFIT_TYPE_LABELS) as RewardBenefitType[]).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setRewardBenefitType(type)}
                                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${rewardBenefitType === type
                                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${rewardBenefitType === type
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                    }`}>
                                                    {getBenefitIcon(type)}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium text-sm">{BENEFIT_TYPE_LABELS[type]}</p>
                                                    <p className="text-xs text-gray-500">{BENEFIT_TYPE_ICONS[type]}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Reward Benefit Value */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="benefitValue" className="font-medium">Reward Value/Description</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Describe exactly what the customer receives (e.g., &quot;Free Large Coffee&quot;, &quot;20% Off Next Purchase&quot;)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Input
                                        id="benefitValue"
                                        placeholder={
                                            rewardBenefitType === 'discount'
                                                ? "e.g., 20% off your next purchase"
                                                : rewardBenefitType === 'free_item'
                                                    ? "e.g., Free coffee of your choice"
                                                    : rewardBenefitType === 'bonus_points'
                                                        ? "e.g., 500 bonus points"
                                                        : "e.g., Free haircut"
                                        }
                                        value={rewardBenefitValue}
                                        onChange={(e) => setRewardBenefitValue(e.target.value)}
                                        className="h-11"
                                    />
                                </div>

                                {/* Stamp Trigger Method */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Stamp Trigger Method</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Choose how customers will receive stamps. This determines the verification method.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <RadioGroup
                                        value={triggerMethod}
                                        onValueChange={(value) => setTriggerMethod(value as StampTriggerMethod)}
                                        className="space-y-3"
                                    >
                                        {(Object.keys(TRIGGER_METHOD_LABELS) as StampTriggerMethod[]).map((method) => {
                                            const isComingSoon = method === 'purchase' || method === 'check_in';
                                            return (
                                                <label
                                                    key={method}
                                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${triggerMethod === method
                                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                                                        } ${isComingSoon ? 'opacity-40 pointer-events-none grayscale-[0.5]' : 'cursor-pointer'}`}
                                                >
                                                    <RadioGroupItem value={method} className="mt-1" disabled={isComingSoon} />
                                                    <div className={`p-2 rounded-lg ${triggerMethod === method
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                        }`}>
                                                        {getTriggerIcon(method)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium">{TRIGGER_METHOD_LABELS[method]}</p>
                                                            {isComingSoon && (
                                                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 uppercase tracking-tighter bg-gray-100 text-gray-400 border-0">
                                                                    Disabled
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-0.5">{TRIGGER_METHOD_DESCRIPTIONS[method]}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </RadioGroup>
                                </div>

                                {/* Stamp Icon */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Stamp Icon</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Choose an icon that will appear on each stamp slot when collected</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {stampIconOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setStampIcon(option.value)}
                                                className={`w-12 h-12 text-xl rounded-xl border-2 transition-all ${stampIcon === option.value
                                                    ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/50 scale-110'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                                                    }`}
                                            >
                                                {option.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Settings & Visibility */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings & Visibility</h3>
                                    <p className="text-sm text-gray-500">Configure who can see and use this stamp reward</p>
                                </div>

                                {/* Audience Selection */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Target Audience</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Choose which businesses can activate this stamp reward template</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Select value={audience} onValueChange={(v) => setAudience(v as StampAudience)}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[10000]">
                                            <SelectItem value="all_businesses">All Businesses</SelectItem>
                                            <SelectItem value="specific_sectors">Specific Sectors</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {audience === 'specific_sectors' && (
                                        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            <Label className="text-sm mb-3 block">Select Sectors</Label>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {sectors.map((sector) => (
                                                    <div key={sector.id} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`sector-${sector.id}`}
                                                            checked={selectedSectors.includes(sector.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedSectors([...selectedSectors, sector.id]);
                                                                } else {
                                                                    setSelectedSectors(selectedSectors.filter(id => id !== sector.id));
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={`sector-${sector.id}`} className="text-sm cursor-pointer">
                                                            {sector.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Standard Plan Restrictions */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Standard Plan (Optional)</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Optionally restrict this reward to businesses with specific standard tier levels.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {standardTiers.length > 0 ? standardTiers.map((tier) => (
                                                <div key={tier.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`tier-standard-${tier.id}`}
                                                        checked={selectedTiers.includes(tier.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedTiers([...selectedTiers, tier.id]);
                                                            } else {
                                                                setSelectedTiers(selectedTiers.filter(id => id !== tier.id));
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`tier-standard-${tier.id}`} className="text-sm cursor-pointer">
                                                        {tier.name}
                                                    </Label>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-gray-500 italic">No standard plans available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Seasonal Plan Restrictions */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Seasonal Plan (Optional)</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Optionally restrict this reward to businesses with seasonal tier levels. Selecting a seasonal plan will auto-fill expiration rules.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {seasonalTiers.length > 0 ? seasonalTiers.map((tier) => (
                                                <div key={tier.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`tier-seasonal-${tier.id}`}
                                                        checked={selectedTiers.includes(tier.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedTiers([...selectedTiers, tier.id]);
                                                                // Auto-fill expiration rules from seasonal plan dates
                                                                if (tier.startDate && tier.endDate) {
                                                                    const startDate = new Date(tier.startDate);
                                                                    const endDate = new Date(tier.endDate);
                                                                    const today = new Date();

                                                                    // Calculate days from today to end date for stamp validity
                                                                    const stampValidityDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                                                                    // Calculate duration of seasonal plan for reward claim days
                                                                    const rewardClaimDays = Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

                                                                    setExpirationRules({
                                                                        stampValidityDays,
                                                                        rewardClaimDays
                                                                    });
                                                                }
                                                            } else {
                                                                setSelectedTiers(selectedTiers.filter(id => id !== tier.id));
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor={`tier-seasonal-${tier.id}`} className="text-sm cursor-pointer">
                                                            {tier.name}
                                                        </Label>
                                                        {tier.startDate && tier.endDate && (
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(tier.startDate).toLocaleDateString()} - {new Date(tier.endDate).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-gray-500 italic">No seasonal plans available</p>
                                            )}
                                        </div>
                                        {seasonalTiers.filter(t => selectedTiers.includes(t.id)).length > 0 && (
                                            <div className="mt-3 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
                                                    <Info className="h-3.5 w-3.5" />
                                                    <span>Expiration rules have been auto-filled based on the seasonal plan dates</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Tiers Display */}
                                {selectedTiers.length > 0 && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <Label className="text-sm text-gray-500 mb-2 block">Selected Plans</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedTiers.map((tierId) => {
                                                const tier = tiers.find(t => t.id === tierId);
                                                const isSeasonalTier = tier?.type === 'seasonal';
                                                return tier ? (
                                                    <Badge
                                                        key={tierId}
                                                        variant="secondary"
                                                        className={`text-xs ${isSeasonalTier ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : ''}`}
                                                    >
                                                        {tier.name}
                                                        {isSeasonalTier && ' (Seasonal)'}
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Expiration Rules */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Expiration Rules</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Set optional time limits for stamps and reward claims. Leave empty for no expiration.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                Stamp Validity (days)
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                placeholder="No limit"
                                                value={expirationRules.stampValidityDays || ''}
                                                onChange={(e) => setExpirationRules({
                                                    ...expirationRules,
                                                    stampValidityDays: e.target.value ? Number(e.target.value) : null
                                                })}
                                                className="h-10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                Claim Deadline (days)
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                placeholder="No limit"
                                                value={expirationRules.rewardClaimDays || ''}
                                                onChange={(e) => setExpirationRules({
                                                    ...expirationRules,
                                                    rewardClaimDays: e.target.value ? Number(e.target.value) : null
                                                })}
                                                className="h-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Repeatable Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Repeat className="h-5 w-5 text-purple-500" />
                                        <div>
                                            <Label className="font-medium">Repeatable Reward</Label>
                                            <p className="text-xs text-gray-500">Allow customers to earn this reward multiple times</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isRepeatable}
                                        onCheckedChange={setIsRepeatable}
                                    />
                                </div>

                                {/* Hybrid Mode */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="h-5 w-5 text-amber-500" />
                                            <div>
                                                <Label className="font-medium">Hybrid Mode (Stamps + Points)</Label>
                                                <p className="text-xs text-gray-500">Award points alongside stamps</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={hybridSettings.enabled}
                                            onCheckedChange={(checked) => setHybridSettings({
                                                ...hybridSettings,
                                                enabled: checked
                                            })}
                                        />
                                    </div>

                                    {hybridSettings.enabled && (
                                        <div className="p-4 border border-amber-200 dark:border-amber-800 rounded-xl space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-sm">Points Per Stamp</Label>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Points awarded each time a stamp is earned</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={hybridSettings.pointsPerStamp}
                                                        onChange={(e) => setHybridSettings({
                                                            ...hybridSettings,
                                                            pointsPerStamp: Number(e.target.value)
                                                        })}
                                                        className="h-10"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-sm">Completion Bonus</Label>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Extra points when all stamps are collected</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={hybridSettings.completionBonusPoints}
                                                        onChange={(e) => setHybridSettings({
                                                            ...hybridSettings,
                                                            completionBonusPoints: Number(e.target.value)
                                                        })}
                                                        className="h-10"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <Checkbox
                                                    id="pointsFallback"
                                                    checked={hybridSettings.pointsFallbackEnabled}
                                                    onCheckedChange={(checked) => setHybridSettings({
                                                        ...hybridSettings,
                                                        pointsFallbackEnabled: checked as boolean
                                                    })}
                                                />
                                                <Label htmlFor="pointsFallback" className="text-sm cursor-pointer">
                                                    Award points if stamp cannot be earned due to system error
                                                </Label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Media & Review */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Media & Review</h3>
                                    <p className="text-sm text-gray-500">Add imagery and review your stamp reward</p>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Reward Image</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Upload an attractive image that represents this stamp reward (recommended: 800x600px)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <CloudinaryUpload onFileSelect={handleFileSelect} />
                                    {image && (
                                        <div className="mt-3 relative w-full h-48 rounded-xl overflow-hidden border">
                                            <Image
                                                src={image}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Terms & Conditions */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="terms" className="font-medium">Terms & Conditions (Optional)</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Add any terms, conditions, or restrictions that apply to this stamp reward</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Textarea
                                        id="terms"
                                        placeholder="e.g., Valid at participating locations only. Cannot be combined with other offers."
                                        value={termsAndConditions}
                                        onChange={(e) => setTermsAndConditions(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-medium">Initial Status</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>Draft: Save for later editing. Active: Make available to businesses immediately.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Select value={status} onValueChange={(v) => setStatus(v as StampRewardStatus)}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[10000]">
                                            <SelectItem value="draft">📝 Draft</SelectItem>
                                            <SelectItem value="active">✅ Active (Publish Immediately)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Preview Card */}
                                <div className="space-y-2">
                                    <Label className="font-medium flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </Label>
                                    <Card className="overflow-hidden">
                                        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                {image ? (
                                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                                                        <Image src={image} alt="Preview" fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                                        <Stamp className="h-6 w-6 text-purple-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold">{title || 'Reward Title'}</h4>
                                                    <Badge variant="outline" className={getStatusStyles(status)}>
                                                        {status === 'active' ? 'Active' : 'Draft'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {description || 'Reward description will appear here...'}
                                            </p>
                                            <div className="flex gap-1 mb-3">
                                                {Array.from({ length: Math.min(useCustomCount ? Number(customStampCount) || 5 : stampsRequired, 6) }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-8 h-8 rounded-lg border-2 border-dashed border-purple-200 flex items-center justify-center"
                                                    >
                                                        <span className="text-sm">{stampIcon}</span>
                                                    </div>
                                                ))}
                                                {(useCustomCount ? Number(customStampCount) : stampsRequired) > 6 && (
                                                    <div className="w-8 h-8 rounded-lg border-2 border-dashed border-purple-200 flex items-center justify-center">
                                                        <span className="text-xs text-purple-500">
                                                            +{(useCustomCount ? Number(customStampCount) : stampsRequired) - 6}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                    {BENEFIT_TYPE_ICONS[rewardBenefitType]} {rewardBenefitValue || 'Reward benefit'}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={step === 1}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </Button>

                        <div className="flex items-center gap-2">
                            {step < totalSteps ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canProceed() || isCreating || isUpdating}
                                    className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                >
                                    {isCreating || isUpdating ? (
                                        'Saving...'
                                    ) : mode === 'edit' ? (
                                        'Save Changes'
                                    ) : (
                                        <>
                                            <Stamp className="h-4 w-4" />
                                            Create Template
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-full">
                                <Stamp className="h-5 w-5 text-green-600" />
                            </div>
                            Success!
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Your stamp reward template has been {mode === 'edit' ? 'updated' : 'created'} successfully.
                            {status === 'active'
                                ? ' It is now available for businesses to activate.'
                                : ' It has been saved as a draft.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
                            Done
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// Helper function for status styles
function getStatusStyles(status: string): string {
    switch (status) {
        case 'active':
            return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
        case 'draft':
            return 'bg-amber-500/10 text-amber-600 border-amber-200';
        default:
            return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
}
