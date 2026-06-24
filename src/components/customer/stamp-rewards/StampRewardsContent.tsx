'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Stamp,
    Gift,
    Award,
    Star,
    Sparkles,
    ChevronRight,
    Zap,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/Loading';
import CustomerStampCard from '@/components/customer/stamp-rewards/CustomerStampCard';
import StampCardDetailModal from '@/components/customer/stamp-rewards/StampCardDetailModal';
import RedeemStampCardModal from '@/components/customer/stamp-rewards/RedeemStampCardModal';
import { ConsumerStampCard, DiscoverableStampReward, StampStats, PaginatedResponse, GetConsumerStampCardsResponse } from '@/services/consumer-stamp-rewards/types';
import Image from 'next/image';

interface StampRewardsContentProps {
    stampCardsData?: PaginatedResponse<ConsumerStampCard> | GetConsumerStampCardsResponse;
    stats?: StampStats;
    discoverableRewards?: DiscoverableStampReward[];
    isLoading: boolean;
    startCard?: (rewardId: string) => void;
    isStartingCard?: boolean;
    isAdmin?: boolean;
}

export default function StampRewardsContent({
    stampCardsData,
    stats,
    discoverableRewards = [],
    isLoading,
    startCard,
    isStartingCard = false,
    isAdmin = false
}: StampRewardsContentProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('my-cards');
    const [selectedCard, setSelectedCard] = useState<ConsumerStampCard | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [redeemModalOpen, setRedeemModalOpen] = useState(false);

    const stampCards = stampCardsData?.data || [];

    const activeCards = useMemo(() =>
        stampCards.filter(c => c.status === 'in_progress'), [stampCards]);
    const readyToRedeem = useMemo(() =>
        stampCards.filter(c => c.status === 'completed'), [stampCards]);
    const completedCards = useMemo(() =>
        stampCards.filter(c => c.status === 'redeemed'), [stampCards]);

    const filterCards = (cards: ConsumerStampCard[]) => {
        if (!searchTerm) return cards;
        return cards.filter(c =>
            c.template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.business.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const handleViewDetails = (card: ConsumerStampCard) => {
        setSelectedCard(card);
        setDetailModalOpen(true);
    };

    const handleRedeem = (card: ConsumerStampCard) => {
        if (isAdmin) return;
        setSelectedCard(card);
        setDetailModalOpen(false);
        setRedeemModalOpen(true);
    };

    const handleStartCard = (reward: DiscoverableStampReward) => {
        if (isAdmin) return;
        if (startCard) {
             startCard(reward.businessStampRewardId);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#101415]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#101415] text-[#e0e3e5] p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg shadow-primary/25">
                            <Stamp className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[#ff843a] bg-clip-text text-transparent">
                                My Stamp Cards
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                Collect stamps and unlock rewards!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-[#1d2022] border border-white/5 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                    <Stamp className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats?.activeCards || 0}</p>
                                    <p className="text-xs text-gray-500">In Progress</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#1d2022] border border-white/5 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-500/10 rounded-xl">
                                    <Gift className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{readyToRedeem.length}</p>
                                    <p className="text-xs text-gray-500">Ready to Redeem</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#1d2022] border border-white/5 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/10 rounded-xl">
                                    <Award className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats?.redeemedRewards || 0}</p>
                                    <p className="text-xs text-gray-500">Redeemed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#1d2022] border border-white/5 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-primary to-[#ff843a]" />
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Star className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats?.totalPointsEarned || 0}</p>
                                    <p className="text-xs text-gray-500">Points Earned</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ready to Redeem Alert */}
                {readyToRedeem.length > 0 && !isAdmin && (
                    <Card className="mb-6 border-2 border-green-500/20 bg-[#1d2022] overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-500/10 rounded-xl animate-bounce">
                                        <Gift className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-400">
                                            🎉 You have {readyToRedeem.length} reward{readyToRedeem.length > 1 ? 's' : ''} ready!
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            Tap to redeem your rewards now
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setActiveTab('ready')}
                                    className="gap-2 bg-green-600 hover:bg-green-700 border-none"
                                >
                                    View Rewards
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <TabsList className="bg-[#1d2022] p-1 border border-white/5 shadow-lg">
                            <TabsTrigger value="my-cards" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <Stamp className="h-4 w-4" />
                                My Cards
                                {activeCards.length > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                                        {activeCards.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="ready" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <Gift className="h-4 w-4" />
                                Ready
                                {readyToRedeem.length > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                                        {readyToRedeem.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="discover" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <Sparkles className="h-4 w-4" />
                                Discover
                            </TabsTrigger>
                            <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <Award className="h-4 w-4" />
                                History
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search cards..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-[#1d2022] border border-white/5 text-white"
                            />
                        </div>
                    </div>

                    {/* My Cards Tab */}
                    <TabsContent value="my-cards" className="mt-6">
                        {filterCards(activeCards).length === 0 ? (
                            <Card className="border border-white/5 bg-[#1d2022]">
                                <CardContent className="py-16 text-center">
                                    <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-primary/20">
                                        <Stamp className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        No cards in progress
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        Discover new stamp rewards and start collecting!
                                    </p>
                                    <Button
                                        onClick={() => setActiveTab('discover')}
                                        className="gap-2 bg-primary hover:bg-primary/95 text-white border-none"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Discover Rewards
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filterCards(activeCards).map((card) => (
                                    <CustomerStampCard
                                        key={card.id}
                                        stampCard={card}
                                        onViewDetails={handleViewDetails}
                                        onRedeem={handleRedeem}
                                        isRedeemDisabled={isAdmin}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Ready to Redeem Tab */}
                    <TabsContent value="ready" className="mt-6">
                        {filterCards(readyToRedeem).length === 0 ? (
                            <Card className="border border-white/5 bg-[#1d2022]">
                                <CardContent className="py-16 text-center">
                                    <div className="p-4 bg-[#101415] border border-white/5 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Gift className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        No rewards ready yet
                                    </h3>
                                    <p className="text-gray-400">
                                        Complete your stamp cards to unlock rewards!
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filterCards(readyToRedeem).map((card) => (
                                    <CustomerStampCard
                                        key={card.id}
                                        stampCard={card}
                                        onViewDetails={handleViewDetails}
                                        onRedeem={handleRedeem}
                                        isRedeemDisabled={isAdmin}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Discover Tab */}
                    <TabsContent value="discover" className="mt-6">
                        {discoverableRewards.length === 0 ? (
                            <Card className="border border-white/5 bg-[#1d2022]">
                                <CardContent className="py-16 text-center">
                                    <div className="p-4 bg-[#101415] border border-white/5 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Sparkles className="h-8 w-8 text-gray-550" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        No new rewards available
                                    </h3>
                                    <p className="text-gray-400">
                                        Check back later for new stamp reward opportunities!
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {discoverableRewards.map((reward) => (
                                    <Card key={reward.id} className="group overflow-hidden border border-white/5 bg-[#1d2022] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-[#e0e3e5]">
                                        <div className="h-1 bg-gradient-to-r from-primary via-[#ff843a] to-primary" />
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#101415] border border-white/5 shadow-lg">
                                                    {reward.template.image ? (
                                                        <Image
                                                            src={reward.template.image}
                                                            alt={reward.template.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Stamp className="h-8 w-8 text-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-400">{reward.business.name}</p>
                                                    <h3 className="font-semibold text-white">
                                                        {reward.template.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-550 mt-1">
                                                        {reward.template.stampsRequired} stamps to complete
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                                {reward.template.description}
                                            </p>

                                            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Gift className="h-5 w-5 text-green-400" />
                                                    <span className="text-sm font-medium text-white">
                                                        {reward.template.rewardBenefitValue}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleStartCard(reward)}
                                                disabled={isStartingCard || isAdmin}
                                                className="w-full gap-2 bg-primary hover:bg-primary/95 border-none text-white"
                                            >
                                                <Zap className="h-4 w-4" />
                                                Start Collecting
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="mt-6">
                        {filterCards(completedCards).length === 0 ? (
                            <Card className="border border-white/5 bg-[#1d2022]">
                                <CardContent className="py-16 text-center">
                                    <div className="p-4 bg-[#101415] border border-white/5 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Award className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        No redeemed rewards yet
                                    </h3>
                                    <p className="text-gray-400">
                                        Your completed rewards will appear here.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filterCards(completedCards).map((card) => (
                                    <CustomerStampCard
                                        key={card.id}
                                        stampCard={card}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Detail Modal */}
            <StampCardDetailModal
                isOpen={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedCard(null);
                }}
                stampCard={selectedCard}
                onRedeem={handleRedeem}
                isRedeemDisabled={isAdmin}
            />

            {/* Redeem Modal */}
            <RedeemStampCardModal
                isOpen={redeemModalOpen}
                onClose={() => {
                    setRedeemModalOpen(false);
                    setSelectedCard(null);
                }}
                stampCard={selectedCard}
            />
        </div>
    );
}
