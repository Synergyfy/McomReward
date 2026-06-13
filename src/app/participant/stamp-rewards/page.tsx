'use client';

import React from 'react';
import {
    useGetConsumerStampCards,
    useGetConsumerStampStats,
    useGetDiscoverableStampRewards,
    useStartStampCard,
} from '@/services/consumer-stamp-rewards/hook';
import StampRewardsContent from '@/components/customer/stamp-rewards/StampRewardsContent';

export default function CustomerStampRewardsPage() {
    const { data: stampCardsData, isLoading: isLoadingCards } = useGetConsumerStampCards('all');
    const { data: stats, isLoading: isLoadingStats } = useGetConsumerStampStats();
    const { data: discoverableRewards, isLoading: isLoadingDiscover } = useGetDiscoverableStampRewards();
    const { mutate: startCard, isPending: isStartingCard } = useStartStampCard();

    return (
        <StampRewardsContent
            stampCardsData={stampCardsData}
            stats={stats}
            discoverableRewards={discoverableRewards}
            isLoading={isLoadingCards || isLoadingStats || isLoadingDiscover}
            startCard={(rewardId) => startCard(rewardId)}
            isStartingCard={isStartingCard}
            isAdmin={false}
        />
    );
}
