'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    MoreVertical,
    Edit,
    Copy,
    Trash2,
    Eye,
    Stamp,
    Zap,
    Users,
    BarChart3,
    Clock,
    Repeat,
    Gift,
    QrCode,
    MapPin,
    ShoppingCart,
    Sparkles
} from 'lucide-react';
import {
    StampRewardResponse,
    TRIGGER_METHOD_LABELS,
    BENEFIT_TYPE_LABELS,
    BENEFIT_TYPE_ICONS,
    STATUS_LABELS
} from '@/services/stamp-rewards/types';

interface StampRewardCardProps {
    stampReward: StampRewardResponse;
    onEdit: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onPreview: (id: string) => void;
    onPublish?: (id: string) => void;
    onArchive?: (id: string) => void;
}

const getTriggerIcon = (method: string) => {
    switch (method) {
        case 'qr_scan':
            return <QrCode className="h-3.5 w-3.5" />;
        case 'purchase':
            return <ShoppingCart className="h-3.5 w-3.5" />;
        case 'check_in':
            return <MapPin className="h-3.5 w-3.5" />;
        default:
            return <Zap className="h-3.5 w-3.5" />;
    }
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800';
        case 'draft':
            return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800';
        case 'archived':
            return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-700';
        default:
            return 'bg-gray-500/10 text-gray-600';
    }
};

export default function StampRewardCard({
    stampReward,
    onEdit,
    onDuplicate,
    onDelete,
    onPreview,
    onPublish,
    onArchive,
}: StampRewardCardProps) {
    return (
        <Card className="group relative overflow-visible border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1">
            {/* Gradient accent bar - Orange brand color */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500" />

            {/* Repeatable indicator */}
            {stampReward.isRepeatable && (
                <div className="absolute top-3 right-3 z-10">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                                    <Repeat className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" sideOffset={5} className="z-[9999]">
                                <p>Customers can earn this reward multiple times</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}

            {/* Hybrid mode indicator */}
            {stampReward.hybridSettings.enabled && (
                <div className="absolute top-3 right-12 z-10">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" sideOffset={5} className="z-[9999]">
                                <p>Hybrid Mode: {stampReward.hybridSettings.pointsPerStamp} points per stamp</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}

            <CardHeader className="pb-3 pt-5">
                <div className="flex items-start justify-between gap-3">
                    {/* Image and title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-lg">
                            {stampReward.image ? (
                                <Image
                                    src={stampReward.image}
                                    alt={stampReward.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Stamp className="h-7 w-7 text-orange-500" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {stampReward.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] px-2 py-0.5 font-medium ${getStatusStyles(stampReward.status)}`}
                                >
                                    {STATUS_LABELS[stampReward.status]}
                                </Badge>
                                <span className="text-xs text-gray-400">•</span>
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                {getTriggerIcon(stampReward.triggerMethod)}
                                                <span className="hidden sm:inline">{TRIGGER_METHOD_LABELS[stampReward.triggerMethod]}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" sideOffset={5} className="z-[9999]">
                                            <p>Trigger: {TRIGGER_METHOD_LABELS[stampReward.triggerMethod]}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>

                    {/* Actions dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 z-[9999]">
                            <DropdownMenuItem onClick={() => onPreview(stampReward.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(stampReward.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate(stampReward.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </DropdownMenuItem>
                            {stampReward.status === 'draft' && onPublish && (
                                <DropdownMenuItem onClick={() => onPublish(stampReward.id)}>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Publish
                                </DropdownMenuItem>
                            )}
                            {stampReward.status === 'active' && onArchive && (
                                <DropdownMenuItem onClick={() => onArchive(stampReward.id)}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Archive
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(stampReward.id)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4 overflow-visible">
                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                    {stampReward.description}
                </p>

                {/* Stamp progress visualization */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 cursor-help">
                                        <Stamp className="h-3.5 w-3.5" />
                                        Stamps Required
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={5} className="z-[9999]">
                                    <p>Number of stamps customers must collect to unlock the reward</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                            {stampReward.stampsRequired} stamps
                        </span>
                    </div>

                    {/* Visual stamp slots - Orange themed */}
                    <div className="flex gap-1.5 flex-wrap">
                        {Array.from({ length: Math.min(stampReward.stampsRequired, 10) }).map((_, index) => (
                            <div
                                key={index}
                                className="w-8 h-8 rounded-lg border-2 border-dashed border-orange-200 dark:border-orange-800 flex items-center justify-center bg-orange-50/50 dark:bg-orange-900/20"
                            >
                                {stampReward.stampIcon ? (
                                    <span className="text-sm">{stampReward.stampIcon}</span>
                                ) : (
                                    <Stamp className="h-4 w-4 text-orange-300 dark:text-orange-700" />
                                )}
                            </div>
                        ))}
                        {stampReward.stampsRequired > 10 && (
                            <div className="w-8 h-8 rounded-lg border-2 border-dashed border-orange-200 dark:border-orange-800 flex items-center justify-center bg-orange-50/50 dark:bg-orange-900/20">
                                <span className="text-xs font-medium text-orange-400">+{stampReward.stampsRequired - 10}</span>
                            </div>
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
                                {BENEFIT_TYPE_ICONS[stampReward.rewardBenefitType]} {BENEFIT_TYPE_LABELS[stampReward.rewardBenefitType]}
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {stampReward.rewardBenefitValue}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 cursor-help hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Users className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {stampReward.businessesActivated}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Businesses</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={5} className="z-[9999]">
                                <p>Number of businesses that have activated this template</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 cursor-help hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <BarChart3 className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {stampReward.totalCompletions}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Completed</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={5} className="z-[9999]">
                                <p>Total number of customers who completed all stamps</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 cursor-help hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Gift className="h-4 w-4 mx-auto text-green-500 mb-1" />
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {stampReward.totalRedemptions}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Redeemed</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={5} className="z-[9999]">
                                <p>Total number of rewards that have been redeemed</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Expiration info */}
                {(stampReward.expirationRules.stampValidityDays || stampReward.expirationRules.rewardClaimDays) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3.5 w-3.5" />
                            {stampReward.expirationRules.stampValidityDays && (
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-help">
                                                Stamps expire in {stampReward.expirationRules.stampValidityDays} days
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={5} className="z-[9999]">
                                            <p>Individual stamps will expire after this many days if not completed</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {stampReward.expirationRules.stampValidityDays && stampReward.expirationRules.rewardClaimDays && (
                                <span>•</span>
                            )}
                            {stampReward.expirationRules.rewardClaimDays && (
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-help">
                                                Claim within {stampReward.expirationRules.rewardClaimDays} days
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={5} className="z-[9999]">
                                            <p>Customers must claim their reward within this many days after completing all stamps</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
