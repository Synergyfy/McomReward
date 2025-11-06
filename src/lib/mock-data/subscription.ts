export interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isCurrent: boolean;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
  invoiceUrl: string;
}

export const subscriptionPlans: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    price: '£0/mo',
    features: [
      'Basic Dashboard Access',
      'Limited Campaign Analytics',
      'Access to B2B Exchange',
    ],
    isCurrent: false,
  },
  {
    id: 'plan-co-brand',
    name: 'Co-Brand',
    price: '£49/mo',
    features: [
      'Advanced Campaign Analytics',
      'Co-Branded Campaign Pages',
      'Editable Visuals (Logo, Colors)',
      'Priority Support',
    ],
    isCurrent: true, // Mock current plan
  },
  {
    id: 'plan-white-label',
    name: 'White-Label',
    price: '£99/mo',
    features: [
      'Full White-Label Experience',
      'Custom Domain & Branding',
      'Full Creative Control',
      'Dedicated Account Manager',
    ],
    isCurrent: false,
  },
];

export const billingHistory: BillingHistoryItem[] = [
  {
    id: 'inv-1',
    date: '2025-11-01',
    amount: '£49.00',
    status: 'Paid',
    invoiceUrl: '#',
  },
  {
    id: 'inv-2',
    date: '2025-10-01',
    amount: '£49.00',
    status: 'Paid',
    invoiceUrl: '#',
  },
  {
    id: 'inv-3',
    date: '2025-09-01',
    amount: '£49.00',
    status: 'Paid',
    invoiceUrl: '#',
  },
];
