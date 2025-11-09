// src/lib/mock-data/security.ts

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string; // e.g., "Created Campaign", "Deleted User", "Updated Role"
  details: string; // e.g., "Campaign ID: camp-001", "User ID: user-123"
  timestamp: Date;
}

export const mockPermissions: Permission[] = [
  { id: 'perm-1', name: 'Manage Users', description: 'Can create, edit, and delete users.' },
  { id: 'perm-2', name: 'Manage Campaigns', description: 'Can create, edit, and delete campaigns.' },
  { id: 'perm-3', name: 'Manage Rewards', description: 'Can create, edit, and delete rewards.' },
  { id: 'perm-4', name: 'View Financials', description: 'Can view financial reports and transactions.' },
  { id: 'perm-5', name: 'Manage Settings', description: 'Can edit platform settings.' },
];

export const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Has all permissions.',
    permissions: ['perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-5'],
  },
  {
    id: 'role-2',
    name: 'Moderator',
    description: 'Can manage campaigns and rewards.',
    permissions: ['perm-2', 'perm-3'],
  },
  {
    id: 'role-3',
    name: 'Finance',
    description: 'Can view financial data.',
    permissions: ['perm-4'],
  },
  {
    id: 'role-4',
    name: 'Support',
    description: 'Can manage users.',
    permissions: ['perm-1'],
  },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'log-1', userId: 'admin-01', userName: 'Admin User', action: 'Created Campaign', details: 'Campaign ID: camp-004', timestamp: new Date('2024-11-08T10:00:00Z') },
  { id: 'log-2', userId: 'support-01', userName: 'Support User', action: 'Deleted User', details: 'User ID: user-123', timestamp: new Date('2024-11-08T10:05:00Z') },
  { id: 'log-3', userId: 'admin-01', userName: 'Admin User', action: 'Updated Role', details: 'Role: Moderator', timestamp: new Date('2024-11-08T10:10:00Z') },
  { id: 'log-4', userId: 'finance-01', userName: 'Finance User', action: 'Viewed Financials', details: 'Accessed payment history', timestamp: new Date('2024-11-08T10:15:00Z') },
];
