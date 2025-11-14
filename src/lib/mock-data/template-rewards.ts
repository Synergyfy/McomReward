
import { Reward } from '@/app/dashboard/rewards/page';

export const templateRewards: Reward[] = [
  {
    id: 'template-1',
    name: '20% Off Store-Wide',
    type: 'coupon',
    value: 20,
    pointsRequired: 400,
    expiry: new Date('2025-12-31'),
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&h=150&fit=crop&q=80',
    description: 'A versatile coupon for 20% off any purchase. Great for attracting new customers.',
    status: 'active',
  },
  {
    id: 'template-2',
    name: '£10 Gift Card',
    type: 'gift_card',
    value: 10,
    pointsRequired: 1000,
    expiry: new Date('2025-12-31'),
    image: 'https://images.unsplash.com/photo-1577538205243-a71bf516c5b2?w=150&h=150&fit=crop&q=80',
    description: 'A £10 gift card that can be used on any future purchase. Excellent for rewarding loyalty.',
    status: 'active',
  },
  {
    id: 'template-3',
    name: 'Free Coffee/Tea',
    type: 'voucher',
    value: 5,
    pointsRequired: 250,
    expiry: new Date('2025-12-31'),
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=150&h=150&fit=crop&q=80',
    description: 'Offer a complimentary hot beverage. Perfect for cafes and restaurants.',
    status: 'active',
  },
  {
    id: 'template-4',
    name: 'Double Points Week',
    type: 'points_offer',
    value: 0,
    pointsRequired: 0,
    expiry: new Date('2025-12-31'),
    image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=150&h=150&fit=crop&q=80',
    description: 'Run a promotion to grant double loyalty points for all purchases over a week.',
    status: 'active',
  },
];
