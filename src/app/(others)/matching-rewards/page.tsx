'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetPublicMatchingRewards } from '@/services/matching-points/hook';
import MatchingRewardCard from '@/components/rewards/MatchingRewardCard';
import { Sparkles, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from '@/components/ui/Loading';

export default function MatchingRewardsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 12;

    const { data, isLoading, error } = useGetPublicMatchingRewards(page, limit, { search });

    const rewards = data?.data || [];
    const totalPages = data?.totalPages || 1;

    if (isLoading) return <LoadingSpinner />;

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                <p className="text-gray-500 mb-6">We couldn't load the rewards. Please try again later.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        </div>
    );
    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Section */}
            <section className="relative bg-gray-900 border-b border-gray-800 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[128px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-200 border border-white/20 text-sm font-medium mb-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="w-4 h-4 text-orange-400" />
                        <span>Exclusive for Premium Members</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Maximize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Matching Points</span>
                    </h1>

                    <p className="max-w-2xl text-lg md:text-xl text-gray-300 leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Unlock a world of premium experiences and exclusive products. Use your matching points to claim rewards curated just for you from our top-tier partners.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        <a href="#rewards-grid">
                            <Button className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 rounded-full font-bold shadow-lg shadow-white/10 transition-transform hover:scale-105">
                                Explore Rewards
                            </Button>
                        </a>
                        <Button variant="outline" className="border-gray-700 text-gray-700 hover:bg-gray-800 hover:text-white text-lg px-8 py-6 rounded-full font-medium backdrop-blur-sm transition-transform hover:scale-105">
                            <Info className="w-5 h-5 mr-2" />
                            How it Works
                        </Button>
                    </div>
                </div>
            </section>

            {/* Explanation / How it Works Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100">
                            <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4 font-bold text-xl">1</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Earn Points</h3>
                            <p className="text-gray-500">Shop at participating merchants to earn matching points on every purchase.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100">
                            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 font-bold text-xl">2</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Discover Rewards</h3>
                            <p className="text-gray-500">Browse our curated collection of premium rewards, from travel to electronics.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-green-50/50 border border-green-100">
                            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 font-bold text-xl">3</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Claim Instantly</h3>
                            <p className="text-gray-500">Use your points to claim rewards instantly. No waiting, just enjoying.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rewards Grid */}
            <section id="rewards-grid" className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Rewards</h2>
                        <p className="text-gray-500">Hand-picked selections for our premium members.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search rewards..."
                            className="pl-10 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {rewards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rewards.map((reward, index) => (
                            <Link href={`/matching-rewards/${reward.id}`} key={reward.id} className="block h-full">
                                <MatchingRewardCard
                                    reward={reward}
                                    className={`h-full animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Info className="text-gray-300 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No rewards found</h3>
                        <p className="text-gray-500">Try adjusting your search or check back later.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <Button
                                key={i}
                                variant={page === i + 1 ? 'default' : 'outline'}
                                onClick={() => setPage(i + 1)}
                                className={page === i + 1 ? 'bg-orange-500 hover:bg-orange-600' : ''}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
