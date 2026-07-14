'use client';

import React, { useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
    ArrowLeft,
    ArrowRight,
    HelpCircle,
    Store,
    Users,
    Gift,
    Stamp,
    Coins,
    Sparkles,
    CheckCircle2,
    Calendar,
    Image as ImageIcon
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { useCreateReward, useUpdateReward } from '@/services/rewards/hook';
import { useGetSectors } from '@/services/sectors/hook';
import { useGetTiers } from '@/services/tiers/hook';
import { RewardResponse, CreateRewardRequest } from '@/services/rewards/types';

export type RewardType = 'point' | 'stamp';

interface UnifiedRewardWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit' | 'duplicate';
    reward?: RewardResponse | null;
    initialRewardTypes?: RewardType[]; // ['point'], ['stamp'], or ['point', 'stamp']
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

const stampCountOptions = [4, 5, 6, 8, 10, 12];

export default function UnifiedRewardWizardModal({
    isOpen,
    onClose,
    mode = 'create',
    reward,
    initialRewardTypes = [],
    onSuccess,
}: UnifiedRewardWizardModalProps) {
    // API Hooks
    const { mutate: createReward, isPending: isCreating } = useCreateReward();
    const { mutate: updateReward, isPending: isUpdating } = useUpdateReward();
    const { data: sectors = [] } = useGetSectors();
    const { data: tiers = [] } = useGetTiers();

    // Determine types
    const isEditMode = mode === 'edit';

    // State for Reward Configuration
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    // Type Configuration (Point, Stamp, Hybrid)
    const [isPointsEnabled, setIsPointsEnabled] = useState(false);
    const [isStampsEnabled, setIsStampsEnabled] = useState(false);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);

    // Step 1: Basic Info
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rewardValue, setRewardValue] = useState<string>(''); // Monetary value

    // Step 2: Mechanics (Points/Stamps)
    const [maxPoints, setMaxPoints] = useState<string>('');
    const [stampsRequired, setStampsRequired] = useState<number>(5);
    const [customStampCount, setCustomStampCount] = useState<string>('');
    const [useCustomCount, setUseCustomCount] = useState(false);
    const [stampIcon, setStampIcon] = useState('⭐');

    // Step 3: Audience & Visibility
    const [audience, setAudience] = useState<string>('all business');
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
    const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
    const [status, setStatus] = useState<string>('active');
    const [expiryDate, setExpiryDate] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('0'); // 0 = Unlimited

    // Step 4: Media
    const [image, setImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // New Sector Fields
    const [selectedSectorId, setSelectedSectorId] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
    const [rewardEmoji, setRewardEmoji] = useState('🎁');

    // Initialization
    useEffect(() => {
        if (isOpen) {
            if ((mode === 'edit' || mode === 'duplicate') && reward) {
                // Populate from existing reward
                setTitle(mode === 'duplicate' ? `Copy of ${reward.title}` : reward.title);
                setDescription(reward.description || '');
                setRewardValue(String(reward.value || 0));

                setIsPointsEnabled(reward.is_points_enabled || (!!reward.pointRequired || !!reward.maxPoints));
                setIsStampsEnabled(reward.is_stamps_enabled || !!reward.max_stamps_required);

                setMaxPoints(String(reward.maxPoints || reward.max_points || ''));

                if (reward.max_stamps_required) {
                    setStampsRequired(reward.max_stamps_required);
                    if (!stampCountOptions.includes(reward.max_stamps_required)) {
                        setUseCustomCount(true);
                        setCustomStampCount(String(reward.max_stamps_required));
                    }
                }

                setStampIcon(reward.stamp_emoji || '⭐');

                setAudience(reward.audience || 'all business');
                // Note: sector_ids and tier_ids might not be in RewardResponse typically, 
                // but if they were, we'd load them here. 
                // Assuming we might not have them on edit unless fetched specifically.

                setImage(reward.image);
                setQuantity(String(reward.quantity));

                if (reward.expiryDatetime || reward.expiry) {
                    const date = new Date(reward.expiryDatetime || reward.expiry);
                    if (!isNaN(date.getTime())) {
                        setExpiryDate(date.toISOString()); // Keep full ISO string for state if needed, but DatePicker wants Date obj
                    }
                }

                setStatus(mode === 'duplicate' ? 'draft' : reward.status);

                // Populate sector fields if they exist (need to check if they are in RewardResponse in real scenarios)
                // Assuming they might be mapped or added to the response
                setSelectedSectorId((reward as any).sector_id || '');
                setSelectedCategoryId((reward as any).category_id || '');
                setSelectedSubCategoryId((reward as any).sub_category_id || '');
                setRewardEmoji((reward as any).emoji || '🎁');

            } else {
                // New Reward logic
                resetForm();

                if (initialRewardTypes.includes('point')) setIsPointsEnabled(true);
                if (initialRewardTypes.includes('stamp')) setIsStampsEnabled(true);
            }
        }
    }, [isOpen, mode, reward, initialRewardTypes]);

    const resetForm = () => {
        setStep(1);
        setTitle('');
        setDescription('');
        setRewardValue('');
        setMaxPoints('');
        setStampsRequired(5);
        setCustomStampCount('');
        setUseCustomCount(false);
        setStampIcon('⭐');
        setAudience('all business');
        setSelectedSectors([]);
        setSelectedTiers([]);
        setStatus('active');
        setExpiryDate('');
        setQuantity('0');
        setImage(null);
        setSelectedFile(null);
        setIsPointsEnabled(false);
        setIsStampsEnabled(false);
        setSelectedSectorId('');
        setSelectedCategoryId('');
        setSelectedSubCategoryId('');
        setRewardEmoji('🎁');
    };

    // Validation
    const step1Valid = useMemo(() => {
        return title.trim().length > 0 &&
            description.trim().length > 0 &&
            rewardValue.trim().length > 0;
    }, [title, description, rewardValue]);

    const step2Valid = useMemo(() => {
        let valid = true;
        if (isPointsEnabled) {
            valid = valid && (Number(maxPoints) > 0);
        }
        if (isStampsEnabled) {
            const count = useCustomCount ? Number(customStampCount) : stampsRequired;
            valid = valid && (count >= 2 && count <= 20);
        }
        return valid;
    }, [isPointsEnabled, isStampsEnabled, maxPoints, useCustomCount, customStampCount, stampsRequired]);

    const step3Valid = useMemo(() => {
        if (audience === 'specific sectors' && selectedSectors.length === 0) return false;
        if (audience === 'specific tiers' && selectedTiers.length === 0) return false;
        return true;
    }, [audience, selectedSectors, selectedTiers]);

    const step4Valid = useMemo(() => {
        return !!image;
    }, [image]);

    const canProceed = () => {
        switch (step) {
            case 1: return step1Valid;
            case 2: return step2Valid;
            case 3: return step3Valid;
            case 4: return step4Valid;
            default: return false;
        }
    };

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        try {
            let finalImageUrl = image || '';

            // Upload logic would go here if we had the upload endpoint integrated in the component
            // For now, assuming direct file upload handling or URL
            if (selectedFile) {
                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadResponse = await fetch('/api/upload/rewards', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    setIsUploading(false);
                    throw new Error('Failed to upload image');
                }

                const uploadResult = await uploadResponse.json();
                finalImageUrl = uploadResult.secure_url;
                setIsUploading(false);
            }

            const finalStampCount = useCustomCount ? Number(customStampCount) : stampsRequired;

            const payload: CreateRewardRequest = {
                title,
                description,
                value: Number(rewardValue),
                max_points: isPointsEnabled ? Number(maxPoints) : undefined,
                max_stamps_required: isStampsEnabled ? finalStampCount : undefined,
                stamp_emoji: isStampsEnabled ? stampIcon : undefined,
                is_points_enabled: isPointsEnabled,
                is_stamps_enabled: isStampsEnabled,
                quantity: Number(quantity),
                audience,
                sector_ids: audience === 'specific sectors' ? selectedSectors : [],
                tier_ids: audience === 'specific tiers' ? selectedTiers : [],
                status,
                image: finalImageUrl,
                expiry_datetime: expiryDate ? new Date(expiryDate).toISOString() : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                reward_type: 'Voucher', // Defaulting to Voucher for now as per requirements mostly being about type
                sector_id: selectedSectorId || undefined,
                category_id: selectedCategoryId || undefined,
                sub_category_id: selectedSubCategoryId || undefined,
                emoji: rewardEmoji,
                image_source_type: 'CUSTOM_URL', // Defaulting as per example payload
            };

            if (mode === 'edit' && reward) {
                // Map to UpdateRewardRequest - slightly different keys
                updateReward(
                    {
                        rewardId: reward.id,
                        title,
                        description,
                        value: Number(rewardValue),
                        max_points: isPointsEnabled ? Number(maxPoints) : 0,
                        max_stamps_required: isStampsEnabled ? finalStampCount : 0,
                        stamp_emoji: stampIcon,
                        is_points_enabled: isPointsEnabled,
                        is_stamps_enabled: isStampsEnabled,
                        audience,
                        sector_ids: selectedSectors,
                        tier_ids: selectedTiers,
                        status,
                        image: finalImageUrl,
                        expiry: expiryDate,
                        quantity: Number(quantity),
                        sector_id: selectedSectorId,
                        category_id: selectedCategoryId,
                        sub_category_id: selectedSubCategoryId,
                        emoji: rewardEmoji,
                        image_source_type: 'CUSTOM_URL'
                    },
                    {
                        onSuccess: () => {
                            onSuccess?.();
                            onClose();
                            toast.success('Reward updated successfully');
                        },
                        onError: () => {
                            setIsUploading(false); // Reset in case it failed later
                        }
                    }
                );
            } else {
                createReward(payload, {
                    onSuccess: () => {
                        onSuccess?.();
                        onClose();
                        // toast handled in hook
                    },
                    onError: () => {
                        setIsUploading(false); // Reset in case it failed later
                    }
                });
            }

        } catch (error) {
            console.error(error);
            setIsUploading(false); // Ensure state reset on error
            toast.error('Failed to save reward');
        }
    };

    const progressValue = (step / totalSteps) * 100;

    // Helper text for modal title depending on what we are creating
    const getRewardTypeLabel = () => {
        if (isPointsEnabled && isStampsEnabled) return 'Hybrid Reward';
        if (isPointsEnabled) return 'Point Reward';
        if (isStampsEnabled) return 'Stamp Reward';
        return 'Reward';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                            {isStampsEnabled && isPointsEnabled ? <Sparkles className="h-5 w-5 text-white" /> :
                                isPointsEnabled ? <Coins className="h-5 w-5 text-white" /> :
                                    <Stamp className="h-5 w-5 text-white" />}
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {mode === 'create' ? 'Create' : mode === 'edit' ? 'Edit' : 'Duplicate'} {getRewardTypeLabel()}
                            </DialogTitle>
                            <DialogDescription>
                                Step {step} of {totalSteps}
                            </DialogDescription>
                        </div>
                    </div>
                    <Progress value={progressValue} className="mt-4 h-2" />
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-6 px-4">

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold">Basic Information</h3>
                                <p className="text-sm text-gray-500">Define the core reward details</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>Reward Title <span className="text-red-500">*</span></Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>The name of the reward as it will appear to customers (e.g., "Free Coffee")</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    placeholder="e.g. £10 Off Voucher, Free Coffee"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>Description <span className="text-red-500">*</span></Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Explain what the reward is and any conditions for redemption.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Textarea
                                    placeholder="Detailed description of the reward..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>Value (£) <span className="text-red-500">*</span></Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>The monetary value of this reward in GBP.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={rewardValue}
                                        onChange={e => setRewardValue(e.target.value)}
                                        className="pl-7"
                                        min="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">The monetary value of this reward in GBP</p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Mechanics */}
                    {step === 2 && (
                        <div className="space-y-8">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold">Reward Mechanics</h3>
                                <p className="text-sm text-gray-500">How do customers earn this reward?</p>
                            </div>

                            {/* Points Config */}
                            {isPointsEnabled && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <Coins className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <h4 className="font-semibold text-blue-600">Points Configuration</h4>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Label>Points Required</Label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>How many points does a customer need to redeem to get this reward?</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 100"
                                                value={maxPoints}
                                                onChange={e => setMaxPoints(e.target.value)}
                                            />
                                            <p className="text-xs text-gray-400">Total points a customer needs to redeem this reward.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Stamps Config */}
                            {isStampsEnabled && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                                <Stamp className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <h4 className="font-semibold text-orange-600">Stamps Configuration</h4>
                                        </div>

                                        {/* Stamp Count */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-2">
                                                <Label>Stamps Required</Label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>The number of stamps a customer must collect to unlock this reward.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            {!useCustomCount && (
                                                <div className="flex flex-wrap gap-2">
                                                    {stampCountOptions.map(count => (
                                                        <Button
                                                            key={count}
                                                            variant={stampsRequired === count ? 'default' : 'outline'}
                                                            className={stampsRequired === count ? 'bg-orange-500 hover:bg-orange-600' : ''}
                                                            onClick={() => setStampsRequired(count)}
                                                        >
                                                            {count}
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mt-2">
                                                <Checkbox
                                                    id="custom-count"
                                                    checked={useCustomCount}
                                                    onCheckedChange={(c) => setUseCustomCount(!!c)}
                                                />
                                                <Label htmlFor="custom-count" className="font-normal cursor-pointer">Use custom count</Label>
                                            </div>

                                            {useCustomCount && (
                                                <Input
                                                    type="number"
                                                    min="2" max="20"
                                                    placeholder="Enter count (2-20)"
                                                    value={customStampCount}
                                                    onChange={e => setCustomStampCount(e.target.value)}
                                                    className="w-full mt-2"
                                                />
                                            )}
                                        </div>

                                        {/* Stamp Icon */}
                                        <div className="space-y-3">
                                            <Label>Stamp Icon</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {stampIconOptions.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl transition-all ${stampIcon === opt.value
                                                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-sm scale-110'
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                        onClick={() => setStampIcon(opt.value)}
                                                    >
                                                        {opt.value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sector Icon (New Feature) */}
                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold text-gray-700">Sector Icon</Label>
                                                <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200 uppercase tracking-tighter">New Backend Sync</Badge>
                                            </div>
                                            <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                                                {sectors.map((sector: any) => (
                                                    <TooltipProvider key={sector.id}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    className={cn(
                                                                        "relative w-12 h-12 rounded-xl border flex items-center justify-center overflow-hidden transition-all duration-300",
                                                                        selectedSectorId === sector.id
                                                                            ? "ring-2 ring-orange-500 border-orange-500 ring-offset-2 scale-110 shadow-lg"
                                                                            : "hover:border-gray-300 hover:scale-105 bg-gray-50 dark:bg-gray-800"
                                                                    )}
                                                                    onClick={() => {
                                                                        setSelectedSectorId(sector.id);
                                                                        // Set default category if available
                                                                        if (sector.categories?.[0]) {
                                                                            setSelectedCategoryId(sector.categories[0].id);
                                                                            // Sub-categories are not directly in the sector object tree according to types
                                                                            // So we leave it to backend or future selection
                                                                        }
                                                                    }}
                                                                >
                                                                    {sector.imageUrl ? (
                                                                        <NextImage
                                                                            src={sector.imageUrl}
                                                                            alt={sector.name}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <Store className="h-6 w-6 text-gray-400" />
                                                                    )}
                                                                    {selectedSectorId === sector.id && (
                                                                        <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[1px] flex items-center justify-center text-orange-600">
                                                                            <CheckCircle2 className="h-4 w-4 fill-white" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="bottom">
                                                                <p className="text-xs">{sector.name}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-gray-400 italic font-medium">Selecting a sector icon ensures your reward is correctly categorized for AI discovery.</p>
                                        </div>

                                        {/* Optional Emoji (New Feature) */}
                                        <div className="space-y-4 pt-4 mt-2 border-t">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Reward Primary Emoji</Label>
                                            <div className="flex gap-3">
                                                <Input
                                                    value={rewardEmoji}
                                                    onChange={e => setRewardEmoji(e.target.value)}
                                                    className="w-16 h-12 text-2xl text-center rounded-xl border-2 focus:ring-orange-500/20"
                                                    maxLength={2}
                                                />
                                                <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl flex items-center text-xs text-gray-500">
                                                    This emoji will be used in push notifications and quick previews for this reward.
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Step 3: Audience */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold">Audience & Settings</h3>
                                <p className="text-sm text-gray-500">Who can access this reward?</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Target Audience</Label>
                                    <Select value={audience} onValueChange={setAudience}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all business">All Business</SelectItem>
                                            <SelectItem value="specific sectors">Specific Sectors</SelectItem>
                                            <SelectItem value="specific tiers">Specific Tiers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {audience === 'specific sectors' && (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                                        <Label className="mb-2 block">Select Sectors</Label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {sectors.map(sector => (
                                                <div key={sector.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`sec-${sector.id}`}
                                                        checked={selectedSectors.includes(sector.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setSelectedSectors([...selectedSectors, sector.id]);
                                                            else setSelectedSectors(selectedSectors.filter(id => id !== sector.id));
                                                        }}
                                                    />
                                                    <Label htmlFor={`sec-${sector.id}`}>{sector.name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t pt-4 mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Total Quantity (0 = Unlimited)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={quantity}
                                            onChange={e => setQuantity(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2 flex flex-col">
                                        <Label>Expiry Date (Optional)</Label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={expiryDate ? new Date(expiryDate) : null}
                                                onChange={(date: Date | null) => setExpiryDate(date ? date.toISOString() : '')}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholderText="Pick a date"
                                                dateFormat="PPP"
                                                minDate={new Date()}
                                                isClearable
                                                showYearDropdown
                                                scrollableYearDropdown
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    checked={status === 'active'}
                                                    onChange={() => setStatus('active')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="text-sm">Active</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    checked={status === 'draft'}
                                                    onChange={() => setStatus('draft')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="text-sm">Draft</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Media */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold">Reward Image</h3>
                                <p className="text-sm text-gray-500">Add an attractive image for your reward</p>
                            </div>

                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 transition-colors">
                                {image ? (
                                    <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden shadow-md">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => { setImage(null); setSelectedFile(null); }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                                        >
                                            <ArrowLeft className="h-4 w-4" /> {/* Actually X icon usually, reusing ArrowLeft rotated or similar if lucide X not imported, assume X exists or just generic close functionality */}
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center">
                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-3">
                                            <ImageIcon className="h-8 w-8 text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium text-blue-600">Click to upload image</span>
                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-4 border-t bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                    <Button variant="ghost" onClick={step === 1 ? onClose : handleBack}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>

                    <Button
                        onClick={step === totalSteps ? handleSubmit : handleNext}
                        disabled={!canProceed() || isCreating || isUpdating || isUploading}
                        className={isStampsEnabled ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                        {step === totalSteps ? (
                            isUploading ? 'Uploading Image...' :
                                isCreating || isUpdating ? 'Saving...' : 'Create Reward'
                        ) : 'Continue'}
                        {step !== totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
