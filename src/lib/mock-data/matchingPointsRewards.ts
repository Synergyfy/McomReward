export interface MatchingPointRedemption {
    id: string;
    rewardId: string;
    rewardTitle: string;
    businessId: string;
    businessName: string;
    pointsRedeemed: number;
    redeemedAt: string;
    status: 'completed' | 'pending' | 'cancelled';
}

export const mockGlobalRedemptions: MatchingPointRedemption[] = [
    {
        id: 'r1',
        rewardId: '1',
        rewardTitle: 'Premium Marketing Consultation',
        businessId: 'b1',
        businessName: 'Acme Corp',
        pointsRedeemed: 500,
        redeemedAt: '2023-10-15T14:30:00Z',
        status: 'completed',
    },
    {
        id: 'r2',
        rewardId: '2',
        rewardTitle: 'Featured Business Spot',
        businessId: 'b2',
        businessName: 'Local Coffee Co.',
        pointsRedeemed: 1000,
        redeemedAt: '2023-10-16T09:15:00Z',
        status: 'completed',
    },
    {
        id: 'r3',
        rewardId: '1',
        rewardTitle: 'Premium Marketing Consultation',
        businessId: 'b3',
        businessName: 'Tech Startups Inc',
        pointsRedeemed: 500,
        redeemedAt: '2023-10-18T11:00:00Z',
        status: 'pending',
    },
];

export const mockMyRedemptions: MatchingPointRedemption[] = [
    {
        id: 'mr1',
        rewardId: '1',
        rewardTitle: 'Premium Marketing Consultation',
        businessId: 'my-biz',
        businessName: 'My Business',
        pointsRedeemed: 500,
        redeemedAt: '2023-10-12T10:00:00Z',
        status: 'completed',
    },
];
