'use client';

import React, { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRedeemMatchingReward } from '@/services/matching-points/hook';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Heart, ShieldCheck, Clock, Box, Info, Lock } from "lucide-react";
import LoadingSpinner from '@/components/ui/Loading';
import { cn } from "@/lib/utils";

// Mock Authentication Hook for demonstration
const useMockAuth = () => {
    // Toggle this to true to test the "Logged In" state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    return { isLoggedIn, login: () => setIsLoggedIn(true) };
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function MatchingRewardDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { isLoggedIn, login } = useMockAuth();

    // const { data: reward, isLoading, error } = useGetPublicMatchingRewardById(id);
    const reward: any = null;
    const isLoading = false;
    const error = null;
    const redeemMutation = useRedeemMatchingReward();

    if (isLoading) return <LoadingSpinner />;

    if (error || !reward) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reward Not Found</h2>
                    <p className="text-gray-500 mb-6">We couldn't load the reward details. It might have been removed.</p>
                    <Link href="/matching-rewards">
                        <Button>Back to Rewards</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleClaim = () => {
        if (!isLoggedIn) {
            const confirmLogin = window.confirm("You must be logged in to claim this reward. Go to login page?");
            if (confirmLogin) {
                // login(); // Mock login
                // Ideally redirect to actual login
                router.push('/login');
            }
            return;
        }

        redeemMutation.mutate(id, {
            onSuccess: () => {
                // Success is handled by toast in hook, but we could add more here if needed
                // router.push('/dashboard/matching-points'); 
            }
        });
    };

    const isClaiming = redeemMutation.isPending;

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Back Navigation Bar */}
            <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/matching-rewards" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Back to Rewards</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 text-gray-500">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 text-gray-500">
                            <Heart className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Column: Gallery / Images */}
                    <div className="space-y-6">
                        <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src={reward.mainImage || 'https://placehold.co/600x400?text=No+Image'}
                                alt={reward.title}
                                layout="fill"
                                objectFit="cover"
                                priority
                                className="hover:scale-105 transition-transform duration-700"
                            />
                            {reward.quantity < 5 && reward.quantity > 0 && (
                                <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                                    Only {reward.quantity} Left
                                </div>
                            )}
                        </div>

                        {/* Thumbnails if available */}
                        {reward.galleryImages && reward.galleryImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">
                                {reward.galleryImages.map((img: string, idx: number) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-orange-500 transition-all">
                                        <Image src={img} alt="" layout="fill" objectFit="cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details & Action */}
                    <div className="flex flex-col">
                        <div className="mb-2 flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-none text-sm px-3 py-1">
                                Reward
                            </Badge>
                            {reward.targetAudience === 'BUSINESS_ONLY' && (
                                <Badge className="bg-purple-50 text-purple-700 border-none text-sm px-3 py-1 font-bold">
                                    Business Exclusive
                                </Badge>
                            )}
                            {reward.isSuspended && (
                                <Badge variant="destructive" className="text-sm px-3 py-1 font-bold">
                                    Suspended
                                </Badge>
                            )}
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="text-sm font-medium text-gray-500">Provided by Partner Merchant</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                            {reward.title}
                        </h1>

                        {/* Price Block */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                                    {(reward.requiredPoints ?? 0).toLocaleString()}
                                </span>
                                <span className="text-lg font-bold text-gray-500 mb-2">Matching Points</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Box className="w-4 h-4" />
                                <span>Redeemable Rewards</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-lg text-gray-600 mb-10">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                            <p className="leading-relaxed">{reward.longDescription || reward.shortDescription}</p>
                        </div>

                        {/* Additional Info Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <ShieldCheck className="w-6 h-6 text-blue-600 mt-1" />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Verified Reward</h4>
                                    <p className="text-xs text-gray-500 mt-1">Authenticity and quality guaranteed.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                                <Clock className="w-6 h-6 text-purple-600 mt-1" />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Limited Time</h4>
                                    <p className="text-xs text-gray-500 mt-1">Expires {new Date(reward.endDatetime).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Bottom Action (Mobile Optimized) or static on desktop */}
                        <div className="mt-auto pt-6 border-t border-gray-100">
                            <div className="flex flex-col gap-4">
                                {isLoggedIn ? (
                                    <Button
                                        onClick={handleClaim}
                                        disabled={isClaiming || reward.quantity === 0 || reward.isSuspended}
                                        className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white text-xl py-8 rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02]"
                                    >
                                        {isClaiming ? "Processing..." : reward.isSuspended ? "Temporarily Unavailable" : reward.quantity === 0 ? "Sold Out" : "Claim Reward Now"}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleClaim}
                                        variant="outline"
                                        className="w-full border-2 border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 text-xl py-8 rounded-2xl font-bold transition-all"
                                    >
                                        <Lock className="w-5 h-5 mr-2" />
                                        Login to Claim
                                    </Button>
                                )}

                                <p className="text-center text-xs text-gray-400">
                                    By claiming this reward, you agree to the terms and conditions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
