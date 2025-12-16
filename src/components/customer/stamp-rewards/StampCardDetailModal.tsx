'use client';

import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Stamp,
    Gift,
    Clock,
    CheckCircle2,
    QrCode,
    ShoppingCart,
    MapPin,
    X,
    Star,
    History,
    Info,
    Sparkles,
    Calendar,
    Award
} from 'lucide-react';
import { ConsumerStampCard } from '@/services/consumer-stamp-rewards/types';
import { BENEFIT_TYPE_LABELS, TRIGGER_METHOD_LABELS } from '@/services/stamp-rewards/types';

interface StampCardDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    stampCard: ConsumerStampCard | null;
    onRedeem?: (card: ConsumerStampCard) => void;
}

const getTriggerIcon = (method: string) => {
    switch (method) {
        case 'qr_scan': return <QrCode className="h-5 w-5" />;
        case 'purchase': return <ShoppingCart className="h-5 w-5" />;
        case 'check_in': return <MapPin className="h-5 w-5" />;
        default: return <Stamp className="h-5 w-5" />;
    }
};

export default function StampCardDetailModal({
    isOpen,
    onClose,
    stampCard,
    onRedeem,
}: StampCardDetailModalProps) {
    if (!stampCard) return null;

    const { template, business } = stampCard;
    const progressPercent = (stampCard.stampsCollected / stampCard.stampsRequired) * 100;
    const isCompleted = stampCard.status === 'completed';
    const isRedeemed = stampCard.status === 'redeemed';

    const daysUntilExpiry = stampCard.expiresAt
        ? Math.ceil((new Date(stampCard.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col p-0">
                {/* Header with image */}
                <div className="relative h-40 bg-gradient-to-br from-orange-500 to-amber-500">
                    {template.image && (
                        <Image
                            src={template.image}
                            alt={template.title}
                            fill
                            className="object-cover opacity-40"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors z-10"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>

                    {/* Business logo */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shadow-xl ring-2 ring-white">
                            {business.logo ? (
                                <Image
                                    src={business.logo}
                                    alt={business.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-orange-500 bg-orange-100">
                                    {business.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">{business.name}</p>
                            <DialogHeader className="p-0">
                                <DialogTitle className="text-xl text-white font-bold">
                                    {template.title}
                                </DialogTitle>
                            </DialogHeader>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <Tabs defaultValue="progress" className="space-y-4">
                        <TabsList className="grid grid-cols-3 w-full">
                            <TabsTrigger value="progress" className="gap-1 text-xs">
                                <Stamp className="h-3.5 w-3.5" />
                                Progress
                            </TabsTrigger>
                            <TabsTrigger value="history" className="gap-1 text-xs">
                                <History className="h-3.5 w-3.5" />
                                History
                            </TabsTrigger>
                            <TabsTrigger value="details" className="gap-1 text-xs">
                                <Info className="h-3.5 w-3.5" />
                                Details
                            </TabsTrigger>
                        </TabsList>

                        {/* Progress Tab */}
                        <TabsContent value="progress" className="space-y-4">
                            {/* Progress summary */}
                            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl">
                                <div className="text-4xl font-bold text-orange-600 mb-1">
                                    {stampCard.stampsCollected} / {stampCard.stampsRequired}
                                </div>
                                <p className="text-sm text-gray-500">Stamps Collected</p>
                                <Progress
                                    value={progressPercent}
                                    className="h-3 mt-3"
                                />
                            </div>

                            {/* Stamp grid */}
                            <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: stampCard.stampsRequired }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${i < stampCard.stampsCollected
                                                ? isCompleted
                                                    ? 'border-green-500 bg-green-100 dark:bg-green-900/50 shadow-lg'
                                                    : 'border-orange-500 bg-orange-100 dark:bg-orange-900/50 shadow-lg'
                                                : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                                            }`}
                                    >
                                        {i < stampCard.stampsCollected ? (
                                            <span className="text-xl">{template.stampIcon || '⭐'}</span>
                                        ) : (
                                            <span className="text-xs text-gray-400">{i + 1}</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Reward preview */}
                            <Card className={`border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${isCompleted ? 'bg-green-100' : 'bg-amber-100'}`}>
                                            <Gift className={`h-6 w-6 ${isCompleted ? 'text-green-600' : 'text-amber-600'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-amber-600'}`}>
                                                {isCompleted ? '🎉 Your Reward is Ready!' : 'Complete all stamps to unlock:'}
                                            </p>
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                {template.rewardBenefitValue}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Points earned */}
                            {stampCard.pointsEarned > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                    <Star className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="font-medium text-purple-600">{stampCard.pointsEarned} points earned</p>
                                        {template.hybridSettings.completionBonusPoints > 0 && !isCompleted && (
                                            <p className="text-xs text-purple-400">
                                                +{template.hybridSettings.completionBonusPoints} bonus when you complete!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="space-y-3">
                            {stampCard.stampHistory.length === 0 ? (
                                <div className="text-center p-8 text-gray-500">
                                    <Stamp className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                    <p>No stamps collected yet</p>
                                    <p className="text-sm">Visit {business.name} to earn your first stamp!</p>
                                </div>
                            ) : (
                                stampCard.stampHistory.map((stamp, index) => (
                                    <div key={stamp.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                                            <span className="text-lg">{template.stampIcon || '⭐'}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                Stamp #{stamp.stampNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(stamp.awardedAt).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {stamp.pointsAwarded && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{stamp.pointsAwarded} pts
                                            </Badge>
                                        )}
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        {/* Details Tab */}
                        <TabsContent value="details" className="space-y-4">
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">How to earn stamps</p>
                                    <div className="flex items-center gap-2">
                                        {getTriggerIcon(template.triggerMethod)}
                                        <span className="font-medium">{TRIGGER_METHOD_LABELS[template.triggerMethod]}</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Reward Type</p>
                                    <div className="flex items-center gap-2">
                                        <Gift className="h-5 w-5 text-green-500" />
                                        <span className="font-medium">{BENEFIT_TYPE_LABELS[template.rewardBenefitType]}</span>
                                    </div>
                                </div>

                                {daysUntilExpiry !== null && (
                                    <div className={`p-3 rounded-xl ${daysUntilExpiry <= 7 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                        <p className="text-xs text-gray-500 mb-1">Expires</p>
                                        <div className="flex items-center gap-2">
                                            <Clock className={`h-5 w-5 ${daysUntilExpiry <= 7 ? 'text-amber-500' : 'text-gray-500'}`} />
                                            <span className={`font-medium ${daysUntilExpiry <= 7 ? 'text-amber-600' : ''}`}>
                                                {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Started</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-gray-500" />
                                        <span className="font-medium">
                                            {new Date(stampCard.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {template.termsAndConditions && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Terms & Conditions</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                            {template.termsAndConditions}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                    {isCompleted ? (
                        <Button
                            onClick={() => onRedeem?.(stampCard)}
                            className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        >
                            <QrCode className="h-5 w-5" />
                            Redeem Your Reward
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full"
                        >
                            Close
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
