

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, Lock, Unlock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reward {
    id: string;
    title: string;
    description: string;
    max_points?: number;
    points_required?: number;
    pointsRequired?: number;
    max_stamps_required?: number;
    stamps_required?: number;
    stampsRequired?: number;
    image: string;
    value: number;
    quantity: number;
    remainingQuantity: number;
    gallery?: string[] | null;
    isMallIntegrated?: boolean;
    is_mall_integrated?: boolean;
    mallRewardValue?: string | number;
    mall_reward_value?: string | number;
    mallRewardType?: string;
    mall_reward_type?: string;
    rewardType?: string;
    rewardSource?: string;
    reward_source?: string;
    expiryDatetime?: string;
    expiry_datetime?: string;
    pointRequired?: number;
}

interface PublicRewardCardProps {
    reward: Reward;
    userPoints?: number;
    userStamps?: number;
    isMember?: boolean;
    onRedeem?: (reward: Reward) => void;
    className?: string;
}

export default function PublicRewardCard({
    reward,
    userPoints = 0,
    userStamps = 0,
    isMember = false,
    onRedeem,
    className
}: PublicRewardCardProps) {
    // Handle property inconsistency between snake_case and camelCase, and singular vs plural
    const pointsRequired = reward.pointsRequired ?? reward.pointRequired ?? reward.max_points ?? reward.points_required ?? 0;
    const stampsRequired = reward.stampsRequired ?? reward.max_stamps_required ?? reward.stamps_required ?? 0;
    const isMallIntegrated = reward.isMallIntegrated ?? reward.is_mall_integrated ?? false;
    const mallValue = reward.mallRewardValue ?? reward.mall_reward_value;
    const mallType = reward.mallRewardType ?? reward.mall_reward_type;
    const source = reward.rewardSource ?? reward.reward_source;
    const expiry = reward.expiryDatetime ?? reward.expiry_datetime;

    // State for active image (defaults to main image)
    const [activeImage, setActiveImage] = useState<string>(reward.image || 'https://placehold.co/600x400?text=Reward');

    // Reset active image when reward changes
    React.useEffect(() => {
        setActiveImage(reward.image || 'https://placehold.co/600x400?text=Reward');
    }, [reward.image]);

    // Calculate progress based on whatever is required (simple version: use points if present, else stamps)
    const progress = isMember
        ? pointsRequired > 0
            ? Math.min((userPoints / pointsRequired) * 100, 100)
            : stampsRequired > 0
                ? Math.min((userStamps / stampsRequired) * 100, 100)
                : 0
        : 0;

    const canRedeem = isMember && (
        (pointsRequired > 0 && userPoints >= pointsRequired) ||
        (stampsRequired > 0 && userStamps >= stampsRequired) ||
        (pointsRequired === 0 && stampsRequired === 0)
    );

    const isValidSrc = (src: string) => {
        return src.startsWith('http') || src.startsWith('https') || src.startsWith('/');
    };

    return (
        <div className={cn(
            "group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-gray-100",
            className
        )}>
            {/* Image Section */}
            <div className="relative h-72 w-full overflow-hidden">
                <Image
                    src={isValidSrc(activeImage) ? activeImage : 'https://placehold.co/600x400?text=Reward'}
                    alt={reward.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                    <Badge className="bg-white text-gray-900 border-none px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-300">
                        {reward.remainingQuantity > 0 ? (
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                {reward.remainingQuantity} Left
                            </span>
                        ) : 'Unlimited'}
                    </Badge>
                    {isMallIntegrated && (
                        <Badge className="bg-blue-600/90 backdrop-blur-md text-white border-none px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight shadow-[0_4px_12px_rgba(37,99,235,0.4)] flex items-center gap-1.5 hover:scale-105 transition-transform duration-300">
                            <Tag className="w-3.5 h-3.5" />
                            Mall Integrated
                        </Badge>
                    )}
                </div>

                {/* Requirements Badges (Floating) */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    {pointsRequired > 0 && (
                        <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 border border-white/50">
                            <Trophy className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-lg">{pointsRequired}</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pts</span>
                        </div>
                    )}
                    {stampsRequired > 0 && (
                        <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 border border-white/50">
                            <Gift className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-lg">{stampsRequired}</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stamps</span>
                        </div>
                    )}
                </div>
            </div>

            {reward.gallery && reward.gallery.length > 0 && (
                <div
                    className="px-6 pt-4 grid grid-cols-4 gap-2"
                    onMouseLeave={() => setActiveImage(reward.image || 'https://placehold.co/600x400?text=Reward')}
                >
                    {/* Gallery Images */}
                    {reward.gallery.map((img, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300",
                                activeImage === img ? "border-orange-500 ring-2 ring-orange-200 scale-[1.02]" : "border-transparent hover:border-gray-200"
                            )}
                            onMouseEnter={() => setActiveImage(img)}
                        >
                            <Image
                                src={isValidSrc(img) ? img : 'https://placehold.co/600x400?text=Reward'}
                                alt={`Gallery ${idx}`}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Content Section */}
            <div className="p-6 flex-grow flex flex-col relative">
                {/* Title & Description */}
                <div className="mb-6">
                    <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {reward.title}
                        </h3>
                        <div className="flex flex-col items-end gap-1">
                            {reward.rewardType && (
                                <Badge variant="outline" className="shrink-0 text-[10px] uppercase font-bold py-0 h-5 bg-gray-50">
                                    {reward.rewardType}
                                </Badge>
                            )}
                            {source && (
                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-tighter">
                                    via {source}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {reward.description}
                    </p>

                    {/* Mall Details Section */}
                    {isMallIntegrated && (mallValue || mallType) && (
                        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50 mb-4 animate-in fade-in slide-in-from-top-1 duration-500">
                            <div className="flex flex-wrap gap-4">
                                {mallValue !== undefined && mallValue !== null && (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-blue-400 leading-none mb-1">Mall Benefit</span>
                                        <span className="text-sm font-extrabold text-blue-700 tracking-tight flex items-center gap-1">
                                            {typeof mallValue === 'number'
                                                ? `£${mallValue.toFixed(2)}`
                                                : mallValue.toString().startsWith('£') || mallValue.toString().startsWith('$')
                                                    ? mallValue
                                                    : `£${mallValue}`
                                            }
                                        </span>
                                    </div>
                                )}
                                {mallType && (
                                    <div className="flex flex-col border-l border-blue-200 pl-4">
                                        <span className="text-[10px] uppercase font-bold text-blue-400 leading-none mb-1">Issuance Type</span>
                                        <span className="text-sm font-extrabold text-blue-700 tracking-tight uppercase">
                                            {mallType.replace('_', ' ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Expiry Badge */}
                    {expiry && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Expires: {new Date(expiry).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    )}
                </div>

                {/* Progress Section (Only for Members) */}
                {isMember && (
                    <div className="mt-auto space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className={cn(
                                    "transition-colors",
                                    canRedeem ? "text-green-600" : "text-gray-500"
                                )}>
                                    {canRedeem
                                        ? "Ready to Redeem!"
                                        : pointsRequired > 0 && userPoints < pointsRequired
                                            ? `${pointsRequired - userPoints} points to go`
                                            : stampsRequired > 0 && userStamps < stampsRequired
                                                ? `${stampsRequired - userStamps} stamps to go`
                                                : "Locked"
                                    }
                                </span>
                                <span className="text-gray-400">{Math.round(progress)}%</span>
                            </div>
                            <Progress
                                value={progress}
                                className={cn(
                                    "h-2 bg-gray-100",
                                    "[&>div]:transition-all [&>div]:duration-1000",
                                    canRedeem ? "[&>div]:bg-green-500" : "[&>div]:bg-orange-500"
                                )}
                            />
                        </div>

                        {/* Action Button */}
                        {onRedeem ? (
                            <Button
                                onClick={() => onRedeem(reward)}
                                disabled={!canRedeem}
                                className={cn(
                                    "w-full py-6 rounded-xl text-base font-bold shadow-md transition-all duration-300",
                                    canRedeem
                                        ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:shadow-lg hover:scale-[1.02]"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100"
                                )}
                            >
                                {canRedeem ? (
                                    <span className="flex items-center gap-2">
                                        <Unlock className="w-4 h-4" /> Redeem Reward
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" /> Locked
                                    </span>
                                )}
                            </Button>
                        ) : (
                            // If no onRedeem (e.g. public view), show status or nothing
                            <div className="pt-2 flex items-center justify-center text-sm text-gray-400 font-medium">
                                {canRedeem ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <Unlock className="w-4 h-4" /> Unlocked
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <Lock className="w-4 h-4" /> Locked
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Non-Member View (Just decorative footer or CTA hint) */}
                {!isMember && (
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <Gift className="w-4 h-4" />
                            Reward
                        </span>
                        <span className="text-orange-500 font-medium">Join to Earn</span>
                    </div>
                )}
            </div>
        </div>
    );
}
