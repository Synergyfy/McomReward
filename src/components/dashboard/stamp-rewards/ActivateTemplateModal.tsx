'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Stamp,
    Gift,
    HelpCircle,
    Check,
    Clock,
    QrCode,
    ShoppingCart,
    MapPin,
    Zap,
    Sparkles,
    Repeat
} from 'lucide-react';
import {
    StampRewardResponse,
    TRIGGER_METHOD_LABELS,
    TRIGGER_METHOD_DESCRIPTIONS,
    BENEFIT_TYPE_LABELS,
    BENEFIT_TYPE_ICONS,
} from '@/services/stamp-rewards/types';
import { useActivateStampReward } from '@/services/business-stamp-rewards/hook';

interface ActivateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: StampRewardResponse | null;
    onSuccess?: () => void;
}

const getTriggerIcon = (method: string) => {
    switch (method) {
        case 'qr_scan': return <QrCode className="h-5 w-5" />;
        case 'purchase': return <ShoppingCart className="h-5 w-5" />;
        case 'check_in': return <MapPin className="h-5 w-5" />;
        default: return <Zap className="h-5 w-5" />;
    }
};

export default function ActivateTemplateModal({
    isOpen,
    onClose,
    template,
    onSuccess,
}: ActivateTemplateModalProps) {
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [operatingHours, setOperatingHours] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [step, setStep] = useState<'review' | 'customize' | 'confirm'>('review');

    const { mutate: activateStampReward, isPending: isActivating } = useActivateStampReward();

    if (!template) return null;

    const handleFileSelect = (file: File | null, previewUrl: string | null) => {
        setSelectedFile(file);
        setCustomImage(previewUrl);
    };

    const handleActivate = async () => {
        try {
            let finalImageUrl = customImage || template.image;

            // Upload custom image if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadResponse = await fetch('/api/upload/rewards', {
                    method: 'POST',
                    body: formData,
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    finalImageUrl = uploadResult.secure_url;
                }
            }

            activateStampReward(
                {
                    templateId: template.id,
                    customImage: finalImageUrl || undefined,
                    operatingHours: operatingHours || undefined,
                },
                {
                    onSuccess: () => {
                        onClose();
                        onSuccess?.();
                        setStep('review');
                        setCustomImage(null);
                        setOperatingHours('');
                        setSelectedFile(null);
                    },
                }
            );
        } catch (error) {
            console.error('Failed to activate template:', error);
        }
    };

    const handleClose = () => {
        onClose();
        setStep('review');
        setCustomImage(null);
        setOperatingHours('');
        setSelectedFile(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                            <Stamp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Activate Stamp Reward</DialogTitle>
                            <DialogDescription>
                                {step === 'review' && 'Review the template details'}
                                {step === 'customize' && 'Customize for your business (optional)'}
                                {step === 'confirm' && 'Confirm activation'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {/* Step: Review */}
                    {step === 'review' && (
                        <div className="space-y-6">
                            {/* Template preview */}
                            <Card className="overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500" />
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-orange-100">
                                            {template.image ? (
                                                <Image
                                                    src={template.image}
                                                    alt={template.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Stamp className="h-8 w-8 text-orange-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{template.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {template.isRepeatable && (
                                                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                                                        <Repeat className="h-3 w-3 mr-1" />
                                                        Repeatable
                                                    </Badge>
                                                )}
                                                {template.hybridSettings.enabled && (
                                                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">
                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                        +Points
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {template.description}
                                    </p>

                                    {/* Key info */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                            <Stamp className="h-5 w-5 text-orange-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {template.stampsRequired} stamps required
                                                </p>
                                                <p className="text-xs text-gray-500">Customers collect stamps to unlock the reward</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                            <Gift className="h-5 w-5 text-green-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {template.rewardBenefitValue}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {BENEFIT_TYPE_ICONS[template.rewardBenefitType]} {BENEFIT_TYPE_LABELS[template.rewardBenefitType]}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            {getTriggerIcon(template.triggerMethod)}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {TRIGGER_METHOD_LABELS[template.triggerMethod]}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {TRIGGER_METHOD_DESCRIPTIONS[template.triggerMethod]}
                                                </p>
                                            </div>
                                        </div>

                                        {(template.expirationRules.stampValidityDays || template.expirationRules.rewardClaimDays) && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <Clock className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    {template.expirationRules.stampValidityDays && (
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            Stamps expire in {template.expirationRules.stampValidityDays} days
                                                        </p>
                                                    )}
                                                    {template.expirationRules.rewardClaimDays && (
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            Claim within {template.expirationRules.rewardClaimDays} days
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Terms if any */}
                                    {template.termsAndConditions && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-xs text-gray-500 italic">
                                                <strong>Terms:</strong> {template.termsAndConditions}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Notice */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                                    What you can customize:
                                </h4>
                                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        Custom display image (optional)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        Operating hours (coming soon)
                                    </li>
                                </ul>
                                <p className="text-xs text-blue-500 mt-2">
                                    Note: Stamp count, reward, and trigger method are set by admin and cannot be changed.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step: Customize */}
                    {step === 'customize' && (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Label className="font-medium">Custom Display Image (Optional)</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Upload your own image to display for this reward. If not provided, the default template image will be used.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <CloudinaryUpload onFileSelect={handleFileSelect} />

                                {(customImage || template.image) && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 mb-2">Preview:</p>
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden border">
                                            <Image
                                                src={customImage || template.image || ''}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                            {customImage && (
                                                <Badge className="absolute top-2 right-2 bg-green-500">Custom Image</Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Operating Hours */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Label className="font-medium">Operating Hours (Optional)</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>e.g. &quot;Mon-Fri 9am-5pm, Sat 10am-2pm&quot;</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    placeholder="e.g. Mon-Fri 9am-5pm"
                                    value={operatingHours}
                                    onChange={(e) => setOperatingHours(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    This will be displayed to customers collecting stamps.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step: Confirm */}
                    {step === 'confirm' && (
                        <div className="space-y-6 text-center">
                            <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl">
                                <div className="w-16 h-16 mx-auto mb-4 p-4 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                                    <Stamp className="h-8 w-8 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Ready to activate!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    &quot;{template.title}&quot; will be available to your customers immediately after activation.
                                </p>
                            </div>

                            <div className="text-left p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2">
                                <p className="text-sm flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Customers can start collecting stamps</span>
                                </p>
                                <p className="text-sm flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Reward appears on your business page</span>
                                </p>
                                <p className="text-sm flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Track progress in your dashboard</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    {step === 'review' && (
                        <>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button
                                onClick={() => setStep('customize')}
                                className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                            >
                                Continue
                            </Button>
                        </>
                    )}
                    {step === 'customize' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('review')}>Back</Button>
                            <Button
                                onClick={() => setStep('confirm')}
                                className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                            >
                                Continue
                            </Button>
                        </>
                    )}
                    {step === 'confirm' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('customize')}>Back</Button>
                            <Button
                                onClick={handleActivate}
                                disabled={isActivating}
                                className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                            >
                                {isActivating ? (
                                    'Activating...'
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4" />
                                        Activate Now
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
