import { Plan } from '@/types';

export const businessPlans: Plan[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: '$29/mo',
    features: [
      'Up to 500 Customers',
      'Basic Campaign Management',
      'Standard Analytics',
      'Email Support',
    ],
    isCurrent: false,
    isRecommended: false,
  },
  {
    id: 'silver',
    name: 'Silver',
    price: '$79/mo',
    features: [
      'Up to 2,500 Customers',
      'Advanced Campaign Management',
      'Detailed Analytics & Reporting',
      'Priority Email Support',
      'API Access',
    ],
    isCurrent: false,
    isRecommended: true,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '$149/mo',
    features: [
      'Up to 10,000 Customers',
      'All Silver Features',
      'Dedicated Account Manager',
      'Custom Integrations',
      '24/7 Phone Support',
    ],
    isCurrent: false,
    isRecommended: false,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 'Custom',
    features: [
      'Unlimited Customers',
      'All Gold Features',
      'Bespoke Development',
      'On-site Training',
      'Enterprise-grade Security & SLA',
    ],
    isCurrent: false,
    isRecommended: false,
  },
];
