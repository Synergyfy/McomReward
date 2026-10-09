export interface ProgrammeTask {
  taskId: string;
  title: string;
  description: string;
  deadlineDays: number;
  rewardPoints: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
}

export interface PlatformEntitlement {
  version: '2026-10-01';

  targetPlatform: {
    clientId: string;
    platformSlug: string;
    name: string;
  };

  access: {
    hasAccess: boolean;
    accessType: 'PAID_MEMBERSHIP' | 'TRIAL_PROGRAMME' | 'DIRECT_PACKAGE' | 'NONE';
    reason?:
      | 'PLATFORM_NOT_IN_MEMBERSHIP'
      | 'TRIAL_NO_TASKS'
      | 'TRIAL_EXPIRED'
      | 'UNVERIFIED'
      | 'MEMBERSHIP_EXPIRED'
      | 'NO_ACTIVE_ENTITLEMENT';
    upgradeUrl: string;
  };

  plan: {
    planId: string;
    planName: string;
    source: 'membership' | 'trial' | 'direct';
    status: 'active' | 'trial' | 'expired';
    billingCycle?: string | null;
    expiresAt?: string | null;
    quotas: Record<string, unknown>;
    limits: Record<string, unknown>;
    features: string[];
  } | null;

  membershipContext: {
    membershipPlanName: string | null;
    membershipLevel: string;
    membershipStatus: string;
    isIncludedInMembership: boolean;
  };

  trialContext: {
    isInTrial: boolean;
    hasPaidVerificationFee: boolean;
    trialExpiresAt: string | null;
    daysRemaining: number;
    programmeTasks: ProgrammeTask[];
  };
}
