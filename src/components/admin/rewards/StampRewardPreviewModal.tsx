'use client';

import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Stamp,
    Gift,
    Clock,
    Users,
    BarChart3,
    QrCode,
    ShoppingCart,
    MapPin,
    Sparkles,
    Repeat,
    Copy,
    X,
    Star
} from 'lucide-react';
import {
    StampRewardResponse,
    TRIGGER_METHOD_LABELS,
    TRIGGER_METHOD_DESCRIPTIONS,
    BENEFIT_TYPE_LABELS,
    BENEFIT_TYPE_ICONS,
    STATUS_LABELS
} from '@/services/stamp-rewards/types';

interface StampRewardPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    stampReward: StampRewardResponse | null;
    onEdit?: (id: string) => void;
    onDuplicate?: (id: string) => void;
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
        case 'draft':
            return 'bg-amber-500/10 text-amber-600 border-amber-200';
        case 'archived':
            return 'bg-gray-500/10 text-gray-600 border-gray-200';
        default:
            return 'bg-gray-500/10 text-gray-600';
    }
};

const getTriggerIcon = (method: string) => {
    switch (method) {
        case 'qr_scan': return <QrCode className="h-5 w-5" />;
        case 'purchase': return <ShoppingCart className="h-5 w-5" />;
        case 'check_in': return <MapPin className="h-5 w-5" />;
        default: return <Stamp className="h-5 w-5" />;
    }
};

