'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Stamp,
    Gift,
    QrCode,
    ShoppingCart,
    MapPin,
    Sparkles,
    Repeat,
    Zap,
    Eye,
    Clock
} from 'lucide-react';
import {
    StampRewardResponse,
    TRIGGER_METHOD_LABELS,
    BENEFIT_TYPE_LABELS,
    BENEFIT_TYPE_ICONS,
} from '@/services/stamp-rewards/types';

interface StampTemplateCardProps {
    template: StampRewardResponse;
    onPreview: (template: StampRewardResponse) => void;
    onActivate: (template: StampRewardResponse) => void;
}

const getTriggerIcon = (method: string) => {
    switch (method) {
        case 'qr_scan': return <QrCode className="h-4 w-4" />;
        case 'purchase': return <ShoppingCart className="h-4 w-4" />;
        case 'check_in': return <MapPin className="h-4 w-4" />;
        default: return <Zap className="h-4 w-4" />;
    }
};

export default function StampTemplateCard({
    template,
    onPreview,
    onActivate,
}: StampTemplateCardProps) {
    return (
        <Card className="group relative overflow-visible border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1">
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500" />

            {/* Indicators */}
            <div className="absolute top-3 right-3 z-10 flex gap-2">
                {template.isRepeatable && (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                                    <Repeat className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="z-[9999]">
                                <p>Customers can earn this reward multiple times</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {template.hybridSettings.enabled && (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="z-[9999]">
                                <p>Hybrid Mode: {template.hybridSettings.pointsPerStamp} points per stamp</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            <CardContent className="p-5 pt-6">
                {/* Image and title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-lg">
                        {template.image && (template.image.startsWith('http') || template.image.startsWith('/')) ? (
                            <Image
                                src={template.image}
                                alt={template.title}
                                fill
                                className="object-cover"
                            />
                        ) : template.image ? (
                            <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                {template.image}
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Stamp className="h-8 w-8 text-orange-500" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                            {template.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            {getTriggerIcon(template.triggerMethod)}
                                            <span>{TRIGGER_METHOD_LABELS[template.triggerMethod]}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="z-[9999]">
                                        <p>How customers earn stamps</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                    {template.description}
                </p>

                {/* Stamp count indicator */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50">
                    <div className="flex items-center gap-2">
                        <Stamp className="h-5 w-5 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Stamps Required
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(template.stampsRequired, 6) }).map((_, i) => (
                            <div key={i} className="w-5 h-5 rounded-md bg-orange-200 dark:bg-orange-800 flex items-center justify-center">
                                <span className="text-xs">{template.stampIcon || '⭐'}</span>
                            </div>
                        ))}
                        {template.stampsRequired > 6 && (
                            <span className="text-xs font-bold text-orange-600 ml-1">+{template.stampsRequired - 6}</span>
                        )}
                    </div>
                </div>

                {/* Reward benefit */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/50 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <Gift className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {BENEFIT_TYPE_ICONS[template.rewardBenefitType]} {BENEFIT_TYPE_LABELS[template.rewardBenefitType]}
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {template.rewardBenefitValue}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Expiration info */}
                {(template.expirationRules.stampValidityDays || template.expirationRules.rewardClaimDays) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <Clock className="h-3.5 w-3.5" />
                        {template.expirationRules.stampValidityDays && (
                            <span>Stamps valid for {template.expirationRules.stampValidityDays} days</span>
                        )}
                    </div>
                )}

                {/* Businesses using this template */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <span>{template.businessesActivated} businesses using</span>
                    <span>{template.totalCompletions} completions</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPreview(template)}
                        className="flex-1 gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        Preview
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onActivate(template)}
                        className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                        <Zap className="h-4 w-4" />
                        Activate
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
