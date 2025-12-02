export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export const faqData: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How do I create a new campaign?',
    answer: 'To create a new campaign, navigate to the “Campaigns” tab and click the “Create Campaign” button. The campaign builder will guide you through the process.',
  },
  {
    id: 'faq-2',
    question: 'What are Matching Points?',
    answer: 'Matching Points are automatically awarded when a campaign runs out of regular rewards. They can be used to fund new campaigns or purchase premium features.',
  },
  {
    id: 'faq-3',
    question: 'How do I upgrade my subscription?',
    answer: 'You can upgrade your subscription at any time from the “Membership & Billing” tab. Simply choose the plan you wish to upgrade to and follow the on-screen instructions.',
  },
];

export const trainingVideos: TrainingVideo[] = [
  {
    id: 'vid-1',
    title: 'How to Create a Campaign',
    description: 'A step-by-step guide to creating and launching your first campaign.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    videoUrl: '#',
  },
  {
    id: 'vid-2',
    title: 'Understanding Badges & Tiers',
    description: 'Learn how the tier system works and what benefits you can unlock.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80',
    videoUrl: '#',
  },
  {
    id: 'vid-3',
    title: 'Using the B2B Exchange',
    description: 'Discover how to trade products and services with other businesses in the network.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    videoUrl: '#',
  },
];
