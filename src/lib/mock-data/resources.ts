// src/lib/mock-data/resources.ts

export interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string; // e.g., "5:30"
  targetAudience: string; // e.g., "All Businesses", "Tier: Starter"
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string; // e.g., "Getting Started", "Campaigns", "Billing"
  lastUpdated: Date;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  tierLevel: string; // e.g., "Starter", "Active", "Trusted", "Partner"
  resources: (string | { type: 'video' | 'article'; id: string })[]; // Array of video/article IDs
}

export const mockTrainingVideos: TrainingVideo[] = [
  {
    id: 'vid-1',
    title: 'Getting Started with MCOM Rewards',
    description: 'An overview of the platform and its key features.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '3:32',
    targetAudience: 'All Businesses',
  },
  {
    id: 'vid-2',
    title: 'Creating Your First Campaign',
    description: 'A step-by-step guide to creating and launching a successful campaign.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '8:15',
    targetAudience: 'Tier: Starter',
  },
];

export const mockHelpArticles: HelpArticle[] = [
  {
    id: 'art-1',
    title: 'How to redeem points?',
    content: 'To redeem points, go to the "Redeem Points" section in your dashboard...',
    category: 'Getting Started',
    lastUpdated: new Date('2024-10-01'),
  },
  {
    id: 'art-2',
    title: 'Understanding Campaign Analytics',
    content: 'This article explains the different metrics available in your campaign performance dashboard...',
    category: 'Campaigns',
    lastUpdated: new Date('2024-11-05'),
  },
  {
    id: 'art-3',
    title: 'Billing and Subscriptions',
    content: 'Here you can find information about our subscription plans and how billing works...',
    category: 'Billing',
    lastUpdated: new Date('2024-09-20'),
  },
];

export const mockLearningModules: LearningModule[] = [
  {
    id: 'mod-1',
    title: 'Onboarding for Starter Tier',
    description: 'Everything you need to know to get started with MCOM Rewards.',
    tierLevel: 'Starter',
    resources: [{ type: 'video', id: 'vid-1' }, { type: 'article', id: 'art-1' }],
  },
  {
    id: 'mod-2',
    title: 'Advanced Campaign Strategies',
    description: 'Learn how to maximize your campaign performance.',
    tierLevel: 'Active',
    resources: [{ type: 'video', id: 'vid-2' }, { type: 'article', id: 'art-2' }],
  },
];
