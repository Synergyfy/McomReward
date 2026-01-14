
import React from 'react';
import Image from 'next/image';
import { MatchingReward } from '@/lib/mock-data/matching-rewards';
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Clock, Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchingRewardCardProps {
    reward: MatchingReward;
    onClick?: () => void;
    className?: string;
}

export default function MatchingRewardCard({ reward, onClick, className }: MatchingRewardCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-white rounded-2xl overflow-hidden cursor-pointer",
                "border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10",
                "transition-all duration-500 ease-out transform hover:-translate-y-1 h-full flex flex-col",
                className
            )}
        >
            {/* Image Container */}
            <div className="relative h-64 w-full overflow-hidden">
                <Image
                    src={reward.image}
                    alt={reward.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {reward.isSuperBusiness && (
                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none shadow-lg shadow-orange-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
                            <Sparkles className="w-3 h-3 mr-1 fill-white" />
                            Premium
                        </Badge>
                    )}
                    {reward.remainingQuantity === 0 ? (
                        <Badge variant="destructive" className="ml-auto font-bold shadow-lg">Sold Out</Badge>
                    ) : reward.remainingQuantity < 5 && (
                        <Badge className="ml-auto bg-red-500 text-white border-none font-bold shadow-lg animate-pulse">
                            Only {reward.remainingQuantity} left
                        </Badge>
                    )}
                </div>

                {/* Matching Points Cost (Floating Hero) */}
                <div className="absolute bottom-4 left-4">
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest pl-1">Required</span>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-xl">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-inner">
                                <span className="text-white text-[10px] font-bold">M</span>
                            </div>
                            <span className="text-2xl font-extrabold text-white tracking-tight">
                                {reward.matchingPointsRequired.toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-white/80 uppercase">Pts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-grow flex flex-col relative">
                {/* Decorative background blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-150 transition-transform duration-700 ease-in-out" />

                <div className="relative z-10 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-4 mb-3">
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-wide bg-orange-50 px-2 py-1 rounded-md">
                            {reward.category}
                        </span>
                        <span className="text-xs font-medium text-gray-400">
                            by {reward.merchantName}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
                        {reward.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-6 flex-grow">
                        {reward.description}
                    </p>

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <div className="flex items-start gap-4 text-xs text-gray-400 font-medium">
                            <div className="flex items-center gap-1.5" title="Original Value">
                                <Box className="w-4 h-4 text-gray-300" />
                                <span>Value: ${reward.originalValue}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Expiry Date">
                                <Clock className="w-4 h-4 text-gray-300" />
                                <span>{new Date(reward.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="h-8 w-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 border-2 border-orange-500/0 rounded-2xl group-hover:border-orange-500/10 transition-colors duration-500 pointer-events-none" />
        </div>
    );
}
