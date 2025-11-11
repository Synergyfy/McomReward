// src/lib/mock-data/notifications.ts

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'in-app';
  subject: string; // For email/push
  body: string; // Content of the notification
  targetAudience: string; // e.g., "All Users", "Sector: Food", "Tier: Gold"
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string; // e.g., "All Users", "Sector: Food", "Location: NYC"
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'scheduled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'template-1',
    name: 'Welcome Email',
    type: 'email',
    subject: 'Welcome to MCOM Rewards!',
    body: 'Hi {{userName}}, welcome to MCOM Rewards! Start earning points today.',
    targetAudience: 'All New Users',
    status: 'active',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
  {
    id: 'template-2',
    name: 'Campaign Expiry Reminder',
    type: 'email',
    subject: 'Your Campaign "{{campaignName}}" is expiring soon!',
    body: 'Dear {{businessName}}, your campaign "{{campaignName}}" will expire on {{expiryDate}}.',
    targetAudience: 'Businesses with expiring campaigns',
    status: 'active',
    createdAt: new Date('2024-02-15T11:00:00Z'),
    updatedAt: new Date('2024-02-15T11:00:00Z'),
  },
  {
    id: 'template-3',
    name: 'New Deal Alert (Push)',
    type: 'push',
    subject: 'New Deal Alert!',
    body: '{{businessName}} has a new deal: {{dealTitle}}!',
    targetAudience: 'Consumers interested in {{sector}}',
    status: 'draft',
    createdAt: new Date('2024-03-01T14:00:00Z'),
    updatedAt: new Date('2024-03-01T14:00:00Z'),
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'announcement-1',
    title: 'Platform Maintenance Scheduled',
    content: 'Dear users, we will be performing scheduled maintenance on [Date] from [Time] to [Time]. Services may be temporarily interrupted.',
    targetAudience: 'All Users',
    startDate: new Date('2024-12-01T00:00:00Z'),
    endDate: new Date('2024-12-01T04:00:00Z'),
    status: 'scheduled',
    createdAt: new Date('2024-11-20T10:00:00Z'),
    updatedAt: new Date('2024-11-20T10:00:00Z'),
  },
  {
    id: 'announcement-2',
    title: 'New Feature: Matching Points!',
    content: 'Exciting news! We\'ve launched a new Matching Points feature. Learn more in your dashboard.',
    targetAudience: 'All Users',
    startDate: new Date('2024-11-15T09:00:00Z'),
    endDate: new Date('2024-12-31T23:59:59Z'),
    status: 'active',
    createdAt: new Date('2024-11-10T15:00:00Z'),
    updatedAt: new Date('2024-11-10T15:00:00Z'),
  },
];
