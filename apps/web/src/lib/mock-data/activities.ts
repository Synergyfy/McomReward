export interface CustomerActivity {
  id: string;
  customer: {
    name: string;
    avatarUrl: string;
  };
  activityType: 'Redemption' | 'Referral' | 'Wishlist';
  details: string;
  date: string;
}

export const customerActivitiesData: CustomerActivity[] = [
  {
    id: 'act-1',
    customer: {
      name: 'John Doe',
      avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    activityType: 'Redemption',
    details: 'Redeemed “Summer Voucher ($50)”',
    date: '2025-11-05',
  },
  {
    id: 'act-2',
    customer: {
      name: 'Jane Smith',
      avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    activityType: 'Referral',
    details: 'Referred 3 new customers',
    date: '2025-11-04',
  },
  {
    id: 'act-3',
    customer: {
      name: 'Peter Jones',
      avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
    activityType: 'Wishlist',
    details: 'Added “Handmade Leather Wallet” to wishlist',
    date: '2025-11-03',
  },
  {
    id: 'act-4',
    customer: {
      name: 'Mary Johnson',
      avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
    },
    activityType: 'Redemption',
    details: 'Redeemed “Gift Card (00)”',
    date: '2025-11-02',
  },
  {
    id: 'act-5',
    customer: {
      name: 'David Williams',
      avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
    },
    activityType: 'Referral',
    details: 'Referred 1 new customer',
    date: '2025-11-01',
  },
];
