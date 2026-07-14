'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import StampRewardsContent from '@/components/customer/stamp-rewards/StampRewardsContent';
import {
    useAdminParticipantStampCards,
    useAdminParticipantStampStats,
    useAdminDiscoverableStampRewards
} from '@/services/admin/hook';

export default function AdminStampRewardsPage() {
    const params = useParams();
    const id = params?.id as string;

    const { data: stampCardsData, isLoading: isLoadingCards } = useAdminParticipantStampCards(id, 'all');
    const { data: stats, isLoading: isLoadingStats } = useAdminParticipantStampStats(id);
    const { data: discoverableRewards, isLoading: isLoadingDiscover } = useAdminDiscoverableStampRewards(id);

    return (
        <StampRewardsContent
            stampCardsData={stampCardsData}
            stats={stats}
            discoverableRewards={discoverableRewards}
            isLoading={isLoadingCards || isLoadingStats || isLoadingDiscover}
            isAdmin={true}
        />
    );
}
