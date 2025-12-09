import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reward {
    id: string;
    title: string;
    description: string;
    pointsRequired?: number;
    points_required?: number;
    image: string;
    value: number;
    quantity: number;
}

interface PublicRewardCardProps {
    reward: Reward;
    userPoints?: number;
    isMember?: boolean;
    onRedeem?: (reward: Reward) => void;
    className?: string;
}

export default function PublicRewardCard({
    reward,
    userPoints = 0,
    isMember = false,
    onRedeem,
    className
}: PublicRewardCardProps) {
    // Handle points property inconsistency
    const pointsRequired = reward.pointsRequired || reward.points_required || 0;

    const progress = isMember ? Math.min((userPoints / pointsRequired) * 100, 100) : 0;
    const canRedeem = isMember && userPoints >= pointsRequired;

    return (
        <div className={cn(
            "group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-gray-100",
            className
        )}>
            {/* Image Section */}
            <div className="relative h-56 w-full overflow-hidden">
                <Image
                    src={reward.image || 'https://placehold.co/600x400?text=Reward'}
                    alt={reward.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1.5 text-xs font-medium uppercase tracking-wider shadow-sm">
                        {reward.quantity > 0 ? `${reward.quantity} Left` : 'Unlimited'}
                    </Badge>
                </div>

                {/* Points Badge (Floating) */}
                <div className="absolute bottom-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 border border-white/50">
                        <Trophy className="w-4 h-4 text-orange-500" />
                        <span className="font-bold text-lg">{pointsRequired}</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pts</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-grow flex flex-col relative">
                {/* Title & Description */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {reward.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {reward.description}
                    </p>
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
                                    {canRedeem ? "Ready to Redeem!" : `${pointsRequired - userPoints} points to go`}
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
