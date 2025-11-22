// src/lib/mock-data/plaque-dashboard.ts

export const plaqueUserSummary = {
    totalScans: 1245,
    scans30d: 156,
    redemptions30d: 42,
    commissionEarned: 125.50,
};

export const plaqueList = [
    {
        id: 'PLQ-001',
        name: 'Main Entrance',
        status: 'Active',
        scans30d: 89,
        location: 'Front Door',
    },
    {
        id: 'PLQ-002',
        name: 'Counter Display',
        status: 'Active',
        scans30d: 45,
        location: 'Checkout Counter',
    },
    {
        id: 'PLQ-003',
        name: 'Window Sticker',
        status: 'Paused',
        scans30d: 22,
        location: 'Street Window',
    },
];

export const recentActivity = [
    {
        id: 1,
        time: '3 mins ago',
        description: 'Person scanned Plaque #PLQ-001',
        type: 'scan',
    },
    {
        id: 2,
        time: '2 hours ago',
        description: 'Offer redeemed from Plaque #PLQ-002',
        type: 'redemption',
    },
    {
        id: 3,
        time: '5 hours ago',
        description: 'Person scanned Plaque #PLQ-001',
        type: 'scan',
    },
    {
        id: 4,
        time: '1 day ago',
        description: 'Commission earned $5.00',
        type: 'commission',
    },
];
