'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    CheckCircle2,
    QrCode,
    ShoppingCart,
    MapPin,
    Sparkles,
    Star,
    ChevronRight,
    Repeat
} from 'lucide-react';
import { ConsumerStampCard } from '@/services/consumer-stamp-rewards/types';
import { BENEFIT_TYPE_LABELS } from '@/services/stamp-rewards/types';

interface CustomerStampCardProps {
    stampCard: ConsumerStampCard;
    onViewDetails: (card: ConsumerStampCard) => void;
    onRedeem?: (card: ConsumerStampCard) => void;
}

const getTriggerIcon = (method: string) => {
    switch (method) {
        case 'qr_scan': return <QrCode className="h-4 w-4" />;
        case 'purchase': return <ShoppingCart className="h-4 w-4" />;
        case 'check_in': return <MapPin className="h-4 w-4" />;
        default: return <Stamp className="h-4 w-4" />;
    }
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'in_progress':
            return 'bg-blue-500/10 text-blue-600 border-blue-200';
        case 'completed':
            return 'bg-green-500/10 text-green-600 border-green-200';
        case 'redeemed':
            return 'bg-gray-500/10 text-gray-600 border-gray-200';
        case 'expired':
            return 'bg-red-500/10 text-red-600 border-red-200';
        default:
            return 'bg-gray-500/10 text-gray-600';
    }
};

const STATUS_LABELS: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Ready to Redeem!',
    redeemed: 'Redeemed',
    expired: 'Expired',
};

export default function CustomerStampCardComponent({
    stampCard,
    onViewDetails,
    onRedeem,
}: CustomerStampCardProps) {
    const { template, business } = stampCard;
    const progressPercent = (stampCard.stampsCollected / stampCard.stampsRequired) * 100;
    const isCompleted = stampCard.status === 'completed';
    const isRedeemed = stampCard.status === 'redeemed';

    // Calculate days until expiry
    const daysUntilExpiry = stampCard.expiresAt
        ? Math.ceil((new Date(stampCard.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <Card className={`group relative overflow-hidden border transition-all duration-300 hover:shadow-xl ${isCompleted
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-green-500/20'
                : isRedeemed
                    ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 opacity-75'
                    : 'border-gray-100 bg-white dark:bg-gray-900 hover:shadow-orange-500/10 hover:-translate-y-1'
            }`}>
            {/* Top gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${isCompleted
                    ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-400'
                    : isRedeemed
                        ? 'bg-gray-400'
                        : 'bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500'
                }`} />

            <CardContent className="p-5 pt-6">
                {/* Business info & status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-orange-100 dark:bg-orange-900/50 flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-lg">
                            {business.logo ? (
                                <Image
                                    src={business.logo}
                                    alt={business.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-orange-500">
                                    {business.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                {business.name}
                            </p>
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {template.title}
                            </h3>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 font-medium flex-shrink-0 ${getStatusStyles(stampCard.status)}`}
                    >
                        {STATUS_LABELS[stampCard.status]}
                    </Badge>
                </div>

                {/* Stamp Progress Visual */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {stampCard.stampsCollected} / {stampCard.stampsRequired} stamps
                        </span>
                        <span className="text-xs text-gray-500">
                            {Math.round(progressPercent)}% complete
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                        <div
                            className={`absolute h-full rounded-full transition-all duration-500 ${isCompleted
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : 'bg-gradient-to-r from-orange-500 to-orange-400'
                                }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Stamp slots */}
                    <div className="flex gap-1.5 flex-wrap justify-center">
                        {Array.from({ length: Math.min(stampCard.stampsRequired, 10) }).map((_, i) => (
                            <TooltipProvider key={i} delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all ${i < stampCard.stampsCollected
                                                    ? isCompleted
                                                        ? 'border-green-500 bg-green-100 dark:bg-green-900/50 shadow-lg shadow-green-500/20 scale-105'
                                                        : 'border-orange-500 bg-orange-100 dark:bg-orange-900/50 shadow-lg shadow-orange-500/20'
                                                    : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                                                }`}
                                        >
                                            {i < stampCard.stampsCollected ? (
                                                <span className="text-lg">{template.stampIcon || '⭐'}</span>
                                            ) : (
                                                <Stamp className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="z-[9999]">
                                        {i < stampCard.stampsCollected ? (
                                            <p>Stamp {i + 1} collected!</p>
                                        ) : (
                                            <p>Stamp {i + 1} - Not yet earned</p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                        {stampCard.stampsRequired > 10 && (
                            <div className="w-9 h-9 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-400">+{stampCard.stampsRequired - 10}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reward info */}
                <div className={`p-3 rounded-xl border mb-4 ${isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                        : 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-800/50'
                    }`}>
                    <div className="flex items-center gap-2">
                        <Gift className={`h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-orange-500'}`} />
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {BENEFIT_TYPE_LABELS[template.rewardBenefitType]}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {template.rewardBenefitValue}
                            </p>
                        </div>
                        {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 animate-pulse" />
                        )}
                    </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                        {getTriggerIcon(template.triggerMethod)}
                        <span>
                            {template.triggerMethod === 'qr_scan' && 'Scan to earn'}
                            {template.triggerMethod === 'purchase' && 'Earn on purchase'}
                            {template.triggerMethod === 'check_in' && 'Earn on check-in'}
                        </span>
                    </div>
                    {daysUntilExpiry !== null && daysUntilExpiry > 0 && stampCard.status !== 'redeemed' && (
                        <div className={`flex items-center gap-1 ${daysUntilExpiry <= 7 ? 'text-amber-600' : ''}`}>
                            <Clock className="h-3.5 w-3.5" />
                            <span>{daysUntilExpiry} days left</span>
                        </div>
                    )}
                </div>

                {/* Points earned (if hybrid) */}
                {stampCard.pointsEarned > 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">{stampCard.pointsEarned} points earned so far</span>
                        {template.hybridSettings.completionBonusPoints > 0 && !isCompleted && !isRedeemed && (
                            <span className="text-amber-500">
                                (+{template.hybridSettings.completionBonusPoints} bonus when complete!)
                            </span>
                        )}
                    </div>
                )}

                {/* Repeatable indicator */}
                {template.isRepeatable && isRedeemed && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Repeat className="h-4 w-4" />
                        <span className="font-medium">You can start this again!</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {isCompleted ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetails(stampCard)}
                                className="flex-1"
                            >
                                View Details
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onRedeem?.(stampCard)}
                                className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            >
                                <QrCode className="h-4 w-4" />
                                Redeem Now
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(stampCard)}
                            className="w-full justify-between group/btn"
                        >
                            <span>View Details</span>
                            <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
