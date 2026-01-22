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
    Stamp,
    Coins,
    Sparkles,
    Gift,
    Repeat,
    Users,
    Trophy,
    Award
} from 'lucide-react';
import { RewardResponse } from '@/services/rewards/types';

interface AdminUnifiedRewardCardProps {
    reward: RewardResponse;
    onEdit: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

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

export default function AdminUnifiedRewardCard({
    reward,
    onEdit,
    onDuplicate,
    onDelete,
}: AdminUnifiedRewardCardProps) {
    // Helper to get diverse properties safely
    const getMaxStamps = () => {
        // Check for all possible variations of the property
        return reward.max_stamps_required ||
            (reward as any).maxStampsRequired ||
            (reward as any).maxStamps ||
            0;
    };

    const maxStamps = getMaxStamps();

    // Defensive check: explicitly check for true, or if max_stamps > 0 assume enabled as fallback
    // We strictly check logic: if maxStamps > 0, it MUST be a stamp reward or hybrid, regardless of the flag
    const isPoints = reward.is_points_enabled === true || (reward.is_points_enabled !== false && (!!reward.pointRequired || !!reward.maxPoints));
    const isStamps = reward.is_stamps_enabled === true || (reward.is_stamps_enabled !== false && maxStamps > 0) || maxStamps > 0;
    const isHybrid = isPoints && isStamps;

    const maxPoints = reward.maxPoints || reward.max_points || reward.pointRequired || 0;
    const stampIcon = reward.stamp_emoji || '⭐';

    const getCardAccent = () => {
        if (isHybrid) return 'from-purple-500 via-purple-400 to-indigo-500';
        if (isStamps) return 'from-orange-500 via-orange-400 to-amber-500';
        return 'from-blue-500 via-blue-400 to-cyan-500';
    };

    return (
        <Card className="group relative overflow-visible border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 hover:shadow-xl hover:shadow-gray-500/10 transition-all duration-300 hover:-translate-y-1">
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCardAccent()}`} />

            {/* Type Indicator Icon */}
            <div className="absolute top-3 right-3 z-10">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={`p-1.5 rounded-full ${isHybrid ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600' :
                                isStamps ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600' :
                                    'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
                                }`}>
                                {isHybrid ? <Sparkles className="h-3.5 w-3.5" /> :
                                    isStamps ? <Stamp className="h-3.5 w-3.5" /> :
                                        <Coins className="h-3.5 w-3.5" />}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" sideOffset={5}>
                            <p>{isHybrid ? 'Hybrid Reward' : isStamps ? 'Stamp Reward' : 'Point Reward'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <CardHeader className="pb-3 pt-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-lg ${isHybrid ? 'bg-gradient-to-br from-purple-100 to-indigo-100' :
                            isStamps ? 'bg-gradient-to-br from-orange-100 to-amber-100' :
                                'bg-gradient-to-br from-blue-100 to-cyan-100'
                            }`}>
                            {reward.image ? (
                                <Image
                                    src={reward.image}
                                    alt={reward.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Gift className={`h-7 w-7 ${isHybrid ? 'text-purple-500' :
                                        isStamps ? 'text-orange-500' :
                                            'text-blue-500'
                                        }`} />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {reward.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {isHybrid ? (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">Hybrid</Badge>
                                ) : isStamps ? (
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">Stamp</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Point</Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] px-2 py-0.5 font-medium ${getStatusStyles(reward.status)}`}
                                >
                                    {reward.status.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-medium text-gray-600">
                                    £{reward.value} Value
                                </span>
                            </div>
                        </div>
                    </div>

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
                                <DropdownMenuItem onClick={() => onEdit(reward.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDuplicate(reward.id)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(reward.id)}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                    {reward.description}
                </p>

                {/* Mechanics Visualization */}
                <div className="space-y-3">
                    {/* Points Display */}
                    {isPoints && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center gap-2">
                                <Coins className="h-4 w-4 text-blue-500" />
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Points Required</span>
                            </div>
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{maxPoints} pts</span>
                        </div>
                    )}

                    {/* Stamps Display */}
                    {isStamps && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                    <Stamp className="h-3.5 w-3.5" />
                                    Stamps
                                </span>
                                <span className="text-xs font-bold text-orange-600">
                                    {maxStamps} required
                                </span>
                            </div>

                            {/* Mini Stamp Slots */}
                            <div className="flex gap-1 flex-wrap">
                                {Array.from({ length: Math.min(maxStamps, 20) }).map((_, i) => (
                                    <div key={i} className="w-6 h-6 rounded border border-dashed border-orange-200 bg-orange-50/50 flex items-center justify-center text-xs text-orange-400">
                                        {stampIcon}
                                    </div>
                                ))}
                                {maxStamps > 20 && (
                                    <div className="w-6 h-6 rounded border border-dashed border-orange-200 bg-orange-50/50 flex items-center justify-center text-[10px] text-orange-400">
                                        +{maxStamps - 20}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Claimed
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {reward.businessClaimedCount || 0}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Redeemed
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {reward.totalRedemptionsCount || 0}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            Points
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {(reward.totalPointsRedeemed || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium flex items-center gap-1">
                            <Stamp className="h-3 w-3" />
                            Stamps
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {reward.totalStampsRedeemed || 0}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
