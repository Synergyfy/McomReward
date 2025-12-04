export enum GuideStep {
  PROFILE = 'PROFILE',
  REWARD = 'REWARD',
  CAMPAIGN = 'CAMPAIGN',
  STAFF = 'STAFF',
  COMPLETED = 'COMPLETED',
}

export interface GuideStepContent {
  title: string;
  description: string;
  targetRoute: string;
  actionLabel: string;
}

export const GUIDE_CONTENT: Record<GuideStep, GuideStepContent | null> = {
  [GuideStep.PROFILE]: {
    title: 'Complete Your Profile',
    description: 'First, let\'s set up your business profile with your logo, address, and contact details.',
    targetRoute: '/dashboard/profile',
    actionLabel: 'Go to Profile',
  },
  [GuideStep.REWARD]: {
    title: 'Create Your First Reward',
    description: 'Great! Now create a reward that your customers can redeem.',
    targetRoute: '/dashboard/rewards',
    actionLabel: 'Go to Rewards',
  },
  [GuideStep.CAMPAIGN]: {
    title: 'Launch a Campaign',
    description: 'Now, create a campaign to distribute your rewards and engage customers.',
    targetRoute: '/dashboard/campaigns/create',
    actionLabel: 'Create Campaign',
  },
  [GuideStep.STAFF]: {
    title: 'Add Staff Members',
    description: 'Finally, add staff members who can help manage your store and scan rewards.',
    targetRoute: '/dashboard/staff',
    actionLabel: 'Go to Staff',
  },
  [GuideStep.COMPLETED]: null,
};

export const GUIDE_STEPS_ORDER = [
  GuideStep.PROFILE,
  GuideStep.REWARD,
  GuideStep.CAMPAIGN,
  GuideStep.STAFF,
  GuideStep.COMPLETED,
];
