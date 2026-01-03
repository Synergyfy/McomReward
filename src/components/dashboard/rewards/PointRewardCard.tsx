'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { MoreVertical, Edit, Trash2, Gift, Star, Stamp } from 'lucide-react';
import { BusinessReward } from '@/services/business-reward/types';

interface PointRewardCardProps {
    reward: BusinessReward;
    onEdit: (reward: BusinessReward) => void;
    onDelete: (reward: BusinessReward) => void;
    onView?: (reward: any) => void;
    onAwardStamp?: (reward: any) => void;
    variant?: 'standard' | 'stamp-card' | 'hybrid';
}

export default function PointRewardCard({
    reward,
    onEdit,
    onDelete,
    onView,
    onAwardStamp,
    variant = 'standard',
}: PointRewardCardProps) {
    const isStampCard = variant === 'stamp-card';
    const isHybrid = variant === 'hybrid';

    // Determine colors based on variant
    let borderClass = 'border-blue-100 dark:border-blue-900/30 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10';
    let headerIconBg = 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50';

    if (isStampCard) {
        borderClass = 'border-orange-100 dark:border-orange-900/30 hover:border-orange-300 bg-white dark:bg-gray-900';
        headerIconBg = 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 ring-2 ring-white dark:ring-gray-800';
    } else if (isHybrid) {
        borderClass = 'border-purple-100 dark:border-purple-900/30 hover:border-purple-300 bg-white dark:bg-gray-900';
        headerIconBg = 'bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900/50 dark:to-fuchsia-900/50 ring-2 ring-white dark:ring-gray-800';
    }

    // Determine Logic Flags
    const hasStamps = reward.is_stamps_enabled || reward.isStampsEnabled || (Number(reward.stampsRequired) > 0) || (Number(reward.stamps_required) > 0);
    const hasPoints = reward.is_points_enabled || reward.isPointsEnabled || (Number(reward.pointsRequired) > 0) || (Number(reward.points_required) > 0) || (Number(reward.pointRequired) > 0);

    return (
        <Card className={`group relative flex flex-col hover:shadow-xl transition-all duration-300 ${borderClass}`}>
            {isStampCard && !isHybrid && (
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${!reward.disabled
                    ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400'
                    : 'bg-gray-400'
                    }`} />
            )}
            {isHybrid && (
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${!reward.disabled
                    ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-400'
                    : 'bg-gray-400'
                    }`} />
            )}
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`relative w-14 h-14 rounded-xl overflow-hidden shadow-md ${headerIconBg}`}>
                            {reward.image && (reward.image.startsWith('http') || reward.image.startsWith('/')) ? (
                                <Image
                                    src={reward.image}
                                    alt={reward.title}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            ) : reward.image ? (
                                <div className="flex items-center justify-center h-full text-3xl">
                                    {reward.image}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    {isStampCard ? (
                                        <Stamp className="h-7 w-7 text-orange-500" />
                                    ) : isHybrid ? (
                                        <Star className="h-7 w-7 text-purple-500" />
                                    ) : (
                                        <Gift className="h-7 w-7 text-blue-500" />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-1">
                                {reward.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge
                                    variant={!reward.disabled ? 'default' : 'secondary'}
                                    className={!reward.disabled
                                        ? (isStampCard ? 'bg-emerald-500 hover:bg-emerald-600' : isHybrid ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600')
                                        : ''
                                    }
                                >
                                    {!reward.disabled ? 'Active' : 'Disabled'}
                                </Badge>
                                {(reward.is_points_enabled || reward.isPointsEnabled) && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                                        <Gift className="h-3 w-3 mr-1" />
                                        Points
                                    </Badge>
                                )}
                                {(reward.is_stamps_enabled || reward.isStampsEnabled) && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                        <Stamp className="h-3 w-3 mr-1" />
                                        Stamps
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-gray-600"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onView && (
                                <DropdownMenuItem onClick={() => onView(reward)}>
                                    <Star className="h-4 w-4 mr-2" />
                                    View Customers
                                </DropdownMenuItem>
                            )}
                            {onAwardStamp && (
                                <DropdownMenuItem onClick={() => onAwardStamp(reward)}>
                                    <Stamp className="h-4 w-4 mr-2" />
                                    Award Stamp
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEdit(reward)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(reward)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-grow pt-0">
                {/* Gallery Preview */}
                {reward.gallery && reward.gallery.length > 0 && (
                    <div className="mb-3">
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {reward.gallery.slice(0, 3).map((img, index) => (
                                <div
                                    key={index}
                                    className="relative w-8 h-8 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200"
                                >
                                    <Image
                                        src={img}
                                        alt={`Gallery ${index + 1}`}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                            ))}
                            {reward.gallery.length > 3 && (
                                <div className="w-8 h-8 flex-shrink-0 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">+{reward.gallery.length - 3}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {reward.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Stamps Requirement */}
                    {hasStamps && (
                        <div className={`p-3 rounded-lg text-center ${isStampCard || isHybrid ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
                            {(isStampCard || isHybrid) ? (
                                <div className="flex flex-col items-center">
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1.5 max-w-[180px]">
                                        {Array.from({ length: Math.min(Number(reward.stampsRequired ?? reward.stamps_required ?? 0), 10) }).map((_, i) => {
                                            const iconSrc = reward.stamp_emoji || reward.emoji;
                                            return (
                                                <div key={i} className="relative w-5 h-5 flex-shrink-0">
                                                    {iconSrc && (iconSrc.startsWith('http') || iconSrc.startsWith('/')) ? (
                                                        <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm ring-1 ring-orange-200 bg-white">
                                                            <Image
                                                                src={iconSrc}
                                                                alt="Stamp"
                                                                layout="fill"
                                                                objectFit="cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xl leading-none block drop-shadow-sm">{iconSrc || '⭐️'}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {(Number(reward.stampsRequired ?? reward.stamps_required ?? 0) > 10) && (
                                            <div className="flex items-center justify-center h-5 w-auto px-1.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                                                +{Number(reward.stampsRequired ?? reward.stamps_required ?? 0) - 10}
                                            </div>
                                        )}
                                        {(Number(reward.stampsRequired ?? reward.stamps_required ?? 0) === 0) && (
                                            <span className="text-gray-400 text-sm">0</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                        {reward.stampsRequired ?? reward.stamps_required ?? 0} Stamps Required
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                                        <Stamp className="h-3.5 w-3.5" />
                                        <span className="text-lg font-bold">
                                            {reward.stampsRequired ?? reward.stamps_required ?? 0}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stamps Required</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Points Requirement */}
                    {hasPoints && (
                        <div className={`p-2.5 rounded-lg text-center ${(isStampCard || isHybrid) ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                                <Star className="h-3.5 w-3.5" />
                                <span className="text-lg font-bold">
                                    {reward.pointsRequired ?? reward.points_required ?? reward.pointRequired ?? 0}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Points Required</p>
                        </div>
                    )}

                    {/* Fallback if neither */}
                    {!hasStamps && !hasPoints && (
                        <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">0</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Points Required</p>
                        </div>
                    )}

                    <div className={`p-2.5 rounded-lg text-center ${isStampCard || isHybrid ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800' : 'bg-gray-50 dark:bg-gray-800'} ${hasStamps && hasPoints ? 'col-span-2' : ''}`}>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {reward.quantity ?? '∞'}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                    </div>
                </div>



                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className={`p-2.5 rounded-lg text-center border ${isStampCard ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/30' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30'}`}>
                        <span className={`text-lg font-bold ${isStampCard ? 'text-purple-600 dark:text-purple-400' : 'text-purple-700 dark:text-purple-400'}`}>
                            {reward.totalRedemptions ?? 0}
                        </span>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-500 mt-0.5">Total Redemptions</p>
                    </div>
                    <div className={`p-2.5 rounded-lg text-center border ${isStampCard ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/30' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30'}`}>
                        <span className={`text-lg font-bold ${isStampCard ? 'text-orange-600 dark:text-orange-400' : 'text-orange-700 dark:text-orange-400'}`}>
                            {reward.totalPointsRedeemed ?? 0}
                        </span>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-orange-500 mt-0.5">Points Redeemed</p>
                    </div>
                </div>

                {isStampCard && (onView || onAwardStamp) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        {onView && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onView(reward)}
                                className="flex-1 text-xs h-8"
                            >
                                Customers
                            </Button>
                        )}
                        {onAwardStamp && (
                            <Button
                                size="sm"
                                onClick={() => onAwardStamp(reward)}
                                className="flex-1 text-xs h-8 bg-orange-600 hover:bg-orange-700"
                            >
                                Award
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