export default function StampRewardPreviewModal({
    isOpen,
    onClose,
    stampReward,
    onEdit,
    onDuplicate,
}: StampRewardPreviewModalProps) {
    if (!stampReward) return null;

    // Simulate a customer stamp card with some stamps collected
    const collectedStamps = Math.floor(stampReward.stampsRequired * 0.6);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>

                    <DialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/20 shadow-xl ring-4 ring-white/30">
                                {stampReward.image ? (
                                    <Image
                                        src={stampReward.image}
                                        alt={stampReward.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Stamp className="h-10 w-10 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <DialogTitle className="text-2xl font-bold text-white mb-2">
                                    {stampReward.title}
                                </DialogTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={`${getStatusStyles(stampReward.status)} border`}>
                                        {STATUS_LABELS[stampReward.status]}
                                    </Badge>
                                    {stampReward.isRepeatable && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge className="bg-white/20 text-white border-white/30">
                                                        <Repeat className="h-3 w-3 mr-1" />
                                                        Repeatable
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Customers can earn this reward multiple times</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    {stampReward.hybridSettings.enabled && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge className="bg-amber-400/20 text-amber-100 border-amber-400/30">
                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                        Hybrid Mode
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{stampReward.hybridSettings.pointsPerStamp} points per stamp + {stampReward.hybridSettings.completionBonusPoints} bonus</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Left Column - Details */}
                        <div className="space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                                <p className="text-gray-900 dark:text-white">{stampReward.description}</p>
                            </div>

                            {/* Reward Benefit */}
                            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                            <Gift className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                {BENEFIT_TYPE_ICONS[stampReward.rewardBenefitType]} {BENEFIT_TYPE_LABELS[stampReward.rewardBenefitType]}
                                            </p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {stampReward.rewardBenefitValue}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trigger Method */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Stamp Trigger Method</h3>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                                        {getTriggerIcon(stampReward.triggerMethod)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {TRIGGER_METHOD_LABELS[stampReward.triggerMethod]}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {TRIGGER_METHOD_DESCRIPTIONS[stampReward.triggerMethod]}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Expiration Rules */}
                            {(stampReward.expirationRules.stampValidityDays || stampReward.expirationRules.rewardClaimDays) && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Expiration Rules</h3>
                                    <div className="space-y-2">
                                        {stampReward.expirationRules.stampValidityDays && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>Stamps expire after <strong>{stampReward.expirationRules.stampValidityDays} days</strong></span>
                                            </div>
                                        )}
                                        {stampReward.expirationRules.rewardClaimDays && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>Reward must be claimed within <strong>{stampReward.expirationRules.rewardClaimDays} days</strong></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Hybrid Mode Details */}
                            {stampReward.hybridSettings.enabled && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Hybrid Mode Details</h3>
                                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-amber-600 dark:text-amber-400 font-medium">Points Per Stamp</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-amber-500" />
                                                    {stampReward.hybridSettings.pointsPerStamp}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-amber-600 dark:text-amber-400 font-medium">Completion Bonus</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                                    {stampReward.hybridSettings.completionBonusPoints}
                                                </p>
                                            </div>
                                        </div>
                                        {stampReward.hybridSettings.pointsFallbackEnabled && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                                                ✓ Points fallback enabled if stamp cannot be awarded
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Terms & Conditions */}
                            {stampReward.termsAndConditions && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Terms & Conditions</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                        {stampReward.termsAndConditions}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Customer Preview & Stats */}
                        <div className="space-y-6">
                            {/* Customer Card Preview */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Customer Card Preview</h3>
                                <Card className="overflow-hidden shadow-xl">
                                    <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500" />
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-orange-100">
                                                {stampReward.image ? (
                                                    <Image
                                                        src={stampReward.image}
                                                        alt={stampReward.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Stamp className="h-6 w-6 text-orange-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{stampReward.title}</p>
                                                <p className="text-sm text-gray-500">{collectedStamps}/{stampReward.stampsRequired} stamps collected</p>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
                                            <div
                                                className="absolute h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                                                style={{ width: `${(collectedStamps / stampReward.stampsRequired) * 100}%` }}
                                            />
                                        </div>

                                        {/* Stamp slots */}
                                        <div className="grid gap-2" style={{
                                            gridTemplateColumns: `repeat(${Math.min(stampReward.stampsRequired, 5)}, 1fr)`
                                        }}>
                                            {Array.from({ length: Math.min(stampReward.stampsRequired, 10) }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${i < collectedStamps
                                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/50 shadow-lg shadow-orange-500/20 scale-105'
                                                        : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                                                        }`}
                                                >
                                                    {i < collectedStamps ? (
                                                        <span className="text-2xl">{stampReward.stampIcon || '⭐'}</span>
                                                    ) : (
                                                        <Stamp className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                                                    )}
                                                </div>
                                            ))}
                                            {stampReward.stampsRequired > 10 && (
                                                <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-400">+{stampReward.stampsRequired - 10}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reward locked/unlocked */}
                                        <div className={`mt-4 p-3 rounded-xl ${collectedStamps >= stampReward.stampsRequired
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800'
                                            : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                <Gift className={`h-5 w-5 ${collectedStamps >= stampReward.stampsRequired
                                                    ? 'text-green-600'
                                                    : 'text-gray-400'
                                                    }`} />
                                                <span className={`text-sm font-medium ${collectedStamps >= stampReward.stampsRequired
                                                    ? 'text-green-700 dark:text-green-400'
                                                    : 'text-gray-500'
                                                    }`}>
                                                    {collectedStamps >= stampReward.stampsRequired
                                                        ? '🎉 Reward Unlocked!'
                                                        : `${stampReward.stampsRequired - collectedStamps} more stamps to unlock`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Analytics Stats */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Performance Analytics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                                <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {stampReward.businessesActivated}
                                                </p>
                                                <p className="text-xs text-gray-500">Businesses Active</p>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                                                <Users className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {stampReward.customersEnrolled}
                                                </p>
                                                <p className="text-xs text-gray-500">Customers Enrolled</p>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                                <BarChart3 className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {stampReward.totalCompletions}
                                                </p>
                                                <p className="text-xs text-gray-500">Total Completions</p>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                                <Gift className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {stampReward.totalRedemptions}
                                                </p>
                                                <p className="text-xs text-gray-500">Total Redemptions</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="text-xs text-gray-400 space-y-1">
                                <p>Created: {new Date(stampReward.createdAt).toLocaleDateString()}</p>
                                <p>Last Updated: {new Date(stampReward.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                    {onDuplicate && (
                        <Button variant="outline" onClick={() => onDuplicate(stampReward.id)} className="gap-2">
                            <Copy className="h-4 w-4" />
                            Duplicate
                        </Button>
                    )}
                    {onEdit && (
                        <Button
                            onClick={() => onEdit(stampReward.id)}
                            className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                            Edit Template
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
