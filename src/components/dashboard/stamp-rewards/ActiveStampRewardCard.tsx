'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
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
    Stamp,
    Gift,
    Users,
    BarChart3,
    QrCode,
    Pause,
    Play,
    Trash2,
    Eye,
    Award,
    CheckCircle2
} from 'lucide-react';
import { BusinessStampReward } from '@/services/business-stamp-rewards/types';
import { TRIGGER_METHOD_LABELS, BENEFIT_TYPE_LABELS } from '@/services/stamp-rewards/types';

interface ActiveStampRewardCardProps {
    reward: BusinessStampReward;
    onView: (reward: BusinessStampReward) => void;
    onPause?: (id: string) => void;
    onResume?: (id: string) => void;
    onDeactivate: (id: string) => void;
    onAwardStamp: (reward: BusinessStampReward) => void;
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
        case 'paused':
            return 'bg-amber-500/10 text-amber-600 border-amber-200';
        case 'expired':
            return 'bg-gray-500/10 text-gray-600 border-gray-200';
        default:
            return 'bg-gray-500/10 text-gray-600';
    }
};

const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    paused: 'Paused',
    expired: 'Expired',
};

export default function ActiveStampRewardCard({
    reward,
    onView,
    onPause,
    onResume,
    onDeactivate,
    onAwardStamp,
}: ActiveStampRewardCardProps) {
    const { template } = reward;

    if (!template) {
        return null;
    }
    const completionRate = reward.customersEnrolled > 0
        ? Math.round((reward.customersCompleted / reward.customersEnrolled) * 100)
        : 0;
    const redemptionRate = reward.customersCompleted > 0
        ? Math.round((reward.totalRedemptions / reward.customersCompleted) * 100)
        : 0;

    return (
        <Card className="group relative overflow-visible border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${reward.status === 'active'
                ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400'
                : reward.status === 'paused'
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400'
                    : 'bg-gray-400'
                }`} />

            <CardContent className="p-5 pt-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-lg">
                            {(reward.customImage || template.image) && ((reward.customImage || template.image || '').startsWith('http') || (reward.customImage || template.image || '').startsWith('/')) ? (
                                <Image
                                    src={reward.customImage || template.image || ''}
                                    alt={template.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (reward.customImage || template.image) ? (
                                <div className="absolute inset-0 flex items-center justify-center text-3xl">
                                    {reward.customImage || template.image}
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Stamp className="h-7 w-7 text-orange-500" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {template.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] px-2 py-0.5 font-medium ${getStatusStyles(reward.status)}`}
                                >
                                    {STATUS_LABELS[reward.status]}
                                </Badge>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                    {template.stampsRequired} stamps
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 z-[9999]">
                            <DropdownMenuItem onClick={() => onView(reward)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAwardStamp(reward)}>
                                <QrCode className="mr-2 h-4 w-4" />
                                Award Stamp
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {reward.status === 'active' && onPause && (
                                <DropdownMenuItem onClick={() => onPause(reward.id)}>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause
                                </DropdownMenuItem>
                            )}
                            {reward.status === 'paused' && onResume && (
                                <DropdownMenuItem onClick={() => onResume(reward.id)}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Resume
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDeactivate(reward.id)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deactivate
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Reward benefit */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/50 mb-4">
                    <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {template.rewardBenefitValue}
                        </span>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 cursor-help">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Enrolled</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {reward.customersEnrolled}
                                    </p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="z-[9999]">
                                <p>Total customers who started collecting stamps</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 cursor-help">
                                    <div className="flex items-center gap-2 mb-1">
                                        {(template.stampIcon) ? (
                                            (template.stampIcon.startsWith('http') || template.stampIcon.startsWith('/')) ? (
                                                <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={template.stampIcon}
                                                        alt="Stamp"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-sm leading-none">{template.stampIcon}</span>
                                            )
                                        ) : (
                                            <Stamp className="h-4 w-4 text-orange-500" />
                                        )}
                                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Stamps</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {reward.stampsAwarded}
                                    </p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="z-[9999]">
                                <p>Total stamps awarded to customers</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 cursor-help">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Completed</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {reward.customersCompleted}
                                    </p>
                                    <p className="text-[10px] text-purple-500">{completionRate}% rate</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="z-[9999]">
                                <p>Customers who collected all stamps</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 cursor-help">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Award className="h-4 w-4 text-green-500" />
                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Redeemed</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {reward.totalRedemptions}
                                    </p>
                                    <p className="text-[10px] text-green-500">{redemptionRate}% rate</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="z-[9999]">
                                <p>Rewards claimed by customers</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(reward)}
                        className="flex-1 gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        View Customers
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onAwardStamp(reward)}
                        disabled={reward.status !== 'active'}
                        className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
                    >
                        <QrCode className="h-4 w-4" />
                        Award Stamp
                    </Button>
                </div>

                {/* Activated date */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 text-center">
                    Activated {new Date(reward.activatedAt).toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    );
}
