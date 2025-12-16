'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    CheckCircle2,
    QrCode,
    ShoppingCart,
    MapPin,
    Download,
    Share2,
    X,
    Sparkles,
    Calendar,
    MapPinned,
    Copy,
    Check
} from 'lucide-react';
import { ConsumerStampCard, StampCardRedemptionQR } from '@/services/consumer-stamp-rewards/types';
import { BENEFIT_TYPE_LABELS } from '@/services/stamp-rewards/types';
import { useGetRedemptionQR } from '@/services/consumer-stamp-rewards/hook';
import toast from 'react-hot-toast';

interface RedeemStampCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    stampCard: ConsumerStampCard | null;
}

export default function RedeemStampCardModal({
    isOpen,
    onClose,
    stampCard,
}: RedeemStampCardModalProps) {
    const [copied, setCopied] = useState(false);

    const { data: qrData, isLoading: isLoadingQR } = useGetRedemptionQR(
        stampCard?.id || '',
        isOpen && stampCard?.status === 'completed'
    );

    if (!stampCard) return null;

    const { template, business } = stampCard;

    const daysToRedeem = stampCard.expiresAt
        ? Math.max(0, Math.ceil((new Date(stampCard.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

    const handleCopyCode = async () => {
        if (qrData) {
            try {
                await navigator.clipboard.writeText(stampCard.id);
                setCopied(true);
                toast.success('Redemption code copied!');
                setTimeout(() => setCopied(false), 2000);
            } catch (e) {
                toast.error('Failed to copy code');
            }
        }
    };

    const handleShare = async () => {
        if (navigator.share && qrData) {
            try {
                await navigator.share({
                    title: `Redeem: ${template.title}`,
                    text: `I'm ready to redeem my reward: ${template.rewardBenefitValue} at ${business.name}!`,
                });
            } catch (e) {
                // User cancelled or share failed
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-hidden flex flex-col p-0">
                {/* Header with celebration */}
                <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 p-6 text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>

                    <div className="animate-bounce mb-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm shadow-xl">
                            <Gift className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white mb-1">
                            🎉 Reward Unlocked!
                        </DialogTitle>
                        <p className="text-white/90 text-sm">
                            Show this QR code to the staff to redeem
                        </p>
                    </DialogHeader>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Reward info */}
                    <Card className="mb-6 border-2 border-green-200 bg-green-50/50 dark:bg-green-900/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shadow-md">
                                    {business.logo ? (
                                        <Image
                                            src={business.logo}
                                            alt={business.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-green-500">
                                            {business.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">{business.name}</p>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {template.rewardBenefitValue}
                                    </p>
                                    <p className="text-xs text-green-600">
                                        {BENEFIT_TYPE_LABELS[template.rewardBenefitType]}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* QR Code */}
                    <div className="flex flex-col items-center mb-6">
                        {isLoadingQR ? (
                            <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse flex items-center justify-center">
                                <Stamp className="h-10 w-10 text-gray-300 animate-spin" />
                            </div>
                        ) : qrData ? (
                            <>
                                <div className="relative p-4 bg-white rounded-2xl shadow-lg">
                                    <Image
                                        src={qrData.qrCode}
                                        alt="Redemption QR"
                                        width={200}
                                        height={200}
                                        className="rounded-lg"
                                    />
                                    {/* Decorative corners */}
                                    <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-green-500 rounded-tl" />
                                    <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-green-500 rounded-tr" />
                                    <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-green-500 rounded-bl" />
                                    <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-green-500 rounded-br" />
                                </div>

                                {/* Redemption code */}
                                <div className="mt-4 flex items-center gap-2">
                                    <code className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono">
                                        {stampCard.id}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCopyCode}
                                        className="h-8 w-8"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6 text-gray-500">
                                <p>Unable to generate QR code</p>
                            </div>
                        )}
                    </div>

                    {/* Business location */}
                    {business.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <MapPinned className="h-4 w-4 text-gray-400" />
                            <span>{business.address}</span>
                        </div>
                    )}

                    {/* Expiry warning */}
                    {daysToRedeem !== null && daysToRedeem > 0 && (
                        <div className={`flex items-center gap-2 text-sm p-3 rounded-xl mb-4 ${daysToRedeem <= 3
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}>
                            <Clock className="h-4 w-4" />
                            <span>
                                {daysToRedeem <= 3
                                    ? `⚠️ Expires in ${daysToRedeem} day${daysToRedeem > 1 ? 's' : ''}!`
                                    : `Valid for ${daysToRedeem} more days`}
                            </span>
                        </div>
                    )}

                    {/* Terms */}
                    {template.termsAndConditions && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <p className="font-medium mb-1">Terms & Conditions:</p>
                            <p className="italic">{template.termsAndConditions}</p>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex gap-3 p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                    <Button
                        variant="outline"
                        onClick={handleShare}
                        className="flex-1 gap-2"
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                    <Button
                        onClick={onClose}
                        className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
