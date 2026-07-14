
export interface CampaignTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  type: 'QR' | 'Referral' | 'Social' | 'Event';
}

export const templateCampaigns: CampaignTemplate[] = [
  {
    id: 'template-1',
    title: '20% Off Welcome Offer',
    description: 'Attract new customers by offering a 20% discount on their first purchase. Scannable via QR code in-store.',
    category: 'Retail',
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9e?w=400&h=300&fit=crop',
    type: 'QR',
  },
  {
    id: 'template-2',
    title: 'Refer a Friend, Get £10',
    description: 'Encourage word-of-mouth marketing. When a customer refers a friend, both get a £10 voucher.',
    category: 'Services',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-4b9b29a6de89?w=400&h=300&fit=crop',
    type: 'Referral',
  },
  {
    id: 'template-3',
    title: 'Share on Social & Win',
    description: 'Boost your online presence. Customers who share a post about your business are entered into a prize draw.',
    category: 'Restaurants',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    type: 'Social',
  },
  {
    id: 'template-4',
    title: 'Exclusive VIP Event',
    description: 'Host an exclusive event for your most loyal customers. Use this campaign to send out invites and track RSVPs.',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=300&fit=crop',
    type: 'Event',
  },
];
