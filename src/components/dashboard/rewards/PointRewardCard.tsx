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
}

export default function PointRewardCard({
    reward,
    onEdit,
    onDelete,
}: PointRewardCardProps) {
    return (
        <Card className="flex flex-col hover:shadow-lg transition-all duration-200 border-blue-100 dark:border-blue-900/30 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 shadow-md">
                            {reward.image ? (
                                <Image
                                    src={reward.image}
                                    alt={reward.title}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Gift className="h-7 w-7 text-blue-500" />
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
                                        ? 'bg-blue-500 hover:bg-blue-600'
                                        : ''
                                    }
                                >
                                    {!reward.disabled ? 'Active' : 'Disabled'}
                                </Badge>
                                {reward.is_points_enabled && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                                        <Gift className="h-3 w-3 mr-1" />
                                        Points
                                    </Badge>
                                )}
                                {reward.is_stamps_enabled && (
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
                    {reward.is_points_enabled ? (
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
                            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                                <Star className="h-3.5 w-3.5" />
                                <span className="text-lg font-bold">
                                    {reward.points_required ?? (reward as any).pointsRequired ?? reward.pointRequired ?? 0}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Points Required</p>
                        </div>
                    ) : reward.is_stamps_enabled ? (
                        <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-center">
                            <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                                <Stamp className="h-3.5 w-3.5" />
                                <span className="text-lg font-bold">
                                    {reward.stamps_required ?? reward.stampsRequired ?? 0}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Stamps Required</p>
                        </div>
                    ) : (
                        <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {reward.points_required ?? 0}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Points Required</p>
                        </div>
                    )}

                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {reward.quantity ?? '∞'}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                    </div>
                </div>

                {reward.is_points_enabled && reward.is_stamps_enabled && (
                    <div className="mt-3 p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-center border border-orange-100 dark:border-orange-800/30">
                        <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                            <Stamp className="h-3.5 w-3.5" />
                            <span className="text-lg font-bold">
                                {reward.stamps_required ?? reward.stampsRequired ?? 0}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Stamps Required</p>
                    </div>
                )}

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center border border-purple-100 dark:border-purple-800/30">
                        <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
                            {reward.totalRedemptions ?? 0}
                        </span>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-500 mt-0.5">Total Redemptions</p>
                    </div>
                    <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center border border-orange-100 dark:border-orange-800/30">
                        <span className="text-lg font-bold text-orange-700 dark:text-orange-400">
                            {reward.totalPointsRedeemed ?? 0}
                        </span>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-orange-500 mt-0.5">Points Redeemed</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
